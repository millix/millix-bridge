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
}

export default new VestingRuleRepository();
