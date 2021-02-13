// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import '../polls/FirstPastThePostPoll.sol';
import '../polls/CumulativePoll.sol';
import '../polls/EvaluativePoll.sol';

contract VotrPollFactory {
  uint256 public numberOfPolls;
  event PollCreated(address indexed owner, address indexed pollType);
  enum PollType { FirstPastThePost, Cumulative, Evaluative }

  function createPoll(
    PollType _type,
    string memory _title,
    string memory _description,
    bytes32[] memory _choices,
    address[] memory _voters,
    uint256[] memory _allowedVotes,
    uint256 _quorum,
    uint256 _endDate,
    bool _allowVoteDelegation
  ) public returns (address) {
    IPoll poll;
    if (_type == PollType.FirstPastThePost) {
      poll = new FirstPastThePostPoll(
        msg.sender,
        _title,
        _description,
        _choices,
        _voters,
        _quorum,
        _endDate,
        _allowVoteDelegation
      );
    }
    if (_type == PollType.Cumulative) {
      poll = new CumulativePoll(
        msg.sender,
        _title,
        _description,
        _choices,
        _voters,
        _allowedVotes,
        _quorum,
        _endDate,
        _allowVoteDelegation
      );
    }
    if (_type == PollType.Evaluative) {
      poll = new EvaluativePoll(msg.sender, _title, _description, _choices, _voters, _quorum, _endDate);
    }

    return _createPoll(msg.sender, address(poll));
  }

  function _createPoll(address owner, address poll) internal returns (address) {
    emit PollCreated(owner, poll);
    numberOfPolls++;
    return poll;
  }
}
