const const_value_default = {
    MODE_DEBUG: false,

    DATABASE_HOST         : 'localhost',
    DATABASE_NAME         : 'millix_bridge',
    DATABASE_AUTH_USER    : 'root',
    DATABASE_AUTH_PASSWORD: '',
    DATABASE_PORT         : 3306,
    DATABASE_DIALECT      : 'mysql',
    DATABASE_ENABLE_LOGS  : false,

    MODE_TEST_NETWORK            : false,
    NODE_PORT_API                : 5500,
    NODE_HOST                    : 'localhost',
    NODE_SHARD_ID                : 'qGuUgMMVmaCvqrvoWG6zARjkrujGMpzJmpNhBgz1y3RjBG7ZR',
    NODE_DATA_FOLDER_MAIN_NETWORK: './millix',
    NODE_DATA_FOLDER_TEST_NETWORK: './millix-testnet',

    BRIDGE_ETHEREUM_PROVIDER               : undefined,
    BRIDGE_ETHEREUM_CONTRACT_WRAPPED_MILLIX: undefined,
    BRIDGE_ETHEREUM_CONTRACT_CREATE_BLOCK  : undefined,
    BRIDGE_ETHEREUM_CONTRACT_OWNER_ADDRESS : undefined,
    BRIDGE_ETHEREUM_WALLET_PRIVATE_KEY     : undefined,
    BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER    : undefined,
    BRIDGE_MILLIX_WALLET_PRIVATE_KEY       : undefined,
    BRIDGE_MILLIX_WALLET_PUBLIC_KEY        : undefined
};

let environment;
try {
    environment = await import('./environment.js');
    environment = environment.default;
}
catch (ex) {
}

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

export const MODE_DEBUG             = getConstValue('MODE_DEBUG');
export const DATABASE_HOST          = getConstValue('DATABASE_HOST');
export const DATABASE_NAME          = getConstValue('DATABASE_NAME');
export const DATABASE_AUTH_USER     = getConstValue('DATABASE_AUTH_USER');
export const DATABASE_AUTH_PASSWORD = getConstValue('DATABASE_AUTH_PASSWORD');
export const DATABASE_PORT          = getConstValue('DATABASE_PORT');
export const DATABASE_DIALECT       = getConstValue('DATABASE_DIALECT');
export const DATABASE_ENABLE_LOGS   = getConstValue('DATABASE_ENABLE_LOGS');

export const API_PORT = 8080;
export const API_HOST = 'localhost';

export const NODE_SHARD_ID                 = getConstValue('NODE_SHARD_ID');
export const MODE_TEST_NETWORK             = getConstValue('MODE_TEST_NETWORK');
export const NODE_DATA_FOLDER_MAIN_NETWORK = getConstValue('NODE_DATA_FOLDER_MAIN_NETWORK');
export const NODE_DATA_FOLDER_TEST_NETWORK = getConstValue('NODE_DATA_FOLDER_TEST_NETWORK');

export const NODE_DATA_FOLDER = MODE_TEST_NETWORK ? NODE_DATA_FOLDER_TEST_NETWORK : NODE_DATA_FOLDER_MAIN_NETWORK;

export const NODE_PORT_API = getConstValue('NODE_PORT_API');
export const NODE_HOST     = getConstValue('NODE_HOST');
export const NODE_KEY_PATH = NODE_DATA_FOLDER + '/node.json';

export const DEFAULT_PROXY_FEE                    = 1000;
export const DEFAULT_ADDRESS_VERSION_MAIN_NETWORK = '0a0';
export const DEFAULT_ADDRESS_VERSION_TEST_NETWORK = 'lal';
export const DEFAULT_ADDRESS_VERSION              = MODE_TEST_NETWORK ? DEFAULT_ADDRESS_VERSION_TEST_NETWORK : DEFAULT_ADDRESS_VERSION_MAIN_NETWORK;

export const BRIDGE_BURN_FEE                              = 1000000;
export const BRIDGE_MINT_WAIT_TIME                        = 10000;
export const BRIDGE_DATA_FETCH_WAIT_TIME                  = 10000;
export const BRIDGE_TRANSACTION_VERSION_MINT_MAIN_NETWORK = '0a40';
export const BRIDGE_TRANSACTION_VERSION_MINT_TEST_NETWORK = 'la4l';
export const BRIDGE_TRANSACTION_VERSION_BURN_MAIN_NETWORK = '0a50';
export const BRIDGE_TRANSACTION_VERSION_BURN_TEST_NETWORK = 'la5l';
export const BRIDGE_TRANSACTION_VERSION_MINT              = MODE_TEST_NETWORK ? BRIDGE_TRANSACTION_VERSION_MINT_TEST_NETWORK : BRIDGE_TRANSACTION_VERSION_MINT_MAIN_NETWORK;
export const BRIDGE_TRANSACTION_VERSION_BURN              = MODE_TEST_NETWORK ? BRIDGE_TRANSACTION_VERSION_BURN_TEST_NETWORK : BRIDGE_TRANSACTION_VERSION_BURN_MAIN_NETWORK;
export const BRIDGE_ADDRESS_VERSION_MAIN_NETWORK          = '0d0';
export const BRIDGE_ADDRESS_VERSION_TEST_NETWORK          = 'ldl';
export const BRIDGE_ADDRESS_VERSION                       = MODE_TEST_NETWORK ? BRIDGE_ADDRESS_VERSION_TEST_NETWORK : BRIDGE_ADDRESS_VERSION_MAIN_NETWORK;
export const BRIDGE_ETHEREUM_PROVIDER                     = getConstValue('BRIDGE_ETHEREUM_PROVIDER');
export const BRIDGE_ETHEREUM_CONTRACT_WRAPPED_MILLIX      = getConstValue('BRIDGE_ETHEREUM_CONTRACT_WRAPPED_MILLIX');
export const BRIDGE_ETHEREUM_CONTRACT_CREATE_BLOCK        = getConstValue('BRIDGE_ETHEREUM_CONTRACT_CREATE_BLOCK');
export const BRIDGE_ETHEREUM_CONTRACT_OWNER_ADDRESS       = getConstValue('BRIDGE_ETHEREUM_CONTRACT_OWNER_ADDRESS');
export const BRIDGE_ETHEREUM_WALLET_PRIVATE_KEY           = getConstValue('BRIDGE_ETHEREUM_WALLET_PRIVATE_KEY');
export const BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER          = getConstValue('BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER');
export const BRIDGE_MILLIX_WALLET_PRIVATE_KEY             = getConstValue('BRIDGE_MILLIX_WALLET_PRIVATE_KEY');
export const BRIDGE_MILLIX_WALLET_PUBLIC_KEY              = getConstValue('BRIDGE_MILLIX_WALLET_PUBLIC_KEY');

export default {
    MODE_DEBUG,
    DATABASE_HOST,
    DATABASE_NAME,
    BRIDGE_BURN_FEE,
    DATABASE_AUTH_USER,
    DATABASE_AUTH_PASSWORD,
    DATABASE_ENABLE_LOGS,
    DATABASE_DIALECT,
    MODE_TEST_NETWORK,
    DEFAULT_PROXY_FEE,
    DEFAULT_ADDRESS_VERSION,
    BRIDGE_DATA_FETCH_WAIT_TIME,
    BRIDGE_TRANSACTION_VERSION_MINT,
    BRIDGE_TRANSACTION_VERSION_BURN,
    BRIDGE_ETHEREUM_CONTRACT_CREATE_BLOCK,
    BRIDGE_ETHEREUM_CONTRACT_OWNER_ADDRESS,
    BRIDGE_ETHEREUM_CONTRACT_WRAPPED_MILLIX,
    BRIDGE_MILLIX_WALLET_KEY_IDENTIFIER,
    BRIDGE_ETHEREUM_WALLET_PRIVATE_KEY,
    BRIDGE_MILLIX_WALLET_PRIVATE_KEY,
    BRIDGE_MILLIX_WALLET_PUBLIC_KEY,
    BRIDGE_ETHEREUM_PROVIDER,
    BRIDGE_ADDRESS_VERSION,
    BRIDGE_MINT_WAIT_TIME,
    NODE_DATA_FOLDER,
    DATABASE_PORT,
    NODE_KEY_PATH,
    NODE_PORT_API,
    NODE_SHARD_ID,
    NODE_HOST,
    API_PORT,
    API_HOST
};
