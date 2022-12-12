import logger from '../logger.js';
import TransactionRepository from '../storage/repositories/transactions.js';
import task from '../task.js';
import EthereumBridge from './ethereum-bridge.js';
import config from '../config/config.js';
import MillixBridge from './millix-bridge.js';


class Bridge {
    async initialize() {

        await MillixBridge.initialize();
        await EthereumBridge.initialize();

        task.scheduleTask('mint-transactions', this._processTransactionMint.bind(this), config.BRIDGE_MINT_WAIT_TIME, true);
        task.scheduleTask('burn-transactions', this._processTransactionBurn.bind(this), config.BRIDGE_MINT_WAIT_TIME, true);
    }

    async _processTransactionBurn() {
        const transactions = await TransactionRepository.listTransactionsToBurn();
        logger.debug(`[bridge] ${transactions.length} transactions to burn`);
        for (let transaction of transactions) {
            logger.debug(`[bridge] burning transaction`, transaction.toJSON());
            await MillixBridge.burnWrappedMillix(transaction);
        }
    }

    async _processTransactionMint() {
        const transactions = await TransactionRepository.listTransactionsToMint();
        logger.debug(`[bridge] ${transactions.length} transactions to mint`);
        for (let transaction of transactions) {
            logger.debug(`[bridge] minting transaction`, transaction.toJSON());
            await EthereumBridge.mintWrappedMillix(transaction);
        }
    }
}


export default new Bridge;
