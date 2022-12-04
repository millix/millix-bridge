import cron from 'node-cron';
import Server from '../api/server.js';
import logger from '../logger.js';


class MillixBridge {
    async initialize() {
        this.server = new Server();
        await this.server.start();
        logger.debug('[api] api started');

        cron.schedule('* * * * *', () => {
            console.log('[main] fecting new transactions');
            //faz fetch da bd do nó
            //...
        });
    }
}


export default new MillixBridge;
