// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

library StringHelper {
  function stringToBytes32(string memory source) public pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly {
      result := mload(add(source, 32))
    }
  }

  function bytes32ToString(bytes memory _bytes32) public pure returns (string memory) {
    uint8 i = 0;
    while (i < 32 && _bytes32[i] != 0) {
      i++;
    }
    bytes memory bytesArray = new bytes(i);
    for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
      bytesArray[i] = _bytes32[i];
    }
    return string(bytesArray);
  }

  function bytes32ArrayToString(bytes32[] memory data) public pure returns (string memory) {
    bytes memory bytesString = new bytes(data.length * 32);
    uint256 urlLength;
    for (uint256 i = 0; i < data.length; i++) {
      for (uint256 j = 0; j < 32; j++) {
        bytes1 char = bytes1(bytes32(uint256(data[i]) * 2**(8 * j)));
        if (char != 0) {
          bytesString[urlLength] = char;
          urlLength += 1;
        }
      }
    }
    bytes memory bytesStringTrimmed = new bytes(urlLength);
    for (uint256 i = 0; i < urlLength; i++) {
      bytesStringTrimmed[i] = bytesString[i];
    }
    return string(bytesStringTrimmed);
  }
}
