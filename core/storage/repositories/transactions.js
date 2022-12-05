import TransactionModel from '../models/transaction.model.js';


class TransactionRepository {
    async registerNewTransaction(transactionIdFrom, networkFrom) {
        return await TransactionModel.create({
            transactionIdFrom,
            networkFrom,
            processingState: 'NEW'
        });
    }

    async updateTransactionProcessingState(transactionIdFrom, newProcessingState) {
        return await TransactionModel.update({
            processingState: newProcessingState
        }, {
            where: {transactionIdFrom}
        });
    }
}


export default new TransactionRepository();
