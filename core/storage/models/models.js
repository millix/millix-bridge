import Database from '../database';
import Transaction from './transaction.model';


class Models {
    async sync(options = {alter: true}) {
        await Database.getConnection().sync(options);
    }
}


export {
    Transaction
};

export default new Models;
