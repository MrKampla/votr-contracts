const CumulativePoll = artifacts.require('./CumulativePoll.sol');
const { prepeareParamsCumulativePoll } = require('./defaultPollparams');

contract('CumulativePoll', async (accounts) => {
  let pollContract;
  beforeEach(async () => {
    pollContract = await CumulativePoll.new(...prepeareParamsCumulativePoll());
  });

  it('Single multivote works', async () => {
    const result = await pollContract.vote(1, 3, { from: accounts[0] });
    assert.equal(result.logs[0].args['0'], accounts[0]);
    assert.equal(result.logs[0].args['1'], 1);
    assert.equal(result.logs[0].args['2'], 3);

    assert.equal(await pollContract.allowedVotes(accounts[0]), 0);

    const selectedOption = await pollContract.choices(1);
    assert.equal(selectedOption.voteCount, 3);

    const { finished } = await pollContract.isFinished();
    assert.equal(finished, false);
  });

  it('Delegate multiple votes', async () => {
    await pollContract.delegateVote(accounts[1], 3, { from: accounts[0] });

    assert.equal(await pollContract.allowedVotes(accounts[1]), 5);
    assert.equal(await pollContract.allowedVotes(accounts[0]), 0);
  });

  it('Quorum reached but should not be finished', async () => {
    await pollContract.vote(1, 3, { from: accounts[0] });
    let shouldNotBeFinished = (await pollContract.isFinished()).finished;
    assert.equal(shouldNotBeFinished, false);
  });

  it('Finish when all votes have been given', async () => {
    await pollContract.vote(1, 3, { from: accounts[0] });
    await pollContract.vote(1, 2, { from: accounts[1] });
    let shouldBeFinished = (await pollContract.isFinished()).finished;
    assert.equal(shouldBeFinished, true);
  });
});

export { };