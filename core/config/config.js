const const_value_default = {
    'MODE_DEBUG'                    : false,
    'MODE_TEST_NETWORK'             : false,
    'NODE_PORT_API'                 : 5500,
    'NODE_HOST'                     : 'localhost',
    'DATA_BASE_DIR_MAIN_NETWORK'    : './millix',
    'DATA_BASE_DIR_TEST_NETWORK'    : './millix-testnet',
};

let environment;
try {
    environment = require('./environment');
    environment = environment.default;
}
catch (ex) { }

function getConstValue(const_name) {
    if (!Object.keys(const_value_default).includes(const_name)) {
        throw 'const_value_default is not defined for ' + const_name;
    }

    let value = const_value_default[const_name];
    if (environment && typeof (environment[const_name]) !== 'undefined') {
        value = environment[const_name];
    }

    return value;
}

export const MODE_DEBUG                 = getConstValue('MODE_DEBUG');
export const MODE_TEST_NETWORK          = getConstValue('MODE_TEST_NETWORK');
export const DATA_BASE_DIR_MAIN_NETWORK = getConstValue('DATA_BASE_DIR_MAIN_NETWORK');
export const DATA_BASE_DIR_TEST_NETWORK = getConstValue('DATA_BASE_DIR_TEST_NETWORK');

let DATA_BASE_DIR                       = MODE_TEST_NETWORK ? DATA_BASE_DIR_TEST_NETWORK : DATA_BASE_DIR_MAIN_NETWORK;

export const NODE_PORT_API              = getConstValue('NODE_PORT_API');
export const NODE_HOST                  = getConstValue('NODE_HOST');
export const NODE_KEY_PATH              = DATA_BASE_DIR + '/node.json';