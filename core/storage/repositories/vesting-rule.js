import VestingRule from '../models/vesting-rule.model.js';

class VestingRuleRepository {

    async create(field, operator, value){
        return await VestingRule.create({
            field,
            operator,
            value
        })
    }

    async listAll(){
        return await VestingRule.findAll({})
    }

    async deleteAll(){
        return await VestingRule.destroy({truncate: true})
    }
}

export default new VestingRuleRepository();
