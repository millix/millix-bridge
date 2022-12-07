import TransactionModel from '../models/transaction.model.js';


class TransactionRepository {
    async registerNewTransaction(transactionIdFrom, networkFrom) {
        return await TransactionModel.create({
            transactionIdFrom,
            networkFrom,
            processingState: 'NEW'
        });
    }

    async updateTransactionState(transactionIdFrom, newTransactionState) {
        return await TransactionModel.update({
            transactionState: newTransactionState
        }, {
            where: {transactionIdFrom}
        });
    }

    async updateProcessingState(transactionIdFrom, newProcessingState) {
        return await TransactionModel.update({
            processingState: newProcessingState
        }, {
            where: {transactionIdFrom}
        });
    }

    async listTransactionsToMint() {
        return await TransactionModel.findAll({
            where: {
                processingState : 'HIBERNATED',
                transactionState: 'VALID'
            }
        });
    }
}


export default new TransactionRepository();
