import cron from 'node-cron';


class MillixBridge {
    initialize() {
        cron.schedule('* * * * *', () => {
            console.log('[main] fecting new transactions');
            //faz fetch da bd do nó
            //...
        });
    }
}


export default new MillixBridge;
