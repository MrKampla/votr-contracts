// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPollType {
  event Voted(address indexed who, uint256 indexed chosen, int256 votesAmount);

  function vote(uint256[] memory choices, int256[] memory amountOfVotes) external returns (bool);

  function checkWinner() external view returns (uint256 winnerIndex);

  function isFinished() external view returns (bool finished, bool quorumReached);

  function delegateVote(address to, uint256 amount) external returns (bool);
}
