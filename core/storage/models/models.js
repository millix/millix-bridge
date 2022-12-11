import Database from '../database.js';
import Transaction from './transaction.model.js';

class Models {
    async sync(options = {alter: true}) {
        await Database.getConnection().sync(options);
    }
}


export {
    Transaction
};

export default new Models;
