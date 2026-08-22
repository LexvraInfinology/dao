// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBTitanVestingVault
 * @dev Interface for the 3-year time-lock Magic Box vesting vault
 */
interface IBTitanVestingVault {
    struct TokenLock {
        address beneficiary;
        uint256 amount;
        uint256 unlockTimestamp;
        bool claimed;
        uint256 milestoneSlot; // which slot triggered this (3, 6, 9, or 12)
    }

    function lockTokens(
        address beneficiary,
        uint256 amount,
        uint256 milestoneSlot
    ) external returns (uint256 lockIndex);

    function claimUnlockedTokens(uint256 lockIndex) external;
    function getUserLocks(address user) external view returns (TokenLock[] memory);
    function getClaimableAmount(address user) external view returns (uint256 claimable);
    function getTotalLockedAmount(address user) external view returns (uint256);
}
