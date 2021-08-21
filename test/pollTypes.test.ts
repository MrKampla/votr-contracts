import { expect } from 'chai';
import {
  FirstPastThePostPollTypeInstance,
  QuadraticPollTypeInstance,
  EvaluativePollTypeInstance,
  VotrPollFactoryInstance,
} from 'types/truffle-contracts';
import { expectRevert, time } from '@openzeppelin/test-helpers';
import { prepearePollCreationParams } from './pollTestHelpers';

const VotrPollContract = artifacts.require('VotrPoll');
const VotrPollFactoryContract = artifacts.require('VotrPollFactory');
const FirstPastThePostPollTypeContract = artifacts.require('FirstPastThePostPollType');
const EvaluativePollTypeContract = artifacts.require('EvaluativePollType');
const QuadraticPollTypeContract = artifacts.require('QuadraticPollType');

let pollFactory: VotrPollFactoryInstance;
let FirstPastThePostPollType: FirstPastThePostPollTypeInstance;
let EvaluativePollType: EvaluativePollTypeInstance;
let QuadraticPollType: QuadraticPollTypeInstance;
type PollCreationParams = Parameters<typeof pollFactory.createPoll>;

contract('FirstPastThePostPollType', (accounts) => {
  beforeEach(async () => {
    pollFactory = await VotrPollFactoryContract.new();
    FirstPastThePostPollType = await FirstPastThePostPollTypeContract.new();
  });
  it('prevents from voting twice', async () => {
    const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
      {
        pollTypeAddress: FirstPastThePostPollType.address,
      },
      accounts
    );
    const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
    const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
    await createdPoll.vote([0], [1], { from: accounts[2] });
    await expectRevert(createdPoll.vote([0], [1], { from: accounts[2] }), 'You can only vote once');
  });
  it('can only vote for one choice in single call', async () => {
    const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
      {
        pollTypeAddress: FirstPastThePostPollType.address,
      },
      accounts
    );
    const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
    const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
    await expectRevert(createdPoll.vote([0, 1], [1, 1], { from: accounts[2] }), 'You can only vote for one choice');
  });
  it('correctly counts amount of voters when there are multiple polls using it', async () => {
    const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
      {
        pollTypeAddress: FirstPastThePostPollType.address,
      },
      accounts
    );
    for await (const i of [0, 1]) {
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      expect(
        (await FirstPastThePostPollType.amountOfVotersWhoAlreadyVoted(createdPoll.address)).toNumber()
      ).to.be.equal(0);
      await createdPoll.vote([0], [1], { from: accounts[2] });
      expect(
        (await FirstPastThePostPollType.amountOfVotersWhoAlreadyVoted(createdPoll.address)).toNumber()
      ).to.be.equal(1);
    }
  });
});
contract('EvaluativePollType', (accounts) => {
  beforeEach(async () => {
    pollFactory = await VotrPollFactoryContract.new();
    EvaluativePollType = await EvaluativePollTypeContract.new();
  });
  it('allows to vote only for and against certain choice (1,-1)', async () => {
    const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
      {
        pollTypeAddress: EvaluativePollType.address,
        voters: [
          { addr: accounts[1], allowedVotes: 2 },
          { addr: accounts[2], allowedVotes: 2 },
        ],
      },
      accounts
    );
    const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
    const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
    await createdPoll.vote([0, 1], [-1, 1], { from: accounts[2] });
    await expectRevert(
      createdPoll.vote([0], [2], { from: accounts[1] }),
      'You can only vote for or against this choice (1,-1)'
    );
  });
});
contract('QuadraticPollType', (accounts) => {
  beforeEach(async () => {
    pollFactory = await VotrPollFactoryContract.new();
    QuadraticPollType = await QuadraticPollTypeContract.new();
  });
  it('should forbid to vote with more voting power than user has', async () => {
    const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
      {
        pollTypeAddress: QuadraticPollType.address,
        voters: [
          { addr: accounts[1], allowedVotes: 100 },
          { addr: accounts[2], allowedVotes: 100 },
        ],
      },
      accounts
    );
    const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
    const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
    await expectRevert(createdPoll.vote([0], [11], { from: accounts[1] }), 'Not enough allowance');
  });
  it('prevents from voting twice', async () => {
    const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
      {
        pollTypeAddress: QuadraticPollType.address,
        voters: [{ addr: accounts[2], allowedVotes: 100 }],
      },
      accounts
    );
    const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
    const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
    await createdPoll.vote([0], [1], { from: accounts[2] });
    await expectRevert(createdPoll.vote([0], [1], { from: accounts[2] }), 'You can only vote once');
  });
});
