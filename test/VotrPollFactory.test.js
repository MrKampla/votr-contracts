let PollFactory = artifacts.require('./VotrPollFactory.sol');
const FirstPastThePostPoll = artifacts.require('./FirstPastThePostPoll.sol');
const { prepeareParamsToFPTPPollFromFactory } = require('./defaultPollparams');
const { expectEvent } = require('@openzeppelin/test-helpers');

contract('VotrPollFactory', async (accounts) => {
  let factoryContract;
  beforeEach(async () => {
    factoryContract = await PollFactory.new();
  });

  it('Successfully creates new poll', async () => {
    const res = await factoryContract.createPoll(0, ...prepeareParamsToFPTPPollFromFactory(accounts.slice(0, 2)));
    const createdPoll = await FirstPastThePostPoll.at(res.logs[0].args.pollType);
    assert.equal(await createdPoll.pollType(), 'First-past-the-post poll');
    assert.equal(await factoryContract.numberOfPolls(), 1);
  });

  it('Emits event on new poll creation', async () => {
    await expectEvent(
      await factoryContract.createPoll(0, ...prepeareParamsToFPTPPollFromFactory(accounts.slice(0, 2))),
      'PollCreated'
    );
  });
});
