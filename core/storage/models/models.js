import Database from '../database.js';
import Transaction from './transaction.model.js';
import VestingRule from './vesting-rule.model.js';


class Models {
    async sync(options = {alter: true}) {
        await Database.getConnection().sync(options);
    }
}


export {
    Transaction,
    VestingRule
};

export default new Models;
