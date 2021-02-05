pragma solidity >=0.4.22 <0.8.0;

import './StringHelper.sol';

interface IPoll {
  event Voted(address indexed who, uint256 indexed chosen, uint256 votesAmount);

  function vote(uint256 choice, uint256 amountOfVotes)
    external
    returns (
      address voter,
      uint256 choiceIndex,
      uint256 voteCount
    );

  function checkWinner() external view returns (uint256 winnerIndex);

  function isFinished() external view returns (bool finished, bool quorumReached);

  function delegateVote(address to, uint256 amount) external returns (bool);
}

contract BasePoll is IPoll {
  string public title;
  string public description;
  address public chairman;
  uint256 public quorum;
  uint256 public endDate;
  bool public allowVoteDelegation;
  string public pollType;
  uint256 private sumOfAllAllowedVotes;

  struct Choice {
    string name;
    uint256 voteCount;
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

    for (uint256 i; i < _allowedVotes.length; i++) {
      sumOfAllAllowedVotes += _allowedVotes[i];
    }

    // initialize voters
    for (uint256 i = 0; i < _voters.length; i++) {
      allowedVotes[_voters[i]] = _allowedVotes[i];
      votersWhitelist[_voters[i]] = true;
    }
  }

  function vote(uint256 choice, uint256 amountOfVotes)
    public
    onlyOngoing
    returns (
      address voter,
      uint256 choiceIndex,
      uint256 voteCount
    )
  {
    require(choice < choices.length, 'There is no such candidate with this index.');
    require(amountOfVotes <= allowedVotes[msg.sender], 'The voter has insufficient votes.');

    allowedVotes[msg.sender] -= amountOfVotes;
    Choice storage selectedOption = choices[choice];
    selectedOption.voteCount += amountOfVotes;
    emit Voted(msg.sender, choice, amountOfVotes);

    return (msg.sender, choice, selectedOption.voteCount);
  }

  function checkWinner() public view returns (uint256 winnerIndex) {
    uint256 winningChoice = 0;
    for (uint256 i = 0; i < choices.length; i++) {
      if (choices[i].voteCount > winningChoice) {
        winningChoice = i;
      }
    }
    return winningChoice;
  }

  function isFinished() public view returns (bool finished, bool quorumReached) {
    //In one-person-many-votes implementations of polls, a loop which counts all allowed votes needs to be used
    uint256 maxAllowedVotes = voters.length;
    uint256 receivedVotes = 0;

    //count reveived amount of votes by all choices
    for (uint256 i = 0; i < choices.length; i++) {
      receivedVotes += choices[i].voteCount;
    }
    if (receivedVotes != 0 && receivedVotes == maxAllowedVotes) return (true, true);
    if (endDate == 0) {
      return (true, receivedVotes >= quorum);
    }
    return (block.timestamp >= endDate, receivedVotes >= quorum);
  }

  function delegateVote(address to, uint256 amount) public onlyOngoing returns (bool) {
    require(votersWhitelist[msg.sender], 'The voter is not allowed to vote.');
    require(allowedVotes[msg.sender] >= amount, 'The voter has insufficient votes.');
    require(votersWhitelist[to], 'The recipient is not allowed to vote.');
    require(allowVoteDelegation, 'Vote delegation is disabled for this poll.');

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
