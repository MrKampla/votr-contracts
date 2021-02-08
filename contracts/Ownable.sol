// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract Ownable {
  address public owner;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    if (msg.sender == owner) _;
  }

  function transferOwnership(address newOwner) public onlyOwner {
    if (newOwner != address(0)) owner = newOwner;
  }
}
