import EthereumClient from './ethereum/client.js';
import logger from '../logger.js';
import config from '../config/config.js';
import BlockSyncRepository from '../storage/repositories/block-sync.js';
import TransactionRepository from '../storage/repositories/transactions.js';
import {convertWrappedMillixToMillix} from '../utils/millix-utils.js';
import task from '../task.js';

const NETWORK = 'ethereum';


class EthereumBridge {
    async initialize() {
        this.contract = EthereumClient.getWrappedMillixContract();
        if (this.contract) {
            await this._processEventsFromLastKnownBlock();
            this._bindBlockchainEventListeners();
            task.scheduleTask('ethereum-block-sync', this._processEventsFromLastKnownBlock.bind(this), config.BRIDGE_ETHEREUM_BLOCK_SYNC_WAIT_TIME, true);
        }

        task.scheduleTask('update-transaction-burned', this._updateTransactionBurned.bind(this), config.BRIDGE_DATA_FETCH_WAIT_TIME, true);
    }

    async _updateTransactionBurned() {
        const transactions = await TransactionRepository.listTransactionBurnedToFinalize();
        for (const transaction of transactions) {
            await TransactionRepository.updateTransactionAsBurned(transaction.transactionIdFrom);
        }
    }

    /**
     * processes every mint and burn event emitted between the tracked block and
     * the latest confirmed block, moving the checkpoint forward as each chunk of
     * blocks is processed. runs on a schedule so that the events missed while the
     * websocket is down are recovered on the next pass.
     *
     * blocks newer than BRIDGE_ETHEREUM_BLOCK_CONFIRMATION_COUNT are never
     * checkpointed: they are handled by the websocket listeners for latency and
     * re-scanned on the next pass, so a reorg cannot drop an event for good.
     */
    async _processEventsFromLastKnownBlock() {
        let fromBlock;
        try {
            fromBlock     = await this._getBlockNumberToSyncFrom();
            const toBlock = (await EthereumClient.getWeb3().eth.getBlockNumber()) - config.BRIDGE_ETHEREUM_BLOCK_CONFIRMATION_COUNT;

            if (toBlock < fromBlock) {
                return;
            }

            logger.debug(`[ethereum-bridge] processing events from block ${fromBlock} to block ${toBlock}`);
            const chunkSize = Math.max(1, config.BRIDGE_ETHEREUM_BLOCK_SYNC_CHUNK_SIZE);
            while (fromBlock <= toBlock) {
                const chunkToBlock = Math.min(fromBlock + chunkSize - 1, toBlock);
                await this._processEvents(fromBlock, chunkToBlock);
                await BlockSyncRepository.updateLastProcessedBlockNumber(NETWORK, chunkToBlock);
                fromBlock = chunkToBlock + 1;
            }
        }
        catch (e) {
            // the checkpoint is left untouched, the next pass retries from the same block
            logger.error(`[ethereum-bridge] error processing events from block ${fromBlock}: ${e}`);
        }
    }

    async _processEvents(fromBlock, toBlock) {
        const mintEvents = await this.contract.getPastEvents('MintWrappedMillix', {
            fromBlock,
            toBlock
        });
        for (const mintEvent of mintEvents) {
            await this._onMintFinished(mintEvent);
        }

        const burnEvents = await this.contract.getPastEvents('UnwrapMillix', {
            fromBlock,
            toBlock
        });
        for (const burnEvent of burnEvents) {
            await this._onBurnStart(burnEvent);
        }
    }

    /**
     * the tracked checkpoint holds the last block fully processed, so the sync
     * resumes on the block right after it. deployments upgrading from before the
     * checkpoint existed fall back to the highest block number registered on a
     * transaction, and a fresh install starts on the contract creation block.
     */
    async _getBlockNumberToSyncFrom() {
        const lastSyncedBlockNumber = await BlockSyncRepository.getLastProcessedBlockNumber(NETWORK);
        if (lastSyncedBlockNumber !== null) {
            return lastSyncedBlockNumber + 1;
        }

        return (await TransactionRepository.getLastProcessedBlockNumber()) || Number(config.BRIDGE_ETHEREUM_CONTRACT_CREATE_BLOCK) || 0;
    }

    _bindBlockchainEventListeners() {
        this.contract.events.MintWrappedMillix({})
            .on('data', this._onMintFinished.bind(this))
            .on('error', err => {
                throw err;
            })
            .on('connected', data => logger.debug(`[ethereum-bridge] connected to ws with session id ${data} for mint events`));

        this.contract.events.UnwrapMillix({})
            .on('data', this._onBurnStart.bind(this))
            .on('error', err => {
                throw err;
            })
            .on('connected', data => logger.debug(`[ethereum-bridge] connected to ws with session id ${data} for burn events`));
    }

    async _onMintFinished(event) {
        logger.debug(`[ethereum-bridge] wmlx minted on transaction ${event.transactionHash} from millix transaction ${event.returnValues.txhash} (block number: ${event.blockNumber})`);
        await TransactionRepository.updateTransactionAsMinted(event.returnValues.txhash, event.transactionHash, event.blockNumber);
    }

    async _onBurnStart(event) {
        const data = event.returnValues;
        if (await TransactionRepository.getTransaction(event.transactionHash)) {
            logger.debug(`[ethereum-bridge] burn transaction ${event.transactionHash} is already registered`);
            return;
        }

        logger.debug(`[ethereum-bridge] ${data.amount} wmlx burn on transaction ${event.transactionHash} from ethereum address ${data.from} to millix address ${data.to} (block number: ${event.blockNumber})`);
        const amount = parseInt(data.amount);
        try {
            await TransactionRepository.registerBurnTransaction(event.transactionHash, data.from, amount, NETWORK, event.blockNumber, 'millix', data.to, convertWrappedMillixToMillix(amount));
        }
        catch (e) {
            logger.warn(`[ethereum-bridge] on burn wmlx: ${e}`);
        }
    }

    async mintWrappedMillix(transaction) {
        if (!this.contract) {
            logger.error(`[ethereum-bridge] wmlx ethereum smart contract is not configured`);
            return;
        }

        if (!transaction.addressTo || !EthereumClient.getWeb3().utils.isAddress(transaction.addressTo) ||
            !Number.isInteger(transaction.amountTo) || transaction.amountTo < 0) {
            throw Error(`[ethereum-bridge] invalid mint transaction ${transaction.transactionIdFrom}`);
        }

        try{
            await TransactionRepository.updateTransactionAsMintStarted(transaction.transactionIdFrom);
            await this.contract.methods.mint(transaction.addressTo, transaction.amountTo, transaction.transactionIdFrom).send({
                from: config.BRIDGE_ETHEREUM_CONTRACT_OWNER_ADDRESS,
                gas : 100000
            });
        } catch (e) {
            await TransactionRepository.hibernateTransaction(transaction.transactionIdFrom);
            logger.error(e);
        }
    }

}


export default new EthereumBridge;
