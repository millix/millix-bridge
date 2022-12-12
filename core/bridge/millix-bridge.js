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
import {convertMillixToWrappedMillix, getBridgeMappingData, isMintTransaction, isValidBridgeTransaction} from '../utils/millix-utils.js';
import {PROCESSING_STATE, EVENT} from '../utils/transaction-utils.js';
import {isMintVested} from '../utils/transaction-utils.js';


class MillixBridge {
    async initialize() {
        this.server = new Server();
        await this.server.start();
        await this._initializeNodeEndpoint();
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

                // we dont care about any other transaction but mint transactions on millix network
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
