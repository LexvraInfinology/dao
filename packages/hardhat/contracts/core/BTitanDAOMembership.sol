// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title BTitanDAOMembership
 * @dev Soulbound (Non-Transferable) ERC-721 representing Genesis DAO Membership.
 *
 * Requirements:
 *   - Exactly 100 tokens can ever exist (Token IDs 1 to 100).
 *   - Only the immutable BTitanDAO contract can mint tokens.
 *   - Tokens are soulbound: transfers between wallets revert automatically.
 *   - Each token ID directly corresponds to the member's queue position (1 to 100).
 */
contract BTitanDAOMembership is ERC721 {
    address public immutable daoContract;
    uint256 public constant MAX_SUPPLY = 100;
    uint256 public totalSupply;

    // Token ID => Queue Position (1 to 100)
    mapping(uint256 => uint256) public tokenPosition;
    // Wallet => Owned Token ID (0 if none)
    mapping(address => uint256) public memberTokenId;

    event MembershipMinted(address indexed member, uint256 indexed tokenId, uint256 position);

    error OnlyDAO();
    error SoulboundTransferBlocked();
    error MaxSupplyExceeded();
    error AlreadyMember();

    modifier onlyDAO() {
        if (msg.sender != daoContract) revert OnlyDAO();
        _;
    }

    constructor(address _daoContract) ERC721("B-TITAN Genesis DAO Membership", "BTT-DAO") {
        require(_daoContract != address(0), "Invalid DAO address");
        daoContract = _daoContract;
    }

    /**
     * @dev Mint a soulbound membership token to a new DAO member.
     * @param to Wallet address of the member
     * @param position 1-indexed queue position (1 to 100)
     * @return tokenId The minted token ID (same as position)
     */

    function mint(address to, uint256 position) external onlyDAO returns (uint256 tokenId) {
        if (position < 1 || position > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (memberTokenId[to] != 0) revert AlreadyMember();

        tokenId = position;
        tokenPosition[tokenId] = position;
        memberTokenId[to] = tokenId;
        totalSupply += 1;

        _safeMint(to, tokenId);
        emit MembershipMinted(to, tokenId, position);
    }

    /**
     * @dev Enforce soulbound property in OpenZeppelin ERC721 v5.
     *      Allows minting (from == address(0)), but blocks transfers.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // If from is not address(0), it is a transfer or burn -> block transfers
        if (from != address(0)) {
            revert SoulboundTransferBlocked();
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Check if an address holds a DAO membership.
     */
    function isMember(address wallet) external view returns (bool) {
        return memberTokenId[wallet] != 0;
    }

    /**
     * @dev Get the seat position for a wallet.
     */
    function getPosition(address wallet) external view returns (uint256) {
        return tokenPosition[memberTokenId[wallet]];
    }
}
