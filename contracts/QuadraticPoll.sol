// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import './BasePoll.sol';

contract QuadraticPoll is BasePoll {
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
    pollType = 'Quadratic poll';
  }

  function vote(uint256 choice, int256 amountOfVotes)
    public
    virtual
    override
    onlyOngoing
    returns (
      address voter,
      uint256 choiceIndex,
      int256 voteCount
    )
  {
    require(choice < choices.length, 'There is no such candidate with this index.');
    require(amountOfVotes**2 <= int256(allowedVotes[msg.sender]), 'The voter has insufficient votes.');
    require(amountOfVotes > 0, 'You cannot give negative number of votes in this type of poll.');

    allowedVotes[msg.sender] -= uint256(amountOfVotes**2);
    Choice storage selectedOption = choices[choice];
    selectedOption.voteCount += amountOfVotes;
    emit Voted(msg.sender, choice, amountOfVotes);

    return (msg.sender, choice, selectedOption.voteCount);
  }

  function isFinished() public view virtual override returns (bool finished, bool quorumReached) {
    uint256 receivedVotes = 0;

    //count reveived amount of votes by all choices
    for (uint256 i = 0; i < choices.length; i++) {
      receivedVotes += uint256(choices[i].voteCount);
    }
    if (receivedVotes != 0 && receivedVotes**2 == sumOfAllAllowedVotes) return (true, true);
    if (endDate == 0) {
      return (true, receivedVotes >= quorum);
    }
    return (block.timestamp >= endDate, receivedVotes >= quorum);
  }

  function delegateVote(address to, uint256 amount) public virtual override onlyOngoing returns (bool) {
    require(allowVoteDelegation, 'Vote delegation is disabled for this poll.');
    require(votersWhitelist[msg.sender], 'The voter is not allowed to vote.');
    require(allowedVotes[msg.sender] >= amount**2, 'The voter has insufficient votes.');
    require(votersWhitelist[to], 'The recipient is not allowed to vote.');

    allowedVotes[msg.sender] -= amount**2;
    allowedVotes[to] += amount**2;

    return true;
  }
}
