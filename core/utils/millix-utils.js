import config, {BRIDGE_ADDRESS_VERSION} from '../config/config.js';
import _ from 'lodash';

export const convertMillixToWrappedMillix = (millixAmount) => {
    return Math.floor(millixAmount / 1000000);
};

export const convertWrappedMillixToMillix = (wmlxAmount) => {
    return Math.floor(wmlxAmount * 1000000);
};

export const getBridgeMappingData = (transaction) => {
    return transaction.transaction_output_attribute?.transaction_output_metadata?.bridge_mapping;
};

export const isMintTransaction = (transaction) => {
    return transaction.version === config.BRIDGE_TRANSACTION_VERSION_MINT;
};

export const isValidBridgeTransaction = (transaction) => {
    if (transaction.version !== config.BRIDGE_TRANSACTION_VERSION_BURN && transaction.version !== config.BRIDGE_TRANSACTION_VERSION_MINT) {
        return false;
    }

    const isBridgeMint = isMintTransaction(transaction);

    const bridgeMapping = getBridgeMappingData(transaction);
    if (!bridgeMapping || !bridgeMapping.address ||
        (isBridgeMint && !bridgeMapping.network)) {
        return false;
    }

    if (isBridgeMint) {
        // 3 outputs (destination, bridge fees, and proxy fees)
        // destination address should be a bridge address
        const mintOutput    = _.find(transaction.transaction_output_list, {output_position: 0});
        const mintFeeOutput = _.find(transaction.transaction_output_list, {output_position: 1});
        return transaction.transaction_output_list.length >= 3 && hasAddressVersion(mintOutput.address, config.BRIDGE_ADDRESS_VERSION)
               && mintOutput.address_key_identifier === mintFeeOutput.address_key_identifier;
    }

    // if burn
    // 2 or 3 outputs (destination, [change,] and proxy fees)
    // if there is a change it must be sent to a bridge address
    if (transaction.transaction_output_list.length === 3) {
        const burnChange = _.find(transaction.transaction_output_list, {output_position: 1});
        return hasAddressVersion(burnChange.address_version, config.BRIDGE_ADDRESS_VERSION);
    }

    return true;

};

export const hasAddressVersion = (address, version) => {
    return address.includes(version);
};
