// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EquoraRoyaltyPool.sol";

/**
 * @title EquoraSalaryPool
 * @dev Renamed to EquoraRoyaltyPool (Leadership Royalty Pool).
 *      This wrapper ensures 100% backward compatibility with existing deployment scripts and tests.
 */
contract EquoraSalaryPool is EquoraRoyaltyPool {
    constructor(address _paymentToken, address _vault)
        EquoraRoyaltyPool(_paymentToken, _vault)
    {}
}
