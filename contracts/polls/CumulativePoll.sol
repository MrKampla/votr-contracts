// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import './BasePoll.sol';

contract CumulativePoll is BasePoll {
  constructor(
    address _chairman,
    string memory _title,
    string memory _description,
    bytes32[] memory _choices,
    address[] memory _voters,
    uint256[] memory _allowedVotes,
    uint256 _quorum,
    uint256 _endDate,
    bool _allowVoteDelegation
  )
    public
    BasePoll(_chairman, _title, _description, _choices, _voters, _allowedVotes, _quorum, _endDate, _allowVoteDelegation)
  {
    pollType = 'Cumulative';
  }
}
