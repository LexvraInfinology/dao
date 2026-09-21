// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IEquoraNFT.sol";

/**
 * @title EquoraNFT
 * @dev Equora Platform NFT Contract — ERC-721 compliant (via OpenZeppelin)
 *
 * Token Types:
 *   1. WELCOME PASS — Minted when any user first joins the platform (DAO or Matrix)
 *      - Soul-bound (non-transferable) by default
 *      - Proof of membership
 *
 *   2. RANK BADGES — Minted at Magic Box milestones:
 *      - RISING    → Slot 3 first cycle complete
 *      - PRIME     → Slot 6 first cycle complete
 *      - ROYAL     → Slot 9 first cycle complete
 *      - LEGENDARY → Slot 12 first cycle complete
 *
 * Security:
 *   - Only authorized contracts (Matrix, DAO) can mint
 *   - Each user can only have 1 Welcome Pass
 *   - Rank badges stack (user can have all 4 ranks)
 */
contract EquoraNFT is ERC721, ERC721Enumerable, IEquoraNFT, Ownable {
    // ─── State ─────────────────────────────────────────────────────────────

    uint256 private _nextTokenId = 1;

    // Token metadata
    struct TokenData {
        IEquoraNFT.Rank rank;
        bool isWelcomePass;
        uint256 mintTimestamp;
    }

    mapping(uint256 => TokenData) public tokenData;
    mapping(address => uint256) private _welcomePassId;   // user → tokenId (0 = none)
    mapping(address => IEquoraNFT.Rank) private _userRanks;

    // Authorized minter contracts
    mapping(address => bool) public isMinter;

    // ─── Events ────────────────────────────────────────────────────────────

    event WelcomePassMinted(address indexed to, uint256 indexed tokenId);
    event RankBadgeMinted(address indexed to, uint256 indexed tokenId, IEquoraNFT.Rank rank);
    event MinterSet(address indexed minter, bool authorized);

    // ─── Modifiers ─────────────────────────────────────────────────────────

    modifier onlyMinter() {
        require(
            isMinter[msg.sender] || msg.sender == owner(),
            "EquoraNFT: Not authorized minter"
        );
        _;
    }

    // ─── Constructor ────────────────────────────────────────────────────────

    constructor() ERC721("Equora Pass", "EQPASS") Ownable(msg.sender) {}

    // ─── Admin ─────────────────────────────────────────────────────────────

    /**
     * @dev Grant or revoke minting rights to a contract address
     */
    function setMinter(address minter, bool authorized) external onlyOwner {
        isMinter[minter] = authorized;
        emit MinterSet(minter, authorized);
    }

    // ─── Minting ───────────────────────────────────────────────────────────

    /**
     * @dev Mint a Welcome Pass to a new platform member.
     *      Each address can only have 1 Welcome Pass.
     */
    function mintWelcomePass(address to) external override onlyMinter returns (uint256 tokenId) {
        require(to != address(0), "EquoraNFT: Mint to zero address");
        require(_welcomePassId[to] == 0, "EquoraNFT: Welcome pass already minted");

        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        tokenData[tokenId] = TokenData({
            rank: IEquoraNFT.Rank.NONE,
            isWelcomePass: true,
            mintTimestamp: block.timestamp
        });

        _welcomePassId[to] = tokenId;

        emit WelcomePassMinted(to, tokenId);
    }

    /**
     * @dev Mint a Rank Badge NFT at a Magic Box milestone.
     *      Multiple rank badges can be minted per user (one per milestone).
     */
    function mintRankBadge(
        address to,
        IEquoraNFT.Rank rank
    ) external override onlyMinter returns (uint256 tokenId) {
        require(to != address(0), "EquoraNFT: Mint to zero address");
        require(rank != IEquoraNFT.Rank.NONE, "EquoraNFT: Invalid rank");

        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        tokenData[tokenId] = TokenData({
            rank: rank,
            isWelcomePass: false,
            mintTimestamp: block.timestamp
        });

        // Update user's highest rank
        if (uint8(rank) > uint8(_userRanks[to])) {
            _userRanks[to] = rank;
        }

        emit RankBadgeMinted(to, tokenId, rank);
    }

    // ─── View Functions ────────────────────────────────────────────────────

    function getWelcomePassTokenId(address user) external view override returns (uint256) {
        return _welcomePassId[user];
    }

    function getUserRank(address user) external view override returns (IEquoraNFT.Rank) {
        return _userRanks[user];
    }

    function hasWelcomePass(address user) external view override returns (bool) {
        return _welcomePassId[user] != 0;
    }

    /**
     * @dev Get all token IDs owned by a user
     */
    function getUserTokens(address user) external view returns (uint256[] memory) {
        uint256 count = balanceOf(user);
        uint256[] memory tokens = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            tokens[i] = tokenOfOwnerByIndex(user, i);
        }
        return tokens;
    }

    // ─── Required Overrides ────────────────────────────────────────────────

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
