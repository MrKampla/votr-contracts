import { expect } from 'chai';
import {
  CumulativePollTypeInstance,
  FirstPastThePostPollTypeInstance,
  VotrPollFactoryInstance,
} from 'types/truffle-contracts';
import { expectRevert, time } from '@openzeppelin/test-helpers';
import { prepearePollCreationParams } from './pollTestHelpers';

const VotrPollContract = artifacts.require('VotrPoll');
const VotrPollFactoryContract = artifacts.require('VotrPollFactory');
const FirstPastThePostPollTypeContract = artifacts.require('FirstPastThePostPollType');
const CumulativePollTypeContract = artifacts.require('CumulativePollType');
const CallbackExample = artifacts.require('CallbackExample');

let pollFactory: VotrPollFactoryInstance;
let FirstPastThePostPollType: FirstPastThePostPollTypeInstance;
let CumulativePollType: CumulativePollTypeInstance;
type PollCreationParams = Parameters<typeof pollFactory.createPoll>;

contract('VotrPoll', (accounts) => {
  beforeEach(async () => {
    pollFactory = await VotrPollFactoryContract.new();
    FirstPastThePostPollType = await FirstPastThePostPollTypeContract.new();
    CumulativePollType = await CumulativePollTypeContract.new();
  });
  describe('initialization', () => {
    it('Each voter get specified amount of votes', async () => {
      const pollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          voters: [
            { addr: accounts[1], allowedVotes: 1 },
            { addr: accounts[2], allowedVotes: 2 },
            { addr: accounts[3], allowedVotes: 3 },
          ],
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      for await (const i of [1, 2, 3]) {
        expect((await createdPoll.balanceOf(accounts[i])).toNumber()).to.be.equal(i);
      }
    });

    it('Each choice is correctly saved', async () => {
      const pollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      for await (const i of [0, 1]) {
        expect(await createdPoll.choices(i)).to.be.equal(`choice${i + 1}`);
      }
    });
  });
  describe('voting', () => {
    it('single vote works properly', async () => {
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);

      const pollType = await FirstPastThePostPollTypeContract.at(FirstPastThePostPollType.address);
      await createdPoll.vote([0], [1], { from: accounts[1] });
      expect((await pollType.choiceIdToVoteCount(createdPoll.address, 0)).toNumber()).to.be.equal(1);
    });
    it('multiple votes work properly', async () => {
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: CumulativePollType.address,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);

      const pollType = await CumulativePollTypeContract.at(CumulativePollType.address);
      await createdPoll.vote([0], [1], { from: accounts[1] });
      expect((await pollType.choiceIdToVoteCount(createdPoll.address, 0)).toNumber()).to.be.equal(1);
      await createdPoll.vote([0, 1], [1, 1], { from: accounts[2] });

      expect((await pollType.choiceIdToVoteCount(createdPoll.address, 0)).toNumber()).to.be.equal(2);
      expect((await pollType.choiceIdToVoteCount(createdPoll.address, 1)).toNumber()).to.be.equal(1);
    });
    it('forbids to vote in poll that user does not have access to', async () => {
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);

      // An account that has not been explicitly allowed to vote or did not lock its tokens, will revert because of insufficient allowance
      await expectRevert(createdPoll.vote([0], [1], { from: accounts[4] }), 'Not enough allowance');
    });
    it('forbids to cast more votes than user is allowed to', async () => {
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: CumulativePollType.address,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);

      await expectRevert(createdPoll.vote([0], [3], { from: accounts[1] }), 'Not enough allowance');
    });
    it('forbids to cast a vote if user has no votes to spend', async () => {
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: CumulativePollType.address,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await createdPoll.vote([0], [1], { from: accounts[1] });
      await expectRevert(createdPoll.vote([0], [1], { from: accounts[1] }), 'Not enough allowance');
    });
    it('forbids to cast a vote if poll has finished', async () => {
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: CumulativePollType.address,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await time.increase(45 * 60); // 45 minutes later, poll is finished by now
      await expectRevert(createdPoll.vote([0], [1], { from: accounts[1] }), 'Poll already ended');
    });
  });
  describe('peripheral functionalities', () => {
    it('returns poll type name', async () => {
      expect(await FirstPastThePostPollType.getPollTypeName()).to.be.equal('First Past The Post');
    });
    it('returns vote counts for all choices', async () => {
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: CumulativePollType.address,
          voters: [
            { addr: accounts[1], allowedVotes: 1 },
            { addr: accounts[2], allowedVotes: 2 },
            { addr: accounts[3], allowedVotes: 3 },
          ],
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await createdPoll.vote([0], [1], { from: accounts[1] });
      await createdPoll.vote([0, 1], [1, 1], { from: accounts[2] });
      await createdPoll.vote([1], [3], { from: accounts[3] });
      const results = await createdPoll.getAmountOfVotesForChoices();
      expect(results[0].toNumber()).to.be.equal(2);
      expect(results[1].toNumber()).to.be.equal(4);
    });
    it('vote delagation works properly', async () => {
      const pollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          voters: [{ addr: accounts[1], allowedVotes: 1 }],
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      expect((await createdPoll.balanceOf(accounts[1])).toNumber()).to.be.equal(1);

      await createdPoll.delegateVote(accounts[2], 1, { from: accounts[1] });

      expect((await createdPoll.balanceOf(accounts[1])).toNumber()).to.be.equal(0);
      expect((await createdPoll.balanceOf(accounts[2])).toNumber()).to.be.equal(1);

      await expectRevert(
        createdPoll.delegateVote(accounts[4], 1, { from: accounts[5] }),
        'transfer amount exceeds balance'
      );
    });
    it('vote delagation can be forbidden', async () => {
      const pollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          voters: [{ addr: accounts[1], allowedVotes: 1 }],
          allowVoteDelegation: false,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      expect((await createdPoll.balanceOf(accounts[1])).toNumber()).to.be.equal(1);

      await expectRevert(
        createdPoll.delegateVote(accounts[2], 1, { from: accounts[1] }),
        'Vote delegation is not allowed'
      );

      expect((await createdPoll.balanceOf(accounts[1])).toNumber()).to.be.equal(1);
    });
    it('correctly returns if is finished or quorum reached', async () => {
      const pollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          allowVoteDelegation: false,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);

      expect((await createdPoll.isFinished())[0]).to.be.equal(false);
      expect((await createdPoll.isFinished())[1]).to.be.equal(false);

      await createdPoll.vote([0], [1], { from: accounts[1] });
      await createdPoll.vote([0], [1], { from: accounts[2] });

      expect((await createdPoll.isFinished())[0]).to.be.equal(false);
      expect((await createdPoll.isFinished())[1]).to.be.equal(true);
      await time.increase(31 * 60); // 31 minutes later

      expect((await createdPoll.isFinished())[0]).to.be.equal(true);
    });
    it('correctly returns a winner', async () => {
      const pollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          voters: [{ addr: accounts[1], allowedVotes: 1 }],
          allowVoteDelegation: false,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);

      expect((await createdPoll.checkWinner()).toNumber()).to.be.equal(0);

      await createdPoll.vote([1], [1], { from: accounts[1] });

      expect((await createdPoll.checkWinner()).toNumber()).to.be.equal(1);
    });
  });
  describe('callback', () => {
    it('anyone can call a specified callback', async () => {
      const callbackTarget = await CallbackExample.new();
      const pollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          voters: [{ addr: accounts[1], allowedVotes: 1 }],
          allowVoteDelegation: false,
          callbackContractAddress: callbackTarget.address,
          quorum: 0,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await time.increase(35 * 60);
      await createdPoll.callback({ from: accounts[8] });
      expect((await callbackTarget.winnerIndex()).toNumber()).to.be.equal(0);
      expect(await callbackTarget.pollAddress()).to.be.equal(createdPoll.address);
      expect(await callbackTarget.pollTypeAddress()).to.be.equal(FirstPastThePostPollType.address);
    });
    it('callback can be called only once', async () => {
      const callbackTarget = await CallbackExample.new();
      const pollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          voters: [{ addr: accounts[1], allowedVotes: 1 }],
          allowVoteDelegation: false,
          callbackContractAddress: callbackTarget.address,
          quorum: 0,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await time.increase(35 * 60);
      await createdPoll.callback({ from: accounts[8] });
      await expectRevert(createdPoll.callback({ from: accounts[5] }), 'Callback can only be called once');
    });
    it('correctly pass information about poll as arguments to callback', async () => {
      const callbackTarget = await CallbackExample.new();
      const pollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          allowVoteDelegation: false,
          callbackContractAddress: callbackTarget.address,
          quorum: 0,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await createdPoll.vote([1], [1], { from: accounts[1] });
      await createdPoll.vote([1], [1], { from: accounts[2] });
      await time.increase(35 * 60);
      await createdPoll.callback({ from: accounts[8] });
      expect((await callbackTarget.winnerIndex()).toNumber()).to.be.equal(1);
      expect(await callbackTarget.pollAddress()).to.be.equal(createdPoll.address);
      expect(await callbackTarget.pollTypeAddress()).to.be.equal(FirstPastThePostPollType.address);
    });
    it('callback cannot be called before poll ends or when quorum is not reached', async () => {
      const callbackTarget = await CallbackExample.new();
      const pollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          callbackContractAddress: callbackTarget.address,
          quorum: 2,
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await expectRevert(createdPoll.callback({ from: accounts[0] }), 'Cannot execute callback until poll is finished');
      await time.increase(35 * 60);
      await expectRevert(
        createdPoll.callback({ from: accounts[0] }),
        'Cannot execute callback because quorum was not reached'
      );
    });
  });
});
