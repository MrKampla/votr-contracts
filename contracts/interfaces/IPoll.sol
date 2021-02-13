// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

interface IPoll {
  event Voted(address indexed who, uint256 indexed chosen, int256 votesAmount);

  function vote(uint256 choice, int256 amountOfVotes)
    external
    returns (
      address voter,
      uint256 choiceIndex,
      int256 voteCount
    );

  function checkWinner() external view returns (uint256 winnerIndex);

  function isFinished() external view returns (bool finished, bool quorumReached);

  function delegateVote(address to, uint256 amount) external returns (bool);
}
