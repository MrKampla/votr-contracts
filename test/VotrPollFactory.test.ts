const PollFactory = artifacts.require('VotrPollFactory');
const FirstPastThePostPoll = artifacts.require('FirstPastThePostPoll');
const { prepeareParamsToFPTPPollFromFactory } = require('./defaultPollparams');
const { expectEvent } = require('@openzeppelin/test-helpers');

contract('VotrPollFactory', async accounts => {
  let factoryContract;
  beforeEach(async () => {
    factoryContract = await PollFactory.new();
  });

  it('Successfully creates new poll', async () => {
    const res = await factoryContract.createPoll(0, ...prepeareParamsToFPTPPollFromFactory(accounts.slice(0, 2)));
    const createdPoll = await FirstPastThePostPoll.at(res.logs[0].args.pollAddress);
    assert.equal(await createdPoll.pollType(), 'FirstPastThePost');
    assert.equal(await factoryContract.allPollsLength(), 1);
  });

  it('Emits event on new poll creation', async () => {
    const receipt = factoryContract.createPoll(0, ...prepeareParamsToFPTPPollFromFactory(accounts.slice(0, 2)));
    await expectEvent(await receipt, 'PollCreated');
  });

  it('Poll created emits poll type correctly', async () => {
    const receipt = await factoryContract.createPoll(0, ...prepeareParamsToFPTPPollFromFactory(accounts.slice(0, 2)));
    assert.equal(receipt.logs[0].args.pollType, 'FirstPastThePost');
  });
});

export { };