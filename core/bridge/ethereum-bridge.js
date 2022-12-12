import EthereumClient from './ethereum/client.js';
import logger from '../logger.js';
import config from '../config/config.js';
import TransactionRepository from '../storage/repositories/transactions.js';


class EthereumBridge {
    async initialize() {
        this.contract = EthereumClient.getWrappedMillixContract();
        await this._processEventsFromLastKnownBlock();
        this._bindBlockchainEventListeners();
    }

    async _processEventsFromLastKnownBlock() {
        const lastBlockNumber = (await TransactionRepository.getLastProcessedBlockNumber()) || config.BRIDGE_ETHEREUM_CONTRACT_CREATE_BLOCK;
        const lastMintEvents  = await this.contract.getPastEvents('MintWrappedMillix', {
            fromBlock: lastBlockNumber,
            toBlock  : 'latest'
        });
        lastMintEvents.forEach(mintEvent => this._onMintFinished(mintEvent));

        const lastBurnEvents = await this.contract.getPastEvents('UnwrapMillix', {
            fromBlock: lastBlockNumber,
            toBlock  : 'latest'
        });
        lastBurnEvents.forEach(burnEvent => this._onBurnStart(burnEvent));
    }

    _bindBlockchainEventListeners() {
        this.contract.events.MintWrappedMillix({})
            .on('data', this._onMintFinished.bind(this))
            .on('error', err => {
                throw err;
            })
            .on('connected', data => logger.debug(`[ethereum-bridge] connected to ws with session id ${data} for mint events`));

        this.contract.events.UnwrapMillix({})
            .on('data', this._onBurnStart.bind(this))
            .on('error', err => {
                throw err;
            })
            .on('connected', data => logger.debug(`[ethereum-bridge] connected to ws with session id ${data} for burn events`));
    }

    async _onMintFinished(event) {
        logger.debug(`[ethereum-bridge] wmlx minted on transaction ${event.transactionHash} from millix transaction ${event.returnValues.txhash} (block number: ${event.blockNumber})`);
        await TransactionRepository.updateTransactionAsMinted(event.returnValues.txhash, event.transactionHash, event.blockNumber);
    }

    async _onBurnStart(event) {
        const data = event.returnValues;
        logger.debug(`[ethereum-bridge] ${data.amount} wmlx burn on transaction ${event.transactionHash} from ethereum address ${data.from} to millix address ${data.to} (block number: ${event.blockNumber})`);
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
