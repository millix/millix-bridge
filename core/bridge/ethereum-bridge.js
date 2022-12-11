import EthereumClient from './ethereum/client.js';
import logger from '../logger.js';
import config from '../config/config.js';
import TransactionRepository from '../storage/repositories/transactions.js';


class EthereumBridge {
    async initialize() {
        this.contract = EthereumClient.getWrappedMillixContract();

        this.contract.events.MintWrappedMillix({})
            .on('data', async event => {
                logger.debug(`[ethereum-bridge] wmlx minted on transaction ${event.transactionHash} from millix transaction ${event.returnValues.txhash}`);
                await TransactionRepository.updateTransactionAsMinted(event.returnValues.txhash, event.transactionHash);
            })
            .on('changed', changed => logger.debug(`[ethereum-bridge] websocked changed: ${changed}`))
            .on('error', err => {
                throw err;
            })
            .on('connected', data => logger.debug(`[ethereum-bridge] connected to ws with session id ${data}`));
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

        this.contract.methods.mint(transaction.addressTo, transaction.amountTo, transaction.transactionIdFrom).send({
            from: config.BRIDGE_ETHEREUM_CONTRACT_OWNER_ADDRESS,
            gas : 100000
        });
        await TransactionRepository.updateTransactionAsMintStarted(transaction.transactionIdFrom);
    }

}


export default new EthereumBridge;
