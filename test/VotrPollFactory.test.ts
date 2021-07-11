import { expect } from 'chai';
import { FirstPastThePostPollTypeInstance, VotrPollFactoryInstance } from 'types/truffle-contracts';
import { constants, expectEvent, expectRevert } from '@openzeppelin/test-helpers';
import web3 from 'web3';
import { prepearePollCreationParams } from './pollTestHelpers';

const VotrPoll = artifacts.require('VotrPoll');
const VotrPollFactoryContract = artifacts.require('VotrPollFactory');
const FirstPastThePostPollTypeContract = artifacts.require('FirstPastThePostPollType');

const ZERO_ADDRESS = constants.ZERO_ADDRESS;

let pollFactory: VotrPollFactoryInstance;
let firstPastThePostPollType: FirstPastThePostPollTypeInstance;

contract('VotrPollFactory', (accounts) => {
  beforeEach(async () => {
    pollFactory = await VotrPollFactoryContract.new();
    firstPastThePostPollType = await FirstPastThePostPollTypeContract.new();
  });

  describe('poll creation', () => {
    it('creates new poll correctly', async () => {
      const pollCreationTransaction = await pollFactory.createPoll(
        ...(await prepearePollCreationParams({ pollTypeAddress: firstPastThePostPollType.address }, accounts))
      );
      const createdPoll = await VotrPoll.at(pollCreationTransaction.logs[0].args.pollAddress);
      expect(createdPoll).to.be.not.undefined;
      expect((await pollFactory.numberOfPolls()).toNumber()).to.equal(1);
      expect(await pollFactory.doesPollExist(createdPoll.address)).to.be.true;
      const addr = await pollFactory.allPolls(0);
      expect(addr).to.be.not.equal(ZERO_ADDRESS);
      expect(await createdPoll.name()).to.equal('vTest Token');
    });

    it('emits PollCreated event on poll creation', async () => {
      const pollCreationTransaction = pollFactory.createPoll(
        ...(await prepearePollCreationParams({ pollTypeAddress: firstPastThePostPollType.address }, accounts))
      );
      await expectEvent(await pollCreationTransaction, 'PollCreated');
    });
  });

  describe('vote tracking', () => {
    it('prohibits calling emitVotedEvent by non-Votr contract', async () => {
      await expectRevert(
        pollFactory.emitVotedEvent(ZERO_ADDRESS, [web3.utils.fromAscii('choice1')], [1]),
        'Callable only by Votr polls'
      );
    });

    it('emits Voted event whenever someone votes in any poll', async () => {
      const firstPollCreationTransaction = await pollFactory.createPoll(
        ...(await prepearePollCreationParams(
          {
            pollTypeAddress: firstPastThePostPollType.address,
            voters: [
              { addr: accounts[0], allowedVotes: 1 },
              { addr: accounts[1], allowedVotes: 2 },
            ],
          },
          accounts
        ))
      );
      const secondPollCreationTransaction = await pollFactory.createPoll(
        ...(await prepearePollCreationParams(
          {
            pollTypeAddress: firstPastThePostPollType.address,
            voters: [
              { addr: accounts[0], allowedVotes: 1 },
              { addr: accounts[1], allowedVotes: 2 },
            ],
          },
          accounts
        ))
      );
      const firstPoll = await VotrPoll.at(firstPollCreationTransaction.logs[0].args.pollAddress);
      const secondPoll = await VotrPoll.at(secondPollCreationTransaction.logs[0].args.pollAddress);
      await firstPoll.vote([web3.utils.fromAscii('choice1')], [1]);
      await secondPoll.vote([web3.utils.fromAscii('choice2')], [2], { from: accounts[1] });

      const events = await pollFactory.getPastEvents('Voted', { fromBlock: 0 });
      [0, 1].forEach((i) => {
        expect(events[i].event).to.equal('Voted');
        expect((events[i] as any).args.who).to.equal(accounts[i]);
        expect((events[i] as any).args.votesAmount[0].toNumber()).to.equal(i + 1);
      });
    });
  });
});
