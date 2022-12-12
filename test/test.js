import expect from 'expect.js';
import VestingRuleRepository from '../core/storage/repositories/vesting-rule.js'
import {isMintVested} from '../core/utils/transaction-utils.js'

     
describe('Rule',function () {

  let rules; 

  const fakeDataAllFieldsEqual = {
        addressTo: '0x879469cc6e375138fefb76179945806cb09c33a2',
        addressFrom: '12WLrCsgcG8orRSCjzA257gwhVxrY1UJuc0a012WLrCsgcG8orRSCjzA257gwhVxrY1UJuc',
        amnountTo: '800000000',
        amnountFrom: '300000000',
  }

  const fakeDataOneFieldEqual = {
    addressTo: '0x879469cc6e375138fefb76179945806cb09c33a2',
    addressFrom: '56WLrCsgcG8orRSCjzA257gwhVxrY1UJuc0a012WLrCsgcG8orRSCjzA257gwhVxrY1UJuc',
    amnountTo: '100000000',
    amnountFrom: '400000000',
  }

  const fakeDataAllFieldsNotEqual = {
    addressTo: '0x649469cc6e375138fefb76179945806cb09c33a2',
    addressFrom: '56WLrCsgcG8orRSCjzA257gwhVxrY1UJuc0a012WLrCsgcG8orRSCjzA257gwhVxrY1UJuc',
    amnountTo: '100000000',
    amnountFrom: '400000000',
  }

  // runs once before the first test in this block
  before( async function () {
    await VestingRuleRepository.create('addressTo','equal','0x879469cc6e375138fefb76179945806cb09c33a2')
    await VestingRuleRepository.create('addressFrom','equal','12WLrCsgcG8orRSCjzA257gwhVxrY1UJuc0a012WLrCsgcG8orRSCjzA257gwhVxrY1UJuc')
    await VestingRuleRepository.create('amnountTo','equal','800000000')
    await VestingRuleRepository.create('amnountFrom','equal','300000000')
    rules = await VestingRuleRepository.listAll()
  });

  // runs once after the last test in this block
  after(async function () {
    await VestingRuleRepository.deleteAll()
  });


  
  describe('#isMintVested()', function () {

    // Test #1 - all fields equal
    it('Verify the transaction fields, all rule true', function () {
      expect(isMintVested(rules, fakeDataAllFieldsEqual)).to.be(true)
    });

    // Test #2 - One field equal
    it('Verify the transaction fields, one rule true', function () {
      expect(isMintVested(rules, fakeDataOneFieldEqual)).to.be(true)
    });

    // Test #3 - all fields not equal
    it('Verify the transaction fields, all rule false', function () {
      expect(isMintVested(rules, fakeDataAllFieldsNotEqual)).to.be(true)
    });

  });

});

