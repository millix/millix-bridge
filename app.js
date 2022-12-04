import config from './core/config/config.js';
import Database from './core/storage/database.js';
import Models from './core/storage/models/models.js';
import MillixBridge from './core/bridge/millix-bridge.js';
import logger from './core/logger.js';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';


const argv = yargs(hideBin(process.argv)).options({
    'initial-peers': {
        demandOption: false,
        array       : true
    },
    'nat-pmp'      : {
        type   : 'boolean',
        default: true
    }
}).argv;

if (argv.debug === 'true') {
    config.MODE_DEBUG = true;
}

if (argv.apiPort) {
    config.API_PORT = argv.apiPort;
}

if (argv.host) {
    config.API_HOST = argv.host;
}

(async() => {
    logger.debug('[app] starting millix bridge agent');
    const sequelize = await Database.getConnection();

    try {
        await sequelize.authenticate();
        logger.debug('[database] connection has been established successfully.');

        await Models.sync();
        logger.debug('[database] database models synced.');
    }
    catch (e) {
        logger.error('[database] unexpected database error: ', e);
        throw e;
    }

    await MillixBridge.initialize();

})();
