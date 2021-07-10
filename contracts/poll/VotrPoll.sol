// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import '../interfaces/IVotrPollFactory.sol';
import '../interfaces/IPollType.sol';
import './ERC20Locker.sol';
import '@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol';

contract VotrPoll is ERC20PresetMinterPauser, ERC20Locker {
  address private _votrFactory;
  string public title;
  string public description;
  address[] public voters;
  bytes32[] public choices;
  address public chairman;
  bool public allowVoteDelegation;
  uint256 public quorum;
  uint256 public endDate;

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
    ERC20Locker(IERC20(_tokenSettings.basedOnToken), _pollType)
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
}
