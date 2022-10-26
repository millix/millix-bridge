const cron = require('node-cron');

cron.schedule('* * * * *', () => {
    console.log('[main] fecting new transactions');
});