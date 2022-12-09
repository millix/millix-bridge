import TransactionModel from '../models/transaction.model.js';
import {Op} from 'sequelize';


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

    async updateTransaction(transactionIdFrom, addressFrom, amountFrom, networkTo, addressTo, amountTo, event) {
        return await TransactionModel.update({
            addressFrom,
            amountFrom,
            networkTo,
            addressTo,
            amountTo,
            event
        }, {
            where: {transactionIdFrom}
        });
    }

    async updateTransactionIdTo(transactionIdFrom, transactionIdTo) {
        return await TransactionModel.update({
            transactionIdTo
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
                transactionState: 'VALID',
                addressFrom     : {
                    [Op.not]: null
                },
                transactionIdTo : {
                    [Op.is]: null
                }
            }
        });
    }

    async listTransactionsMissingData() {
        return await TransactionModel.findAll({
            where: {
                addressFrom: {
                    [Op.is]: null
                }
            }
        });
    }

    async deleteTransaction(transactionIdFrom) {
        return await TransactionModel.delete({
            where: {
                transactionIdFrom
            }
        });
    }
}


export default new TransactionRepository();
