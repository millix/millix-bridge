import is from 'is2'


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

export const isMintVested = (rules, data) =>{
    
    // TO DO - Maybe run some test on rules and data . Ex: verify if the rules/data is empty/null/undefined
    for(let rule of rules) {
        if(is[rule.operator](data[rule.field], rule.value)){
            return true
        }
    }

    return false
}
