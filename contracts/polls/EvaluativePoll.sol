// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import './BasePoll.sol';

contract EvaluativePoll is BasePoll {
  //address to choice to rating which user gave for certain choice
  mapping(address => mapping(uint256 => int256)) public hasVotedFor;

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
    pollType = 'Evaluative';
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
    require(choice < choices.length, 'Candidate not found');
    require(amountOfVotes < 2 && amountOfVotes > -2, 'Only -1,0,+1 votes are allowed');
    require(hasVotedFor[msg.sender][choice] == 0, 'Caller already voted this choice');

    hasVotedFor[msg.sender][choice] = amountOfVotes;
    hasVoted[msg.sender] = true;
    choices[choice].voteCount += amountOfVotes;
    emit Voted(msg.sender, choice, amountOfVotes);

    return (msg.sender, choice, choices[choice].voteCount);
  }

  function batchVotes(uint256[] memory choices, int256[] memory amountOfVotesPerChoice)
    public
    onlyOngoing
    returns (bool)
  {
    require(choices.length == amountOfVotesPerChoice.length, 'unmatching choices and votes');

    for (uint256 i = 0; i < choices.length; i++) {
      vote(choices[i], amountOfVotesPerChoice[i]);
    }

    return true;
  }
}
