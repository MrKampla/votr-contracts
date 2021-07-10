// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import '../interfaces/IVotrPollFactory.sol';
import '../interfaces/IPollType.sol';
import '@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol';

contract VotrPoll is ERC20PresetMinterPauser, ERC20Wrapper {
  address private _votrFactory;
  address public pollType;

  string public title;
  string public description;
  address[] public voters;
  bytes32[] public choices;
  address public chairman;
  bool public allowVoteDelegation;
  uint256 public quorum;
  uint256 public endDate;
  mapping(address => uint256) public amountOfUnderlyingTokenDeposited;

  constructor(
    address _chairman,
    address votrFactory_,
    address _pollType,
    IVotrPollFactory.TokenSettings memory _tokenSettings,
    IVotrPollFactory.PollSettings memory _pollSettings,
    bytes32[] memory _choices,
    IVotrPollFactory.Voter[] memory _voters
  )
    ERC20PresetMinterPauser(_tokenSettings.name, _tokenSettings.symbol)
    ERC20Wrapper(IERC20(_tokenSettings.basedOnToken))
  {
    _votrFactory = votrFactory_;
    chairman = _chairman;
    pollType = _pollType;
    grantRole(MINTER_ROLE, _pollType);
    grantRole(PAUSER_ROLE, _pollType);
    choices = _choices;
    title = _pollSettings.title;
    description = _pollSettings.description;
    quorum = _pollSettings.quorum;
    endDate = _pollSettings.endDate;
    allowVoteDelegation = _pollSettings.allowVoteDelegation;
    if (_tokenSettings.basedOnToken == address(0)) {
      for (uint256 i = 0; i < _voters.length; i++) {
        voters.push(_voters[i].addr);
        _approve(_voters[i].addr, _pollType, _voters[i].allowedVotes);
        _mint(_voters[i].addr, _voters[i].allowedVotes);
      }
    }
    IPollType(_pollType).onInit(address(this), _chairman);
  }

  function vote(uint256[] memory _choices, int256[] memory amountOfVotes) public returns (bool) {
    IPollType(pollType).vote(msg.sender, _choices, amountOfVotes);
    IVotrPollFactory(_votrFactory).emitVotedEvent(msg.sender, _choices, amountOfVotes);
    return true;
  }

  function delegateVote(address to, uint256 amount) public returns (bool) {
    require(allowVoteDelegation == true, 'Vote delegation is not allowed');
    return IPollType(pollType).delegateVote(msg.sender, to, amount);
  }

  function checkWinner() public view returns (uint256 winnerIndex) {
    return IPollType(pollType).checkWinner(choices.length);
  }

  function isFinished() public view returns (bool finished, bool quorumReached) {
    (finished, quorumReached) = IPollType(pollType).isFinished(quorum, endDate);
  }

  function transfer(address recipient, uint256 amount) public override returns (bool) {
    require(allowVoteDelegation == true, 'Vote delegation is not allowed');
    _transfer(msg.sender, recipient, amount);
    return true;
  }

  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) public override returns (bool) {
    require(allowVoteDelegation == true || msg.sender == pollType, 'Vote delegation is not allowed');
    return super.transferFrom(sender, recipient, amount);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal virtual override(ERC20PresetMinterPauser, ERC20) {
    super._beforeTokenTransfer(from, to, amount);
  }

  function lock(uint256 amount) public {
    // increase voting power with longer locking periods
    amountOfUnderlyingTokenDeposited[msg.sender] += amount;
    depositFor(msg.sender, amount);
    _approve(msg.sender, pollType, amount);
  }

  function unlock(uint256 amount) public {
    require(amount <= amountOfUnderlyingTokenDeposited[msg.sender], 'Unlock amount exceeds deposited amount');
    amountOfUnderlyingTokenDeposited[msg.sender] -= amount;
    uint256 amountOfTokensToBurn = min(balanceOf(msg.sender), amount);
    _burn(msg.sender, amountOfTokensToBurn);
    IERC20(underlying).transfer(msg.sender, amount);
    unchecked {
      _approve(msg.sender, pollType, allowance(msg.sender, pollType) - amount);
    }
  }

  function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
    return x <= y ? x : y;
  }
}
