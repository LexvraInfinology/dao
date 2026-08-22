// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IBTitanVestingVault.sol";

/**
 * @title BTitanVestingVault
 * @dev 3-Year Time-Lock Vault for B-TITAN Magic Box Rewards
 *
 * How it works:
 *   - When a user reaches a Magic Box milestone (Slot 3, 6, 9, 12),
 *     the Matrix contract calls lockTokens() to lock 1 BTT token
 *   - The token is locked for exactly 3 years from the lock timestamp
 *   - After 3 years, the user can call claimUnlockedTokens() to receive their BTT
 *   - Additionally, the user receives 2.5% equity entitlement (tracked on-chain)
 *
 * Security:
 *   - ReentrancyGuard on claim
 *   - Only authorized matrix contract can create locks
 *   - Immutable lock duration (3 years = 3 * 365 days)
 */
contract BTitanVestingVault is IBTitanVestingVault, Ownable, ReentrancyGuard {
    // ─── Constants ─────────────────────────────────────────────────────────

    uint256 public constant LOCK_DURATION = 3 * 365 days; // 94,608,000 seconds
    uint256 public constant EQUITY_BPS = 250;              // 2.50% in basis points

    // ─── State ─────────────────────────────────────────────────────────────

    IERC20 public rewardToken;
    address public authorizedMatrix;
    address public authorizedDAO;

    IBTitanVestingVault.TokenLock[] public allLocks;
    mapping(address => uint256[]) private _userLockIndices;
    mapping(address => uint256) public totalLockedByUser;
    mapping(address => uint256) public totalClaimedByUser;
    mapping(address => uint256) public equityBpsOwed;       // 2.5% equity per milestone

    // ─── Events ────────────────────────────────────────────────────────────

    event TokensLocked(
        uint256 indexed lockIndex,
        address indexed beneficiary,
        uint256 amount,
        uint256 unlockTimestamp,
        uint256 indexed milestoneSlot
    );
    event TokensClaimed(
        uint256 indexed lockIndex,
        address indexed beneficiary,
        uint256 amount,
        uint256 timestamp
    );
    event EquityEntitlementRecorded(
        address indexed user,
        uint256 equityBps,
        uint256 totalEquityBps
    );
    event RewardTokenSet(address indexed token);
    event AuthorizedContractsSet(address indexed matrix, address indexed dao);

    // ─── Modifiers ─────────────────────────────────────────────────────────

    modifier onlyAuthorized() {
        require(
            msg.sender == owner() ||
            msg.sender == authorizedMatrix ||
            msg.sender == authorizedDAO,
            "BTitanVestingVault: Unauthorized"
        );
        _;
    }

    // ─── Constructor ────────────────────────────────────────────────────────

    constructor(address _rewardToken) Ownable(msg.sender) {
        if (_rewardToken != address(0)) {
            rewardToken = IERC20(_rewardToken);
        }
    }

    // ─── Admin ─────────────────────────────────────────────────────────────

    function setRewardToken(address _token) external onlyOwner {
        require(_token != address(0), "BTitanVestingVault: Invalid token");
        rewardToken = IERC20(_token);
        emit RewardTokenSet(_token);
    }

    function setAuthorizedContracts(address _matrix, address _dao) external onlyOwner {
        authorizedMatrix = _matrix;
        authorizedDAO = _dao;
        emit AuthorizedContractsSet(_matrix, _dao);
    }

    // ─── Lock Tokens ────────────────────────────────────────────────────────

    /**
     * @dev Lock 1 BTT for 3 years as a Magic Box reward.
     *      Called by the Matrix contract at milestone slots.
     *      Also records 2.5% equity entitlement.
     *
     * @param beneficiary User who earned the reward
     * @param amount Amount of BTT to lock (1 * 10^18 = 1 BTT)
     * @param milestoneSlot Which slot milestone triggered this (3, 6, 9, or 12)
     * @return lockIndex Index in the allLocks array
     */
    function lockTokens(
        address beneficiary,
        uint256 amount,
        uint256 milestoneSlot
    ) external override onlyAuthorized returns (uint256 lockIndex) {
        require(beneficiary != address(0), "BTitanVestingVault: Invalid beneficiary");
        require(amount > 0, "BTitanVestingVault: Zero amount");

        uint256 unlockTimestamp = block.timestamp + LOCK_DURATION;
        lockIndex = allLocks.length;

        allLocks.push(IBTitanVestingVault.TokenLock({
            beneficiary: beneficiary,
            amount: amount,
            unlockTimestamp: unlockTimestamp,
            claimed: false,
            milestoneSlot: milestoneSlot
        }));

        _userLockIndices[beneficiary].push(lockIndex);
        totalLockedByUser[beneficiary] += amount;

        // Record equity entitlement (2.5% per milestone)
        equityBpsOwed[beneficiary] += EQUITY_BPS;

        emit TokensLocked(lockIndex, beneficiary, amount, unlockTimestamp, milestoneSlot);
        emit EquityEntitlementRecorded(beneficiary, EQUITY_BPS, equityBpsOwed[beneficiary]);

        return lockIndex;
    }

    // ─── Claim Tokens ───────────────────────────────────────────────────────

    /**
     * @dev Claim unlocked tokens from a specific lock.
     *      Can only be called after 3 years from lock time.
     * @param lockIndex The index of the lock to claim
     */
    function claimUnlockedTokens(uint256 lockIndex) external override nonReentrant {
        require(lockIndex < allLocks.length, "BTitanVestingVault: Invalid lock index");
        IBTitanVestingVault.TokenLock storage lock = allLocks[lockIndex];

        require(lock.beneficiary == msg.sender, "BTitanVestingVault: Not your lock");
        require(!lock.claimed, "BTitanVestingVault: Already claimed");
        require(
            block.timestamp >= lock.unlockTimestamp,
            "BTitanVestingVault: Still locked - 3-year vesting active"
        );
        require(address(rewardToken) != address(0), "BTitanVestingVault: Reward token not set");

        lock.claimed = true;
        totalLockedByUser[msg.sender] -= lock.amount;
        totalClaimedByUser[msg.sender] += lock.amount;

        bool ok = rewardToken.transfer(msg.sender, lock.amount);
        require(ok, "BTitanVestingVault: Transfer failed");

        emit TokensClaimed(lockIndex, msg.sender, lock.amount, block.timestamp);
    }

    // ─── View Functions ────────────────────────────────────────────────────

    function getUserLocks(address user) external view override returns (
        IBTitanVestingVault.TokenLock[] memory
    ) {
        uint256[] storage indices = _userLockIndices[user];
        IBTitanVestingVault.TokenLock[] memory locks = new IBTitanVestingVault.TokenLock[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            locks[i] = allLocks[indices[i]];
        }
        return locks;
    }

    function getClaimableAmount(address user) external view override returns (uint256 claimable) {
        uint256[] storage indices = _userLockIndices[user];
        for (uint256 i = 0; i < indices.length; i++) {
            IBTitanVestingVault.TokenLock storage lock = allLocks[indices[i]];
            if (!lock.claimed && block.timestamp >= lock.unlockTimestamp) {
                claimable += lock.amount;
            }
        }
    }

    function getTotalLockedAmount(address user) external view override returns (uint256) {
        return totalLockedByUser[user];
    }

    /**
     * @dev Get user's total equity entitlement in basis points (250 per milestone)
     *      250 BPS = 2.5%, 1000 BPS = 10%, max is 1000 BPS for all 4 milestones
     */
    function getEquityBps(address user) external view returns (uint256) {
        return equityBpsOwed[user];
    }

    /**
     * @dev Time remaining until a specific lock can be claimed
     * @return 0 if already claimable, otherwise seconds remaining
     */
    function getTimeUntilUnlock(uint256 lockIndex) external view returns (uint256) {
        require(lockIndex < allLocks.length, "BTitanVestingVault: Invalid index");
        IBTitanVestingVault.TokenLock storage lock = allLocks[lockIndex];
        if (block.timestamp >= lock.unlockTimestamp) return 0;
        return lock.unlockTimestamp - block.timestamp;
    }

    /**
     * @dev Get total number of locks across all users
     */
    function getTotalLocks() external view returns (uint256) {
        return allLocks.length;
    }
}
