import Server from '../api/server.js';
import logger from '../logger.js';
import TransactionRepository from '../storage/repositories/transactions.js';
import task from '../task.js';
import EthereumBridge from './ethereum-bridge.js';


class MillixBridge {
    async initialize() {
        this.server = new Server();
        await this.server.start();
        logger.debug('[millix-bridge] api started');

        task.scheduleTask('mint-transactions', this._processTransactionMint.bind(this), 30000, true);
    }

    async _processTransactionMint() {
        const transactions = await TransactionRepository.listTransactionsToMint();
        logger.debug(`[millix-bridge] ${transactions.length} transactions to mint`);
        for (let transaction of transactions) {
            logger.debug(`[millix-bridge] minting transaction`, transaction.toJSON());
            await EthereumBridge.mintWrappedMillix(transaction);
        }
    }

    async onTransactionNew(transactionId) {
        await TransactionRepository.registerNewTransaction(transactionId, 'millix');
    }

    async onTransactionHibernate(transactionId) {
        await TransactionRepository.updateProcessingState(transactionId, 'HIBERNATED');
    }

    async onTransactionValidationUpdate(transactionId, updateStatus) {
        await TransactionRepository.updateTransactionState(transactionId, updateStatus.toUpperCase());
    }

}


export default new MillixBridge;
