import TransactionModel from '../models/transaction.model.js';
import {Op} from 'sequelize';
import {EVENT, PROCESSING_STATE, TRANSACTION_STATE} from '../../utils/transaction-utils.js';


class TransactionRepository {
    async registerNewTransaction(transactionIdFrom, networkFrom) {
        return await TransactionModel.create({
            transactionIdFrom,
            networkFrom,
            processingState: PROCESSING_STATE.NEW
        });
    }

    async updateTransactionState(transactionId, newTransactionState) {
        await TransactionModel.update({
            transactionState: newTransactionState
        }, {
            where: {
                transactionIdFrom: transactionId
            }
        });

        await TransactionModel.update({
            transactionState: newTransactionState
        }, {
            where: {
                transactionIdTo: transactionId
            }
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

    async hibernateTransaction(transactionId) {
        await TransactionModel.update({
            processingState: PROCESSING_STATE.HIBERNATED
        }, {
            where: {
                transactionIdFrom: transactionId
            }
        });

        await TransactionModel.update({
            processingState: PROCESSING_STATE.HIBERNATED
        }, {
            where: {
                transactionIdTo: transactionId
            }
        });
    }

    async listTransactionToMintPendingHibernation() {
        return await TransactionModel.findAll({
            where: {
                processingState: PROCESSING_STATE.NEW,
                event          : {
                    [Op.ne]: EVENT.BURN
                }
            }
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
        return await TransactionModel.destroy({
            where: {
                transactionIdFrom
            }
        });
    }

    async getLastProcessedBlockNumber() {
        return await TransactionModel.max('blockNumber');
    }

    async registerBurnTransaction(transactionIdFrom, addressFrom, amountFrom, networkFrom, blockNumber, networkTo, addressTo, amountTo) {
        return await TransactionModel.create({
            transactionIdFrom,
            addressFrom,
            amountFrom,
            networkFrom,
            networkTo,
            blockNumber,
            addressTo,
            amountTo,
            event          : EVENT.BURN,
            processingState: PROCESSING_STATE.NEW
        });
    }

    async listTransactionsToBurn() {
        return await TransactionModel.findAll({
            where: {
                processingState: PROCESSING_STATE.NEW,
                event          : EVENT.BURN,
                transactionIdTo: {
                    [Op.is]: null
                }
            }
        });
    }

    async updateTransactionAsBurnStarted(transactionIdFrom, transactionIdTo) {
        return await TransactionModel.update({
            processingState: PROCESSING_STATE.BURN_STARTED,
            transactionIdTo
        }, {
            where: {transactionIdFrom}
        });
    }

    async updateTransactionAsBurned(transactionIdFrom) {
        return await TransactionModel.update({
            processingState: PROCESSING_STATE.BURNED
        }, {
            where: {transactionIdFrom}
        });
    }

    async listTransactionBurnedToFinalize() {
        return await TransactionModel.findAll({
            where: {
                processingState : PROCESSING_STATE.HIBERNATED,
                transactionState: TRANSACTION_STATE.VALID,
                event           : EVENT.BURN
            }
        });
    }
}


export default new TransactionRepository();
