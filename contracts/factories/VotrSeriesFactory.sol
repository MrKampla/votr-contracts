// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import '../polls/QuadraticVotingSeries.sol';

contract VotrSeriesFactory {
  uint256 public numberOfSeries;
  event SeriesCreated(address indexed owner, address indexed series);

  function createSeries(
    address[] memory _voters,
    uint256[] memory _allowedVotes,
    bool _allowVoteDelegation
  ) public returns (address) {
    address newSeries = address(new QuadraticVotingSeries(msg.sender, _voters, _allowedVotes, _allowVoteDelegation));
    emit SeriesCreated(msg.sender, newSeries);
    numberOfSeries++;
    return newSeries;
  }
}
