import config from './core/config/config';
import Database from './core/storage/database';
import Models from './core/storage/models/models';
import MillixBridge from './core/bridge/millix-bridge';

const argv = require('yargs')
    .options({
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
    console.log('[app] starting millix bridge agent');
    const sequelize = await Database.getConnection();

    try {
        await sequelize.authenticate();
        console.log('[database] connection has been established successfully.');

        await Models.sync();
        console.log('[database] database models synced.');
    }
    catch (e) {
        console.error('[database] unexpected database error: ', e);
        throw e;
    }

    MillixBridge.initialize();
        
})();
