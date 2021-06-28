const QuadraticPoll = artifacts.require('QuadraticPoll');
const { prepeareParamsQuadraticPoll } = require('./defaultPollparams');
const { expectRevert } = require('@openzeppelin/test-helpers');

contract('QuadraticPoll', async (accounts) => {
  let pollContract;
  beforeEach(async () => {
    pollContract = await QuadraticPoll.new(...prepeareParamsQuadraticPoll(accounts.slice(0, 2)) as Parameters<typeof QuadraticPoll.new>);
  });

  it('Single Quadratic vote works', async () => {
    const result = await pollContract.vote(1, 5, { from: accounts[0] });
    assert.equal(result.logs[0].args['0'], accounts[0]);
    assert.equal(result.logs[0].args['1'], 1);
    assert.equal(result.logs[0].args['2'], 5);

    assert.equal((await pollContract.allowedVotes(accounts[0])).toNumber(), 75);

    const selectedOption = await pollContract.choices(1);
    assert.equal(selectedOption.voteCount, 5);

    const { finished } = await pollContract.isFinished();
    assert.equal(finished, false);
  });

  it(`Should fail when insufficient voting power`, async () => {
    await expectRevert(pollContract.vote(1, 1500, { from: accounts[0] }), 'Insufficient voting power.');
  });

  it('Vote delegation works', async () => {
    await pollContract.delegateVote(accounts[1], 3, { from: accounts[0] });

    assert.equal(await pollContract.allowedVotes(accounts[1]), 109);
    assert.equal(await pollContract.allowedVotes(accounts[0]), 91);
  });

  it('Quorum reached but should not be finished', async () => {
    await pollContract.vote(1, 3, { from: accounts[0] });
    let shouldNotBeFinished = (await pollContract.isFinished()).finished;
    assert.equal(shouldNotBeFinished, false);
    let shouldBeReached = (await pollContract.isFinished()).quorumReached;
    assert.equal(shouldBeReached, true);
  });

  it('Finish when all votes have been given', async () => {
    await pollContract.vote(1, 10, { from: accounts[0] });
    await pollContract.vote(1, 10, { from: accounts[1] });
    let shouldBeFinished = (await pollContract.isFinished()).finished;
    assert.equal(shouldBeFinished, true);
  });
});

export { };