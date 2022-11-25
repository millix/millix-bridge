const const_value_default = {
    MODE_DEBUG            : false,
    DATABASE_HOST         : 'localhost',
    DATABASE_NAME         : 'millix_bridge',
    DATABASE_AUTH_USER    : 'root',
    DATABASE_AUTH_PASSWORD: ''
};

let environment;
try {
    environment = require('./environment');
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
export const API_PORT               = 8080;
export const API_HOST               = 'localhost';

export default {
    MODE_DEBUG,
    DATABASE_HOST,
    DATABASE_NAME,
    DATABASE_AUTH_USER,
    DATABASE_AUTH_PASSWORD,
    API_PORT,
    API_HOST
};
