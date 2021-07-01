// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVotrPollFactory {
  event Voted(address indexed pollAddress, address indexed who, uint256[] choices, int256[] votesAmount);
  event PollCreated(address indexed owner, address indexed pollAddress);

  struct TokenSettings {
    address basedOnToken;
    string name;
    string symbol;
  }
  struct PollSettings {
    string title;
    string description;
    uint256 quorum;
    uint256 endDate;
    bool allowVoteDelegation;
  }
  struct Voter {
    address addr;
    uint256 allowedVotes;
  }

  function createPoll(
    address _pollType,
    TokenSettings memory _tokenSettings,
    PollSettings memory _pollSettings,
    bytes32[] memory _choices,
    Voter[] memory _voters
  ) external returns (address);

  function emitVotedEvent(
    address who,
    uint256[] memory choices,
    int256[] memory votesAmount
  ) external;
}

// OLD syntax
// function createPoll(
//   address _pollType,
//   string memory _title,
//   string memory _description,
//   bytes32[] memory _choices,
//   address[] memory _voters,
//   uint256[] memory _allowedVotes,
//   uint256 _quorum,
//   uint256 _endDate,
//   bool _allowVoteDelegation
// ) external returns (address);
