import { expect } from 'chai';
import { FirstPastThePostPollTypeInstance, VotrPollFactoryInstance } from 'types/truffle-contracts';
import { expectRevert, time } from '@openzeppelin/test-helpers';
import { getCurrentTimeInSeconds, prepearePollCreationParams } from './pollTestHelpers';

const VotrPollContract = artifacts.require('VotrPoll');
const VotrPollFactoryContract = artifacts.require('VotrPollFactory');
const FirstPastThePostPollTypeContract = artifacts.require('FirstPastThePostPollType');
const ERC20Contract = artifacts.require('ERC20PresetMinterPauser');

let pollFactory: VotrPollFactoryInstance;
let FirstPastThePostPollType: FirstPastThePostPollTypeInstance;
type PollCreationParams = Parameters<typeof pollFactory.createPoll>;

const ONE_TOKEN = web3.utils.toWei(web3.utils.toBN(1), 'ether');
const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
const ONE_MINUTE_IN_SECONDS = 60;

contract('ERC20Locker', (accounts) => {
  beforeEach(async () => {
    pollFactory = await VotrPollFactoryContract.new();
    FirstPastThePostPollType = await FirstPastThePostPollTypeContract.new();
  });
  describe('vToken', () => {
    it('creates vToken based on existing token', async () => {
      const testTokenContract = await ERC20Contract.new('TEST TOKEN', 'TST');
      await testTokenContract.mint(accounts[0], 1);
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          token: {
            basedOnToken: testTokenContract.address,
          },
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await testTokenContract.approve(createdPoll.address, 1, { from: accounts[0] });
      await createdPoll.lock(1, (await getCurrentTimeInSeconds()) + ONE_MINUTE_IN_SECONDS, { from: accounts[0] });

      expect((await createdPoll.balanceOf(accounts[0])).toNumber()).to.be.equal(1);
      expect((await testTokenContract.balanceOf(accounts[0])).toNumber()).to.be.equal(0);
      expect(await createdPoll.underlying()).to.be.equal(testTokenContract.address);
      expect(await createdPoll.name()).to.be.equal('vTest Token');
    });
    it('should increase vToken amount received for longer lockup periods', async () => {
      const testTokenContract = await ERC20Contract.new('TEST TOKEN', 'TST');
      await testTokenContract.mint(accounts[0], ONE_TOKEN);
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          token: {
            basedOnToken: testTokenContract.address,
          },
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await testTokenContract.approve(createdPoll.address, ONE_TOKEN, { from: accounts[0] });
      await createdPoll.lock(ONE_TOKEN, (await getCurrentTimeInSeconds()) + ONE_YEAR_IN_SECONDS, { from: accounts[0] });
      expect((await createdPoll.balanceOf(accounts[0])).toString().startsWith('16662245')).to.be.equal(true);
      expect((await testTokenContract.balanceOf(accounts[0])).toNumber()).to.be.equal(0);
    });
    it('should be exchangeable for underlying token', async () => {
      const testTokenContract = await ERC20Contract.new('TEST TOKEN', 'TST');
      await testTokenContract.mint(accounts[0], 1);
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          token: {
            basedOnToken: testTokenContract.address,
          },
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await testTokenContract.approve(createdPoll.address, 1, { from: accounts[0] });
      await createdPoll.lock(1, (await getCurrentTimeInSeconds()) + ONE_MINUTE_IN_SECONDS, { from: accounts[0] });

      expect((await createdPoll.balanceOf(accounts[0])).toNumber()).to.be.equal(1);
      expect((await testTokenContract.balanceOf(accounts[0])).toNumber()).to.be.equal(0);
      await time.increase(35 * 60); // 35 minutes
      await createdPoll.unlockAll({ from: accounts[0] });
      expect((await createdPoll.balanceOf(accounts[0])).toNumber()).to.be.equal(0);
      expect((await testTokenContract.balanceOf(accounts[0])).toNumber()).to.be.equal(1);
    });

    it('should be exchangeable for underlying token after voting', async () => {
      const testTokenContract = await ERC20Contract.new('TEST TOKEN', 'TST');
      await testTokenContract.mint(accounts[0], 1);

      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          token: {
            basedOnToken: testTokenContract.address,
          },
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await testTokenContract.approve(createdPoll.address, 1, { from: accounts[0] });
      await createdPoll.lock(1, (await getCurrentTimeInSeconds()) + ONE_MINUTE_IN_SECONDS, { from: accounts[0] });

      expect((await createdPoll.balanceOf(accounts[0])).toNumber()).to.be.equal(1);
      expect((await testTokenContract.balanceOf(accounts[0])).toNumber()).to.be.equal(0);

      await createdPoll.vote([1], [1], { from: accounts[0] });

      await time.increase(35 * 60); // 35 minutes

      await createdPoll.unlockAll({ from: accounts[0] });
      expect((await createdPoll.balanceOf(accounts[0])).toNumber()).to.be.equal(0);
      expect((await testTokenContract.balanceOf(accounts[0])).toNumber()).to.be.equal(1);
    });
    it('locking fails when user has no underlying token or not enough', async () => {
      const testTokenContract = await ERC20Contract.new('TEST TOKEN', 'TST');
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          token: {
            basedOnToken: testTokenContract.address,
          },
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await testTokenContract.approve(createdPoll.address, 1, { from: accounts[0] });
      await expectRevert(createdPoll.lock(1, 0, { from: accounts[0] }), 'ERC20: transfer amount exceeds balance');
    });
    it('should not allow to unlock deposits until its locking period is over', async () => {
      const testTokenContract = await ERC20Contract.new('TEST TOKEN', 'TST');

      await testTokenContract.mint(accounts[0], ONE_TOKEN);
      const pollCreationParams: PollCreationParams = await prepearePollCreationParams(
        {
          pollTypeAddress: FirstPastThePostPollType.address,
          token: {
            basedOnToken: testTokenContract.address,
          },
        },
        accounts
      );
      const pollCreationTransaction = await pollFactory.createPoll(...pollCreationParams);
      const createdPoll = await VotrPollContract.at(pollCreationTransaction.logs[0].args.pollAddress);
      await testTokenContract.approve(createdPoll.address, ONE_TOKEN, { from: accounts[0] });
      const currentTime = await getCurrentTimeInSeconds();
      await createdPoll.lock(ONE_TOKEN, currentTime + ONE_YEAR_IN_SECONDS, { from: accounts[0] });
      await expectRevert(createdPoll.unlockAll({ from: accounts[0] }), 'Locking period not finished');

      await time.increase(ONE_YEAR_IN_SECONDS + 60 * 60);
      await createdPoll.unlockAll({ from: accounts[0] });
    });
  });
});
