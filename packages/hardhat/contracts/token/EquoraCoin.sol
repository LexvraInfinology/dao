// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EquoraCoin
 * @dev Equora Platform's native TRC-20 / ERC-20 utility & governance coin.
 *      - Used as the payment currency for DAO ($300) and Matrix ($30) entries
 *      - Used as the 3-year locked Magic Box reward coin
 *      - Mintable by owner (platform treasury) up to 21 Crore hard cap, burnable by holders
 *      - Pausable for emergency circuit breaker
 *
 * Tokenomics:
 *   - Name: Equora Coin
 *   - Symbol: EQC
 *   - Decimals: 18
 *   - Total / Max Supply: 210,000,000 EQC (21 Crore Coins)
 *   - Initial Supply: 210,000,000 EQC (21 Crore Coins minted to Treasury)
 */
contract EquoraCoin is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    // 21 Crore = 210 Million (210,000,000 * 10^18)
    uint256 public constant MAX_SUPPLY = 210_000_000 * 10 ** 18; // 21 Crore coins
    uint256 public constant INITIAL_SUPPLY = 210_000_000 * 10 ** 18; // 21 Crore coins

    // Authorized minters (vesting vault, reward contracts)
    mapping(address => bool) public isMinter;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner(), "EquoraCoin: Not authorized minter");
        _;
    }

    constructor(address _treasury) ERC20("Equora Coin", "EQC") Ownable(_treasury) {
        require(_treasury != address(0), "EquoraCoin: Invalid treasury");
        _mint(_treasury, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint new coins — only owner or authorized minters (capped at 21 Crore)
     * @param to Recipient address
     * @param amount Amount to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "EquoraCoin: Mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "EquoraCoin: Max supply (21 Crore) exceeded");
        _mint(to, amount);
    }

    /**
     * @dev Add an authorized minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "EquoraCoin: Invalid minter");
        isMinter[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove an authorized minter
     */
    function removeMinter(address minter) external onlyOwner {
        isMinter[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Pause all coin transfers — emergency circuit breaker
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Resume coin transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // Required override for ERC20Pausable
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}
