import logger from "../logger.js";
import config from "../config/config.js";
import TransactionRepository from "../storage/repositories/transactions.js";
import { convertWrappedMillixToMillix } from "../utils/millix-utils.js";
import task from "../task.js";

class Web3Bridge {

    constructor(client) {
        this.client = client;
        this.contract = client.getWrappedMillixContract();
    }

    async initialize() {
        if (this.contract) {
            await this._processEventsFromLastKnownBlock();
            this._bindBlockchainEventListeners();
        }

        task.scheduleTask(
            "update-transaction-burned",
            this._updateTransactionBurned.bind(this),
            config.BRIDGE_DATA_FETCH_WAIT_TIME,
            true
        );
    }

    async _updateTransactionBurned() {
        const transactions =
            await TransactionRepository.listTransactionBurnedToFinalize();
        for (const transaction of transactions) {
            await TransactionRepository.updateTransactionAsBurned(
                transaction.transactionIdFrom
            );
        }
    }

    async _processEventsFromLastKnownBlock() {
        const lastBlockNumber =
            (await TransactionRepository.getLastProcessedBlockNumber()) ||
            this.client.getContractCreateBlock();
        const lastMintEvents = await this.contract.getPastEvents(
            "MintWrappedMillix",
            {
                fromBlock: lastBlockNumber,
                toBlock: "latest",
            }
        );
        lastMintEvents.forEach((mintEvent) => this._onMintFinished(mintEvent));

        const lastBurnEvents = await this.contract.getPastEvents(
            "UnwrapMillix",
            {
                fromBlock: lastBlockNumber,
                toBlock: "latest",
            }
        );
        lastBurnEvents.forEach((burnEvent) => this._onBurnStart(burnEvent));
    }

    _bindBlockchainEventListeners() {
        this.contract.events
            .MintWrappedMillix({})
            .on("data", this._onMintFinished.bind(this))
            .on("error", (err) => {
                throw err;
            })
            .on("connected", (data) =>
                logger.debug(
                    `[ethereum-bridge] connected to ws with session id ${data} for mint events`
                )
            );

        this.contract.events
            .UnwrapMillix({})
            .on("data", this._onBurnStart.bind(this))
            .on("error", (err) => {
                throw err;
            })
            .on("connected", (data) =>
                logger.debug(
                    `[${this.client.network}-bridge] connected to ws with session id ${data} for burn events`
                )
            );
    }

    async _onMintFinished(event) {
        logger.debug(
            `[${this.client.network}-bridge] wmlx minted on transaction ${event.transactionHash} from millix transaction ${event.returnValues.txhash} (block number: ${event.blockNumber})`
        );
        await TransactionRepository.updateTransactionAsMinted(
            event.returnValues.txhash,
            event.transactionHash,
            event.blockNumber
        );
    }

    async _onBurnStart(event) {
        const data = event.returnValues;
        logger.debug(
            `[${this.client.network}-bridge] ${data.amount} wmlx burn on transaction ${event.transactionHash} from ${this.client.network} address ${data.from} to millix address ${data.to} (block number: ${event.blockNumber})`
        );
        const amount = parseInt(data.amount);
        try {
            await TransactionRepository.registerBurnTransaction(
                event.transactionHash,
                data.from,
                amount,
                this.client.network,
                event.blockNumber,
                "millix",
                data.to,
                convertWrappedMillixToMillix(amount)
            );
        } catch (e) {
            logger.warn(`[${this.client.network}-bridge] on burn wmlx: ${e}`);
        }
    }

    async mintWrappedMillix(transaction) {
        if (!this.contract) {
            logger.error(
                `[${this.client.network}-bridge] wmlx ${this.client.network} smart contract is not configured`
            );
            return;
        }

        if (
            !transaction.addressTo ||
            !this.client.getWeb3().utils.isAddress(transaction.addressTo) ||
            !Number.isInteger(transaction.amountTo) ||
            transaction.amountTo < 0
        ) {
            throw Error(
                `[${this.client.network}-bridge] invalid mint transaction ${transaction.transactionIdFrom}`
            );
        }

        try {
            await TransactionRepository.updateTransactionAsMintStarted(
                transaction.transactionIdFrom
            );
            await this.contract.methods
                .mint(
                    transaction.addressTo,
                    transaction.amountTo,
                    transaction.transactionIdFrom
                )
                .send({
                    from: this.client.getContractOwnerAddress(),
                    gas: 100000,
                });
        } catch (e) {
            await TransactionRepository.hibernateTransaction(
                transaction.transactionIdFrom
            );
            logger.error(e);
        }
    }
}

export default Web3Bridge;
