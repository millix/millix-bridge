import logger from '../logger.js';

export const PROCESSING_STATE = {
    NEW         : 'NEW',
    HIBERNATED  : 'HIBERNATED',
    MINT_STARTED: 'MINT_STARTED',
    BURN_STARTED: 'BURN_STARTED',
    BURNED      : 'BURNED',
    MINTED      : 'MINTED'
};

export const TRANSACTION_STATE = {
    VALID: 'VALID'
};

export const EVENT = {
    MINT: 'MINT',
    BURN: 'BURN'
};

export const isMintVested = (data) => {
    // TO DO - logic here
    logger.debug(data);
};
