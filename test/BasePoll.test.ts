const BasePoll = artifacts.require('BasePoll');
const { prepeareParamsBasePoll } = require('./defaultPollparams');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const Web3 = require('web3');

contract('BasePoll', async accounts => {
  let pollContract;
  beforeEach(async () => {
    pollContract = await BasePoll.new(...prepeareParamsBasePoll(accounts.slice(0, 2)) as Parameters<typeof BasePoll.new>);
  });

  it('Initializes with correct amount of choices', async () => {
    const choicesCount = (await pollContract.amountOfChoices()).toNumber();
    assert.equal(choicesCount, 2);
  });

  it('Initializes with correct choices', async () => {
    const firstOption = await pollContract.choices(0);
    const secondOption = await pollContract.choices(1);
    assert.equal(Web3.utils.toUtf8(firstOption.name), 'Biden');
    assert.equal(await firstOption.voteCount.toNumber(), 0);
    assert.equal(Web3.utils.toUtf8(secondOption.name), 'Trump');
    assert.equal(await secondOption.voteCount.toNumber(), 0);
  });

  it('Is not finished on start', async () => {
    const { finished } = await pollContract.isFinished();
    assert.equal(finished, false);
  });

  it('Allows only whitelisted voters', async () => {
    await expectRevert(pollContract.vote(1, 1, { from: accounts[3] }), 'Insufficient votes');
  });

  it('Single vote works', async () => {
    const result = await pollContract.vote(1, 1, { from: accounts[0] });
    assert.equal(result.logs[0].args['0'], accounts[0]);
    assert.equal(result.logs[0].args['1'], 1);
    assert.equal(result.logs[0].args['2'], 1);

    assert.equal(await pollContract.allowedVotes(accounts[0]), 0);

    const selectedOption = await pollContract.choices(1);
    assert.equal(selectedOption.voteCount, 1);

    const { finished } = await pollContract.isFinished();
    assert.equal(finished, false);
  });

  it('Vote emits event', async () => {
    expectEvent(await pollContract.vote(1, 1, { from: accounts[0] }), 'Voted');
  });

  it('Multiple votes works', async () => {
    await pollContract.vote(1, 1, { from: accounts[0] });
    await pollContract.vote(1, 1, { from: accounts[1] });
    const selectedOption = await pollContract.choices(1);
    assert.equal(selectedOption.voteCount, 2);
    const { finished } = await pollContract.isFinished();
    assert.equal(finished, true);
    const winner = await pollContract.checkWinner();
    assert.equal(winner.toNumber(), 1);
  });

  it('Correctly returns winner', async () => {
    const winner = await pollContract.checkWinner();
    //choice index 0 is default
    assert.equal(winner.toNumber(), 0);
  });

  it('Correctly delegates votes to other user', async () => {
    await pollContract.delegateVote(accounts[1], 1, { from: accounts[0] });

    assert.equal(await pollContract.allowedVotes(accounts[1]), 2);
    assert.equal(await pollContract.allowedVotes(accounts[0]), 0);
  });

  it('Can only delegate votes to whitelisted user', async () => {
    await expectRevert(
      pollContract.delegateVote(accounts[3], 1, { from: accounts[0] }),
      'Recipient not allowed to vote'
    );
  });

  it('End date cannot be in past', async () => {
    const dateInPast = +new Date('01-02-2000') / 1000;
    let paramsArr = prepeareParamsBasePoll(accounts.slice(0, 2));
    paramsArr.splice(-2, 2);
    paramsArr = paramsArr.concat([dateInPast, true]);
    await expectRevert(BasePoll.new(...paramsArr as Parameters<typeof BasePoll.new>), 'The end date cannot be in past.');
  });
});

export { };