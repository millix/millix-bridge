import TransactionModel from '../models/transaction.model.js';
import {Op} from 'sequelize';
import {PROCESSING_STATE, TRANSACTION_STATE} from '../../utils/transaction-utils.js';


class TransactionRepository {
    async registerNewTransaction(transactionIdFrom, networkFrom) {
        return await TransactionModel.create({
            transactionIdFrom,
            networkFrom,
            processingState: PROCESSING_STATE.NEW
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

    async updateTransactionAsMinted(transactionIdFrom, transactionIdTo, blockNumber) {
        return await TransactionModel.update({
            transactionIdTo,
            blockNumber,
            processingState: PROCESSING_STATE.MINTED
        }, {
            where: {transactionIdFrom}
        });
    }

    async updateTransactionAsMintStarted(transactionIdFrom) {
        return await TransactionModel.update({
            processingState: PROCESSING_STATE.MINT_STARTED
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
                processingState : PROCESSING_STATE.HIBERNATED,
                transactionState: TRANSACTION_STATE.VALID,
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

    async getLastProcessedBlockNumber() {
        return await TransactionModel.max('blockNumber');
    }
}


export default new TransactionRepository();
