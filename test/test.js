import assert from 'assert'
import VestingRuleRepository from '../core/storage/repositories/vesting-rule.js'
import {isMintVested} from '../core/utils/transaction-utils.js'

const rules = await VestingRuleRepository.listAll();

const fakeData = {
    addressTo: '0x879469cc6e375138fefb76179945806cb09c33a1',
    addressFrom: '12WLrCsgcG8orRSCjzA257gwhVxrY1UJuc0a012WLrCsgcG8orRSCjzA257gwhVxrY1UJuc',
    amountTo: '60000000',
    amountFrom: '30000000',
}
     
describe('Rule', function () {

  describe('#isMintVested()', function () {
    it('Verify the transaction fields, return false if any condition fails', function () {
      assert.equal(isMintVested(rules, fakeData),true)
    });
  });

});

