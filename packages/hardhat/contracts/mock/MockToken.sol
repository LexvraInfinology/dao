// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockToken
 * @dev A simple ERC-20 token for local testing only.
 *      Mints 1,000,000 tokens to every address that calls mint().
 *      DO NOT deploy to mainnet.
 */
contract MockToken is ERC20 {
    constructor() ERC20("Mock Equora Token", "mEQR") {
        // Mint 10M to deployer
        _mint(msg.sender, 10_000_000 * 10 ** 18);
    }

    /**
     * @dev Anyone can mint up to 10,000 tokens for testing.
     */
    function mint(address to, uint256 amount) external {
        require(amount <= 10_000 * 10 ** 18, "MockToken: Max 10,000 per mint");
        _mint(to, amount);
    }

    /**
     * @dev Faucet: gives 1000 mock tokens to caller
     */
    function faucet() external {
        _mint(msg.sender, 1_000 * 10 ** 18);
    }
}
