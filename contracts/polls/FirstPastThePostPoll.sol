// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import './BasePoll.sol';

contract FirstPastThePostPoll is BasePoll {
  constructor(
    address _chairman,
    string memory _title,
    string memory _description,
    bytes32[] memory _choices,
    address[] memory _voters,
    uint256 _quorum,
    uint256 _endDate,
    bool _allowVoteDelegation
  )
    public
    BasePoll(
      _chairman,
      _title,
      _description,
      _choices,
      _voters,
      prepeareAllowedVotes(_voters),
      _quorum,
      _endDate,
      _allowVoteDelegation
    )
  {
    pollType = 'FirstPastThePost';
  }

  function prepeareAllowedVotes(address[] memory _voters) internal pure returns (uint256[] memory) {
    uint256[] memory amountOfAllowedVotes = new uint256[](_voters.length);
    for (uint256 i = 0; i < _voters.length; i++) {
      amountOfAllowedVotes[i] = 1;
    }
    return amountOfAllowedVotes;
  }
}
