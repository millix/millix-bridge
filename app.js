import config from './core/config/config';

const cron = require('node-cron');

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
    config.NODE_PORT_API = argv.apiPort;
}

if (argv.host) {
    config.NODE_HOST = argv.host;
}

cron.schedule('* * * * *', () => {
    console.log('[main] fecting new transactions');
});