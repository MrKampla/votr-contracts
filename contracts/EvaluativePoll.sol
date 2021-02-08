// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import './BasePoll.sol';

contract EvaluativePoll is BasePoll {
  //address to choice to rating which user gave for certain choice
  mapping(address => mapping(uint256 => int256)) hasVotedFor;

  constructor(
    address _chairman,
    string memory _title,
    string memory _description,
    bytes32[] memory _choices,
    address[] memory _voters,
    uint256 _quorum,
    uint256 _endDate
  )
    public
    BasePoll(
      _chairman,
      _title,
      _description,
      _choices,
      _voters,
      new uint256[](_voters.length),
      _quorum,
      _endDate,
      false
    )
  {
    pollType = 'Evaluative poll';
  }

  function vote(uint256 choice, int256 amountOfVotes)
    public
    override
    onlyOngoing
    returns (
      address voter,
      uint256 choiceIndex,
      int256 voteCount
    )
  {
    require(choice < choices.length, 'There is no such candidate with this index.');
    require(amountOfVotes < 2 && amountOfVotes > -2, 'Incorrect vote type, only -1, 0 or +1 are allowed.');
    require(hasVotedFor[msg.sender][choice] == 0, 'The voter has already given vote for this choice.');

    hasVotedFor[msg.sender][choice] = amountOfVotes;
    hasVoted[msg.sender] = true;
    Choice storage selectedOption = choices[choice];
    selectedOption.voteCount += amountOfVotes;
    emit Voted(msg.sender, choice, amountOfVotes);

    return (msg.sender, choice, selectedOption.voteCount);
  }

  function batchVotes(uint256[] memory choices, int256[] memory amountOfVotesPerChoice)
    public
    onlyOngoing
    returns (bool)
  {
    require(choices.length == amountOfVotesPerChoice.length, 'Number of choices and votes provided do not match.');

    for (uint256 i = 0; i < choices.length; i++) {
      this.vote(choices[i], amountOfVotesPerChoice[i]);
    }

    return true;
  }
}
