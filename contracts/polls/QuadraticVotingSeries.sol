// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import './QuadraticPoll.sol';

contract QuadraticVotingSeries {
  QuadraticPoll[] public polls;
  address public owner;
  bool public delegationAllowed;
  address[] public voters;
  mapping(address => uint256) public allowedVotesThroughoutSeries;
  mapping(address => bool) public votersWhitelist;
  bool public isClosed;

  constructor(
    address _owner,
    address[] memory _voters,
    uint256[] memory _allowedVotes,
    bool _delegationAllowed
  ) public {
    owner = _owner;
    _delegationAllowed = delegationAllowed;
    voters = _voters;
    isClosed = false;

    for (uint256 i = 0; i < _voters.length; i++) {
      allowedVotesThroughoutSeries[_voters[i]] = _allowedVotes[i];
      votersWhitelist[_voters[i]] = true;
    }
  }

  function addPoll(
    string memory title,
    string memory description,
    bytes32[] memory _choices,
    uint256 _quorum,
    uint256 _endDate
  ) public {
    require(!isClosed, 'The series has been ended.');
    require(_endDate != 0, 'Quadratic Polls must have specified end time.');

    //check if there are previous polls, if so then get allowedVotes from it and check used votes to calculate remaining ones
    if (polls.length != 0) {
      QuadraticPoll lastPoll = QuadraticPoll(polls[polls.length - 1]);
      //check if previous poll has ended, if not then revert
      (bool isFinished, ) = lastPoll.isFinished();
      require(isFinished, 'Last poll in the series has not yet ended, cannot add new one.');
      for (uint256 i = 0; i < voters.length; i++) {
        allowedVotesThroughoutSeries[voters[i]] -= lastPoll.allowedVotes(voters[i]);
      }
    }

    QuadraticPoll poll =
      new QuadraticPoll(
        owner,
        title,
        description,
        _choices,
        voters,
        prepeareAllowedVotes(),
        _quorum,
        _endDate,
        delegationAllowed
      );
    polls.push(poll);
  }

  function getNumberOfPollsInTheSeries() public view returns (uint256 amount) {
    return polls.length;
  }

  function closeSeries() external returns (bool) {
    require(msg.sender == owner, 'Only owner can close the series.');
    isClosed = true;
    return true;
  }

  function prepeareAllowedVotes() internal view returns (uint256[] memory) {
    uint256[] memory amountOfAllowedVotes = new uint256[](voters.length);
    for (uint256 i = 0; i < voters.length; i++) {
      amountOfAllowedVotes[i] = allowedVotesThroughoutSeries[voters[i]];
    }
    return amountOfAllowedVotes;
  }
}
