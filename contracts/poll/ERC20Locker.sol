// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol';

abstract contract ERC20Locker is ERC20Wrapper {
  mapping(address => uint256) public amountOfUnderlyingTokenDeposited;
  address public pollType;

  constructor(IERC20 underlyingToken, address _pollType) ERC20Wrapper(underlyingToken) {
    pollType = _pollType;
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
