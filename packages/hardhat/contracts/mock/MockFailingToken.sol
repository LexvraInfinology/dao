// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockFailingToken
 * @dev Mock ERC-20 token that allows blacklisting a specific address to simulate a reverted transfer.
 */
contract MockFailingToken is ERC20 {
    mapping(address => bool) public isFailingRecipient;

    constructor() ERC20("Mock Failing Token", "MFT") {
        _mint(msg.sender, 10_000_000 * 10 ** 18);
    }

    function setFailingRecipient(address recipient, bool failing) external {
        isFailingRecipient[recipient] = failing;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        if (isFailingRecipient[to]) {
            revert("MFT: Transfer forced to revert for griefing test");
        }
        return super.transfer(to, amount);
    }
}
