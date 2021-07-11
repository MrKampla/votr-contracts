// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol';
import '../poll/VotrPoll.sol';

abstract contract ERC20Locker is ERC20Wrapper {
  struct Deposit {
    uint256 id;
    uint256 amountDeposited;
    uint256 startDate;
    uint256 endDate;
  }
  mapping(address => Deposit[]) public userDeposits;
  mapping(address => uint256) public userNextDepositId;
  address public pollType;
  address public votrPollContract;

  constructor(
    IERC20 underlyingToken,
    address _pollType,
    address _votrPollContract
  ) ERC20Wrapper(underlyingToken) {
    pollType = _pollType;
    votrPollContract = _votrPollContract;
  }

  function lock(uint256 amount, uint256 endDate) public returns (uint256 depositId) {
    depositFor(msg.sender, amount);
    Deposit memory deposit = Deposit({
      id: userNextDepositId[msg.sender],
      amountDeposited: amount,
      startDate: block.timestamp,
      endDate: endDate
    });
    userNextDepositId[msg.sender]++;
    userDeposits[msg.sender].push(deposit);
    _approve(msg.sender, pollType, amount);
    return depositId;
  }

  function unlockAll() public {
    (bool isFinished, ) = VotrPoll(votrPollContract).isFinished();
    require(isFinished == true, 'Cannot withdraw funds until poll is finished');
    for (uint256 i = 0; i < userDeposits[msg.sender].length; i++) {
      Deposit memory deposit = userDeposits[msg.sender][i];
      _unlock(deposit.id);
    }
  }

  function _unlock(uint256 depositId) internal {
    Deposit memory deposit = userDeposits[msg.sender][depositId];
    require(deposit.endDate < block.timestamp, 'Locking period not finished');
    uint256 amountOfTokensToBurn = min(balanceOf(msg.sender), deposit.amountDeposited);
    _burn(msg.sender, amountOfTokensToBurn);
    IERC20(underlying).transfer(msg.sender, deposit.amountDeposited);
    unchecked {
      _approve(msg.sender, pollType, allowance(msg.sender, pollType) - deposit.amountDeposited);
    }
    removeWithoutAGap(depositId);
  }

  function removeWithoutAGap(uint256 index) internal {
    if (index >= userDeposits[msg.sender].length) return;

    for (uint256 i = index; i < userDeposits[msg.sender].length - 1; i++) {
      userDeposits[msg.sender][i] = userDeposits[msg.sender][i + 1];
    }
    delete userDeposits[msg.sender][userDeposits[msg.sender].length - 1];
    userDeposits[msg.sender].pop();
  }

  function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
    return x <= y ? x : y;
  }
}
