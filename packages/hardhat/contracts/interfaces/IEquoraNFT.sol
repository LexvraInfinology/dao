// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEquoraNFT
 * @dev Interface for the Equora NFT contract (Welcome Pass + Rank Badges)
 */
interface IEquoraNFT {
    enum Rank {
        NONE,       // Not yet ranked
        ALPHA,      // Slot 3 completed (Levels 1-3 | 42 slots)
        PRIME,      // Slot 6 completed (Levels 4-6 | 84 slots)
        ELITE,      // Slot 9 completed (Levels 7-9 | 126 slots)
        CROWN       // Slot 12 completed (Levels 10-12 | 168 slots - max)
    }

    function mintWelcomePass(address to) external returns (uint256 tokenId);
    function mintRankBadge(address to, Rank rank) external returns (uint256 tokenId);
    function getWelcomePassTokenId(address user) external view returns (uint256);
    function getUserRank(address user) external view returns (Rank);
    function hasWelcomePass(address user) external view returns (bool);
}
