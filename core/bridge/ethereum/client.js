import WrappedMillix from './contracts/WrappedMillix.json' assert {type: 'json'};
import Web3 from 'web3';
import config from '../../config/config.js';


class EthereumClient {
    constructor() {
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.BRIDGE_ETHEREUM_PROVIDER, {
            reconnect   : {
                auto     : true,
                delay    : 1000,
                onTimeout: false
            },
            timeout     : 5000,
            clientConfig: {
                keepalive                       : true,
                keepaliveInterval               : 1000,
                dropConnectionOnKeepaliveTimeout: true,
                keepaliveGracePeriod            : 4000
            }
        }));
        if (config.BRIDGE_ETHEREUM_WALLET_PRIVATE_KEY) {
            this.web3.eth.accounts.wallet.add(config.BRIDGE_ETHEREUM_WALLET_PRIVATE_KEY);
        }
    }

    getWeb3() {
        return this.web3;
    }

    getWrappedMillixContract() {
        if (!config.BRIDGE_ETHEREUM_CONTRACT_WRAPPED_MILLIX) {
            return null;
        }
        return new this.web3.eth.Contract(WrappedMillix.abi, config.BRIDGE_ETHEREUM_CONTRACT_WRAPPED_MILLIX);
    }
}


export default new EthereumClient;

