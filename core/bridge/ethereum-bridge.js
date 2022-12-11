import EthereumClient from './ethereum/client.js';
import logger from '../logger.js';
import config from '../config/config.js';
import TransactionRepository from '../storage/repositories/transactions.js';


class EthereumBridge {
    async initialize() {
        this.contract = EthereumClient.getWrappedMillixContract();
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

        const result = await this.contract.methods.mint(transaction.addressTo, transaction.amountTo).send({
            from: config.BRIDGE_ETHEREUM_CONTRACT_OWNER_ADDRESS,
            gas : 100000
        });
        await TransactionRepository.updateTransactionAsMinted(transaction.transactionIdFrom, result.transactionHash);
        logger.debug(`[ethereum-bridge] ${transaction.amountTo} wmlx minted on transaction ${result.transactionHash} to address ${transaction.addressTo}`);
    }

}


export default new EthereumBridge;
