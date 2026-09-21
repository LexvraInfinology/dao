// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EquoraToken
 * @dev Equora Platform's native ERC-20 utility token.
 *      - Used as the payment currency for DAO ($300) and Matrix ($30) entries
 *      - Used as the 3-year locked Magic Box reward token
 *      - Mintable by owner (platform treasury), burnable by holders
 *      - Pausable for emergency circuit breaker
 *
 * Tokenomics:
 *   - Name: Equora Token
 *   - Symbol: EQR
 *   - Decimals: 18
 *   - Initial Supply: 10,000,000 EQR minted to deployer
 *   - Max Supply: 100,000,000 EQR
 */
contract EquoraToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18; // 100M tokens
    uint256 public constant INITIAL_SUPPLY = 10_000_000 * 10 ** 18; // 10M tokens

    // Authorized minters (vesting vault, reward contracts)
    mapping(address => bool) public isMinter;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner(), "EquoraToken: Not authorized minter");
        _;
    }

    constructor(address _treasury) ERC20("Equora Token", "EQR") Ownable(_treasury) {
        require(_treasury != address(0), "EquoraToken: Invalid treasury");
        _mint(_treasury, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint new tokens — only owner or authorized minters
     * @param to Recipient address
     * @param amount Amount to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "EquoraToken: Mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "EquoraToken: Max supply exceeded");
        _mint(to, amount);
    }

    /**
     * @dev Add an authorized minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "EquoraToken: Invalid minter");
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
     * @dev Pause all token transfers — emergency circuit breaker
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Resume token transfers
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
