// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBTitanRegistry
 * @dev Interface for the B-TITAN user registry and referral tracking contract
 */
interface IBTitanRegistry {
    function registerUser(address user, address sponsor) external returns (bool);
    function isRegistered(address user) external view returns (bool);
    function getSponsor(address user) external view returns (address);
    function getDirectReferrals(address user) external view returns (address[] memory);
    function getDirectReferralsCount(address user) external view returns (uint256);
    function isQualified(address user) external view returns (bool);
    function getRoot() external view returns (address);
}
