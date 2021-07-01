// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import '../interfaces/IVotrPollFactory.sol';
import '@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol';

contract VotrPoll is ERC20PresetMinterPauser {
  address private _votrFactory;
  address public pollType;
  bytes32[] public choices;
  address public testAddr;
  string public title;
  string public description;
  uint256 public quorum;
  uint256 public endDate;
  bool public allowVoteDelegation;

  constructor(
    address votrFactory_,
    address _pollType,
    IVotrPollFactory.TokenSettings memory _tokenSettings,
    IVotrPollFactory.PollSettings memory _pollSettings,
    bytes32[] memory _choices,
    IVotrPollFactory.Voter[] memory _voters
  ) ERC20PresetMinterPauser(_tokenSettings.name, _tokenSettings.symbol) {
    _votrFactory = votrFactory_;
    pollType = _pollType;
    choices = _choices;
    testAddr = _voters[0].addr;
    title = _pollSettings.title;
    _mint(msg.sender, 1000);
  }

  function vote(uint256[] memory _choices, int256[] memory amountOfVotes) public returns (bool) {
    IVotrPollFactory(_votrFactory).emitVotedEvent(msg.sender, _choices, amountOfVotes);
    return true;
  }
}
