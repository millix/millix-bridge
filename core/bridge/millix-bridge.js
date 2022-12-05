import cron from 'node-cron';
import Server from '../api/server.js';
import logger from '../logger.js';
import TransactionRepository from '../storage/repositories/transactions.js';


class MillixBridge {
    async initialize() {
        this.server = new Server();
        await this.server.start();
        logger.debug('[api] api started');

        cron.schedule('* * * * *', () => {
            console.log('[main] fecting new transactions');
            //faz fetch da bd do nó
            //...
        });
    }

    async onTransactionNew(transactionId) {
        await TransactionRepository.registerNewTransaction(transactionId, 'millix');
    }

    async onTransactionHibernate(transactionId) {

    }

    async onTransactionValidationUpdate(transactionId, updateStatus) {

    }

}


export default new MillixBridge;
