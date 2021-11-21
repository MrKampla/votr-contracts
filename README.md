# Votr protocol contracts

This is a repo containing all contracts of which Votr protocol consists. They were created with use of Truffle framework and Solidity 0.8.0.

## Development

Local development environment is dependent on local blockchain provided by Ganache. To start it, use

```bash
yarn ganache
```

After that, the environment is ready to have Votr protocol contracts deployed to it. To deploy contracts on local env, use:

```bash

yarn deploy

```

Now, You're ready to use protocol contracts!

## Architecture


VotrPollFactory is a main contract that the whole protocol relays on. It is responsible for creating new polls as well as aggregating them all so the data about all polls can be easly accessed.

The VotrPoll contract is a base for a poll, giving each single one a unique address on the network. It's responsible for keeping the data and passing down calls to poll type strategies.

VotrPollTypes contracts (including FirstPastThePostPollType, CumulativePollType, EvaluativePollType and QuadraticPollType) implement the actual logic of running a poll i.e. counting votes and calculating the results.

## Accessing Votr contracts

Protocol contracts are available on Ropsten testnet:

- [VotrPollFactory](https://ropsten.etherscan.io/address/0x06101E28Fd7534fD91d149A06C0c661236d21927): 0x06101E28Fd7534fD91d149A06C0c661236d21927
- [FirstPastThePostPollType](https://ropsten.etherscan.io/address/0x33AD38ff44860Ef760B24D0E3E6E1D8F8875Eeae): 0x33AD38ff44860Ef760B24D0E3E6E1D8F8875Eeae
- [CumulativePollType](https://ropsten.etherscan.io/address/0x2644E68fC2AEaD2590238eA1b2B8d7F15D08a345): 0x2644E68fC2AEaD2590238eA1b2B8d7F15D08a345
- [EvaluativePollType](https://ropsten.etherscan.io/address/0xb52aF4c42453961794dc010Ea2015BC16608dc2e): 0xb52aF4c42453961794dc010Ea2015BC16608dc2e
- [QuadraticPollType](https://ropsten.etherscan.io/address/0x28733a84242f38D02677Ab83722dAdCc978094B6): 0x28733a84242f38D02677Ab83722dAdCc978094B6

## Extensions

### Callbacks

At poll creation, the chairman can specify a callback contract from which the code will be executed after the poll is finished. This allows to execute conditional logic depending on the result of the poll. The callback contract has to implement ICallback interface and has to be deployed before the actual poll is created.

```solidity
interface ICallback {
  function callback(
    uint256 winningChoiceIndex,
    address pollAddress,
    address pollTypeAddress
  ) external;
}

```

Due to blockchain nature, callback cannot be executed automatically. The poll contract has a callback method which can be called by anyone just after the poll finishes, it can be safely assumed that there will always be at least one entity who would want to execute callback.

### Custom poll type implementations

At poll creation, the chairman can specify a poll type. Programmers can easly create their own implementations of poll types by implementing IPollType interface and deploying it to the network. Later, this implementation can be used by all polls in Votr ecosystem.

```solidity
interface IPollType {
  event Voted(address indexed who, uint256 indexed chosen, int256 votesAmount);

  function getPollTypeName() external pure returns (string memory);

  function onInit(address poll, address owner) external;

  function vote(
    address voter,
    uint256[] memory choices,
    int256[] memory amountOfVotes
  ) external returns (bool);

  function checkWinner(uint256 _amountOfChoices) external view returns (uint256 winnerIndex);

  function getAmountOfVotesForChoice(uint256 choiceId) external view returns (int256 voteCount);

  function isFinished(uint256 _quorum, uint256 _endDate) external view returns (bool finished, bool quorumReached);

  function delegateVote(
    address from,
    address to,
    uint256 amount
  ) external returns (bool);
}

```

All methods are required, but onInit can be empty. This ability to create Your own implementations gives a lot of freedom and flexibilty to the community.

The possibilites are endless. For example:

- when voting among a particular community is at low rate, perhaps some incentive for voters should be introduced. In this case, you can create an IncentivisedPollType contract that will modify the voting functionality, rewarding each voter with additional tokens.
- when voters do not want to vote first and they are waiting for other users to move. In this case, the longer You wait with choosing Your option, the more information you have about the options selected by other users and the currently winning option. This problem can be solved by creating a DescendingVotingPowerPollType contract, which will change the logic of calculating the number of votes a given user is entitled to, reducing the votes over time. This implementation reduces the profitability of waiting for the rest of the users to vote, as the number of votes to be cast is the highest at the beginning of the voting period and inevitably approaches zero.
