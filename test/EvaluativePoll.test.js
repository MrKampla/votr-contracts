let EvaluativePoll = artifacts.require('./EvaluativePoll.sol');
let { prepeareParamsEvaluativePoll } = require('./defaultPollparams');
const { expectRevert } = require('@openzeppelin/test-helpers');

contract('EvaluativePoll', async accounts => {
  let pollContract;
  beforeEach(async () => {
    pollContract = await EvaluativePoll.new(...prepeareParamsEvaluativePoll(accounts.slice(0, 2)));
  });

  it('Single disapproval vote works', async () => {
    await pollContract.vote(1, -1, { from: accounts[0] });
    const selectedOption = await pollContract.choices(1);
    assert.equal(selectedOption.voteCount, -1);
  });

  it('Single approval vote works', async () => {
    await pollContract.vote(1, 1, { from: accounts[0] });
    const selectedOption = await pollContract.choices(1);
    assert.equal(selectedOption.voteCount, 1);
  });

  it('Only accepts disapproval or approval votes', async () => {
    await expectRevert(pollContract.vote(1, 2, { from: accounts[0] }), 'Only -1,0,+1 votes are allowed');
  });

  it('One approval and one disapproval balance each other to 0', async () => {
    await pollContract.vote(1, 1, { from: accounts[0] });
    let selectedOption = await pollContract.choices(1);
    assert.equal(selectedOption.voteCount, 1);
    await pollContract.vote(1, -1, { from: accounts[1] });
    selectedOption = await pollContract.choices(1);
    assert.equal(selectedOption.voteCount, 0);
  });

  it('Multiple disapprovals works', async () => {
    await pollContract.vote(1, -1, { from: accounts[0] });
    await pollContract.vote(1, -1, { from: accounts[1] });
    const selectedOption = await pollContract.choices(1);
    assert.equal(selectedOption.voteCount, -2);
  });

  it('Batch votes works', async () => {
    await pollContract.batchVotes([0, 1], [-1, 1], { from: accounts[0] });
    const firstOption = await pollContract.choices(0);
    assert.equal(firstOption.voteCount, -1);
    const secondOption = await pollContract.choices(1);
    assert.equal(secondOption.voteCount, 1);
  });

  it('Vote delegation is disabled', async () => {
    await expectRevert(pollContract.delegateVote(accounts[3], 1, { from: accounts[0] }), 'Vote delegation is disabled');
  });
});
