import Server from '../api/server.js';
import logger from '../logger.js';
import TransactionRepository from '../storage/repositories/transactions.js';
import VestingRuleRepository from '../storage/repositories/vesting-rule.js';
import task from '../task.js';
import config from '../config/config.js';
import {promisify} from 'util';
import fs from 'fs';
import _ from 'lodash';
import fetch from 'node-fetch';
import {convertMillixToWrappedMillix, getBridgeMappingData, isMintTransaction, isValidBridgeTransaction, parseMillixAddress} from '../utils/millix-utils.js';
import {PROCESSING_STATE, EVENT} from '../utils/transaction-utils.js';
import {isMintVested} from '../utils/transaction-utils.js';


class MillixBridge {
    async initialize() {
        this.server = new Server();
        await this.server.start();
        await this._initializeNodeEndpoint();
        this.millixNetworkBridgeAddress = `${config.BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER}${config.BRIDGE_ADDRESS_VERSION}${config.BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER}`;
        logger.debug('[millix-bridge] api started');
        task.scheduleTask('fetch-transaction-data', this._fetchMintTransactionData.bind(this), config.BRIDGE_DATA_FETCH_WAIT_TIME, true);
    }

    async _fetchMintTransactionData() {
        const transactions = await TransactionRepository.listMintTransactionsMissingData();
        logger.debug(`[millix-bridge] fetch data for ${transactions.length} transactions`);
        for (let transaction of transactions) {
            logger.debug(`[millix-bridge] fetch data for transaction with hash: ${transaction.transactionIdFrom}`);
            try {
                const data = await (await fetch(`${this.millixNodeEndpoint}/IBHgAmydZbmTUAe8?p0=${transaction.transactionIdFrom}&p1=${config.NODE_SHARD_ID}`)).json();
                if (!isValidBridgeTransaction(data)) {
                    logger.warn(`[millix-bridge] skip transaction with hash ${transaction.transactionIdFrom}`);
                    await TransactionRepository.deleteTransaction(transaction.transactionIdFrom);
                    continue;
                }

                const input       = _.find(data.transaction_input_list, {input_position: 0});
                const addressFrom = input.address;

                const outputMint = _.find(data.transaction_output_list, {output_position: 0});
                const amountFrom = outputMint.amount;
                const amountTo   = convertMillixToWrappedMillix(amountFrom);

                const bridgeMappingData = getBridgeMappingData(data);
                if (isMintTransaction(data)) {
                    // TO DO
                    // await isMintVested(data);

                    await TransactionRepository.updateTransaction(transaction.transactionIdFrom, addressFrom, amountFrom, bridgeMappingData.network, bridgeMappingData.address, amountTo, EVENT.MINT);
                }

                // we dont care about any other transaction but mint
                // transactions on millix network
                logger.warn(`[millix-bridge] skip transaction with hash ${transaction.transactionIdFrom}`);
                await TransactionRepository.deleteTransaction(transaction.transactionIdFrom);
            }
            catch (e) {
                logger.error(`[millix-bridge] error fetching data from transaction hash ${transaction.transactionIdFrom} ${e}`);
            }
        }
    }

    async burnWrappedMillix(transaction) {
        if (!this.millixNodeEndpoint) {
            logger.error(`[millix-bridge] millix node api is not configured`);
            return;
        }

        const outputs       = await this._getOutputsToFundBurnTransaction(transaction.amountTo);
        const address       = parseMillixAddress(transaction.addressTo);
        const burnFeeAmount = 1000000;
        const data          = {
            transaction_input_list      : _.map(outputs, output => ({
                address_base           : config.BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER,
                address_version        : config.BRIDGE_ADDRESS_VERSION,
                address_key_identifier : config.BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER,
                output_transaction_id  : output.transaction_id,
                output_shard_id        : output.shard_id,
                output_position        : output.output_position,
                output_transaction_date: output.transaction_date
            })),
            transaction_output_list     : [
                {
                    address_base          : address.address_base,
                    address_version       : address.address_version,
                    address_key_identifier: address.address_key_identifier,
                    amount                : transaction.amountTo
                }
            ],
            transaction_output_fee      : {
                fee_type: 'transaction_fee_default',
                amount  : burnFeeAmount
            },
            transaction_output_attribute: {
                bridge_mapping: {
                    network       : transaction.networkFrom,
                    address       : transaction.addressFrom,
                    transaction_id: transaction.transactionIdFrom
                }
            },
            transaction_version         : config.BRIDGE_TRANSACTION_VERSION_BURN
        };

        let remainingOutputAmount = _.sumBy(outputs, 'amount') - transaction.amountTo - burnFeeAmount;
        if (remainingOutputAmount > 0) {
            data.transaction_output_list.push({
                address_base          : config.BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER,
                address_version       : config.BRIDGE_ADDRESS_VERSION,
                address_key_identifier: config.BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER,
                amount                : remainingOutputAmount
            });
        }

        const signedTransactionList = await this.getSignedTransaction(data, {[config.BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER]: config.BRIDGE_MILLIX_WALLET_PRIVATE_KEY}, {[config.BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER]: config.BRIDGE_MILLIX_WALLET_PUBLIC_KEY});
        const transactionIdTo       = signedTransactionList[signedTransactionList.length - 1].transaction_id;
        await TransactionRepository.updateTransactionAsBurnStarted(transaction.transactionIdFrom, transactionIdTo);
        this.propagateSignedTransaction(signedTransactionList).then(_ => _);
    }

    async getSignedTransaction(data, privateKeyMap, publicKeyMap) {
        return await (await fetch(`${this.millixNodeEndpoint}/RVBqKlGdk9aEhi5J?p0=${JSON.stringify(data)}&p1=${JSON.stringify(privateKeyMap)}&p2=${JSON.stringify(publicKeyMap)}`)).json();
    }

    async propagateSignedTransaction(data) {
        return await (await fetch(`${this.millixNodeEndpoint}/VnJIBrrM0KY3uQ9X`, {
            method : 'post',
            body   : JSON.stringify({p0: data}),
            headers: {'Content-Type': 'application/json'}
        })).json();
    }

    async _getOutputsToFundBurnTransaction(amount) {
        if (!amount) {
            throw new Error(`[millix-bridge] invalid amount ${amount}`);
        }

        let outputs = await this._getBurnableOutputList();
        outputs     = _.sortBy(outputs, 'amount');

        let remainingAmount = amount;
        const outputsToUse  = [];
        for (const output of outputs) {
            remainingAmount -= output.amount;
            outputsToUse.push(output);
            if (remainingAmount <= 0) {
                break;
            }
        }

        if (remainingAmount > 0) {
            throw new Error(`[millix-bridge] available outputs cannot fund a transaction of ${amount} mlx (requires more ${remainingAmount} mlx)`);
        }

        return outputsToUse;
    }

    async _getBurnableOutputList() {
        let transactionOutputsList = await (await fetch(`${this.millixNodeEndpoint}/FDLyQ5uo5t7jltiQ?p3=${config.BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER}&p4=0&p7=1&p10=0`)).json();
        if (!transactionOutputsList || transactionOutputsList.length === 0 || transactionOutputsList.api_status === 'fail') {
            return [];
        }
        return transactionOutputsList.filter(output => output.status === 2 && output.transaction_status === 2 && output.address === this.millixNetworkBridgeAddress);
    }

    async onTransactionNew(transactionId) {
        await TransactionRepository.registerNewTransaction(transactionId, 'millix');
    }

    async onTransactionHibernate(transactionId) {
        await TransactionRepository.updateProcessingState(transactionId, PROCESSING_STATE.HIBERNATED);
    }

    async onTransactionValidationUpdate(transactionId, updateStatus) {
        await TransactionRepository.updateTransactionState(transactionId, updateStatus.toUpperCase());
    }

    async _initializeNodeEndpoint() {
        const data = JSON.parse((await promisify(fs.readFile)(config.NODE_KEY_PATH)).toString());

        if (!data.node_id || !data.node_signature) {
            throw Error(`[api] cannot read millix node information from ${config.NODE_KEY_PATH}`);
        }

        this.millixNodeEndpoint = `https://${config.NODE_HOST}:${config.NODE_PORT_API}/api/${data.node_id}/${data.node_signature}`;
        logger.debug(`[api] node api loaded: ${this.millixNodeEndpoint}`);
    }
}


export default new MillixBridge;
