// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import '../interfaces/IPollType.sol';
import '../interfaces/IVotrPoll.sol';
import '../poll/VotrPoll.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract FirstPastThePostPollType is IPollType {
  mapping(address => mapping(uint256 => int256)) public choiceIdToVoteCount;
  mapping(address => bool) public hasVoted;
  uint256 public amountOfVotersWhoAlreadyVoted;

  function getPollTypeName() external pure override returns (string memory) {
    return 'First Past The Post';
  }

  function onInit(address poll, address owner) public pure override {} // solhint-disable-line

  function vote(
    address voter,
    uint256[] memory _choices,
    int256[] memory amountOfVotes
  ) public override returns (bool) {
    int256 _amountOfAllVotesCasted = 0;
    for (uint256 i = 0; i < amountOfVotes.length; i++) {
      int256 _amountOfVotesCastForChoice = amountOfVotes[i];
      choiceIdToVoteCount[msg.sender][_choices[i]] += _amountOfVotesCastForChoice;
      if (!hasVoted[voter]) {
        amountOfVotersWhoAlreadyVoted++;
      }
      hasVoted[voter] = true;
      _amountOfAllVotesCasted += _amountOfVotesCastForChoice > 0
        ? _amountOfVotesCastForChoice
        : -_amountOfVotesCastForChoice;
    }
    int256 remainingAllowance = int256(IERC20(msg.sender).allowance(voter, address(this))) - _amountOfAllVotesCasted;
    require(remainingAllowance >= 0, 'Not enough allowance');
    IVotrPoll(msg.sender).burnFrom(voter, uint256(_amountOfAllVotesCasted));
    return true;
  }

  function checkWinner(uint256 _amountOfChoices) public view override returns (uint256 winnerIndex) {
    int256 winningAmountOfVotes = 0;
    for (uint256 i = 0; i < _amountOfChoices; i++) {
      if (choiceIdToVoteCount[msg.sender][i] > winningAmountOfVotes) {
        winningAmountOfVotes = choiceIdToVoteCount[msg.sender][i];
        winnerIndex = i;
      }
    }
    return winnerIndex;
  }

  function isFinished(uint256 _quorum, uint256 _endDate)
    public
    view
    override
    returns (bool finished, bool quorumReached)
  {
    if (_endDate < block.timestamp) {
      finished = true;
    }
    if (amountOfVotersWhoAlreadyVoted >= _quorum) {
      quorumReached = true;
    }
  }

  function delegateVote(
    address from,
    address to,
    uint256 amount
  ) public override returns (bool) {
    IERC20(msg.sender).transferFrom(from, to, amount);
    return true;
  }
}
