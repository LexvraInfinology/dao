// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EquoraCoin.sol";

/**
 * @title EquoraToken (Compatibility Alias for EquoraCoin)
 * @dev Preserves backward compatibility while pointing to EquoraCoin with 21 Crore supply.
 */
contract EquoraToken is EquoraCoin {
    constructor(address _treasury) EquoraCoin(_treasury) {}
}
