// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBTitanNFT
 * @dev Interface for the B-TITAN NFT contract (Welcome Pass + Rank Badges)
 */
interface IBTitanNFT {
    enum Rank {
        NONE,       // Not yet ranked
        RISING,     // Slot 3 completed
        PRIME,      // Slot 6 completed
        ROYAL,      // Slot 9 completed
        LEGENDARY   // Slot 12 completed (max)
    }

    function mintWelcomePass(address to) external returns (uint256 tokenId);
    function mintRankBadge(address to, Rank rank) external returns (uint256 tokenId);
    function getWelcomePassTokenId(address user) external view returns (uint256);
    function getUserRank(address user) external view returns (Rank);
    function hasWelcomePass(address user) external view returns (bool);
}
