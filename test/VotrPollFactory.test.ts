import { expect } from 'chai';
import { VotrPollFactoryInstance } from 'types/truffle-contracts';
import { constants, expectEvent, expectRevert } from '@openzeppelin/test-helpers';
import web3 from 'web3';

const VotrPoll = artifacts.require('VotrPoll');
const VotrPollFactoryContract = artifacts.require('VotrPollFactory');

const ZERO_ADDRESS = constants.ZERO_ADDRESS;

let pollFactory: VotrPollFactoryInstance;
type PollCreationParamsCreator = (accounts: Truffle.Accounts) => Parameters<typeof pollFactory.createPoll>;

const defaultPollCreationParams: PollCreationParamsCreator = (accounts) => [
  ZERO_ADDRESS,
  { basedOnToken: ZERO_ADDRESS, name: 'vToken', symbol: 'VTK' },
  {
    allowVoteDelegation: false,
    description: 'description',
    endDate: new Date().getTime() + 60 * 2 * 1000,
    quorum: 2,
    title: 'title',
  },
  [web3.utils.fromAscii('choice1'), web3.utils.fromAscii('choice2')],
  [
    { addr: accounts[0], allowedVotes: 1 },
    { addr: accounts[1], allowedVotes: 1 },
  ],
];

contract('VotrPollFactory', (accounts) => {
  beforeEach(async () => {
    pollFactory = await VotrPollFactoryContract.new();
  });

  describe('poll creation', () => {
    it('creates new poll correctly', async () => {
      const pollCreationTransaction = await pollFactory.createPoll(...defaultPollCreationParams(accounts));
      const createdPoll = await VotrPoll.at(pollCreationTransaction.logs[0].args.pollAddress);
      expect(createdPoll).to.be.not.undefined;
      expect((await pollFactory.numberOfPolls()).toNumber()).to.equal(1);
      expect(await pollFactory.doesPollExist(createdPoll.address)).to.be.true;
      const addr = await pollFactory.allPolls(0);
      console.log(addr);
      expect(addr).to.be.not.equal(ZERO_ADDRESS);
      expect(await createdPoll.name()).to.equal('vToken');
    });

    it('emits PollCreated event on poll creation', async () => {
      const pollCreationTransaction = pollFactory.createPoll(...defaultPollCreationParams(accounts));
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
      // const firstPollCreationTransaction = await pollFactory.createPoll(...defaultPollCreationParams(accounts));
      // const secondPollCreationTransaction = await pollFactory.createPoll(...defaultPollCreationParams(accounts));
      // const firstPoll = await VotrPoll.at(firstPollCreationTransaction.logs[0].args.pollAddress);
      // const secondPoll = await VotrPoll.at(secondPollCreationTransaction.logs[0].args.pollAddress);
      // firstPoll.vote();
    });
  });
});
