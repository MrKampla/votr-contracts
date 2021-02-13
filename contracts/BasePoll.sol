// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import './StringHelper.sol';
import './IPoll.sol';

contract BasePoll is IPoll {
  string public title;
  string public description;
  address public chairman;
  uint256 public quorum;
  uint256 public endDate;
  bool public allowVoteDelegation;
  string public pollType;
  mapping(address => bool) public hasVoted;

  struct Choice {
    string name;
    int256 voteCount;
  }
  Choice[] public choices;

  function amountOfChoices() public view returns (uint256) {
    return choices.length;
  }

  address[] public voters;

  function amountOfVoters() public view returns (uint256) {
    return voters.length;
  }

  mapping(address => uint256) public allowedVotes;
  mapping(address => bool) public votersWhitelist;

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
  ) public {
    require(_endDate > block.timestamp, 'The end date cannot be in past.');
    title = _title;
    description = _description;
    voters = _voters;
    endDate = _endDate;
    chairman = _chairman;
    quorum = _quorum;
    allowVoteDelegation = _allowVoteDelegation;

    // initialize choices
    for (uint256 i = 0; i < _choices.length; i++) {
      bytes32 name = _choices[i];
      choices.push(Choice({ name: StringHelper.bytes32ToString(abi.encodePacked(name)), voteCount: 0 }));
    }

    // initialize voters
    for (uint256 i = 0; i < _voters.length; i++) {
      allowedVotes[_voters[i]] = _allowedVotes[i];
      votersWhitelist[_voters[i]] = true;
    }
  }

  function vote(uint256 choice, int256 amountOfVotes)
    external
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
    require(amountOfVotes <= int256(allowedVotes[msg.sender]), 'The voter has insufficient votes.');
    require(amountOfVotes > 0, 'You cannot give negative number of votes in this type of poll.');

    allowedVotes[msg.sender] -= uint256(amountOfVotes);
    hasVoted[msg.sender] = true;
    choices[choice].voteCount += amountOfVotes;
    emit Voted(msg.sender, choice, amountOfVotes);

    return (msg.sender, choice, choices[choice].voteCount);
  }

  function checkWinner() external view virtual override returns (uint256 winnerIndex) {
    uint256 winningChoice = 0;
    for (uint256 i = 0; i < choices.length; i++) {
      if (choices[i].voteCount > int256(winningChoice)) {
        winningChoice = i;
      }
    }
    return winningChoice;
  }

  function isFinished() public view virtual override returns (bool finished, bool quorumReached) {
    uint256 pastVoters = 0;

    for (uint256 i = 0; i < voters.length; i++) {
      pastVoters += hasVoted[voters[i]] ? 1 : 0;
    }

    if (pastVoters != 0 && pastVoters == voters.length) return (true, true);
    if (endDate == 0) {
      return (true, pastVoters >= quorum);
    }
    return (block.timestamp >= endDate, pastVoters >= quorum);
  }

  function delegateVote(address to, uint256 amount) external virtual override onlyOngoing returns (bool) {
    require(allowVoteDelegation, 'Vote delegation is disabled for this poll.');
    require(votersWhitelist[msg.sender], 'The voter is not allowed to vote.');
    require(allowedVotes[msg.sender] >= amount, 'The voter has insufficient votes.');
    require(votersWhitelist[to], 'The recipient is not allowed to vote.');

    allowedVotes[msg.sender] -= amount;
    allowedVotes[to] += amount;

    return true;
  }

  modifier onlyOngoing() {
    (bool finished, ) = isFinished();
    require(!finished, 'The poll has already ended.');
    _;
  }
}
