// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EquoraRewardPool
 * @dev Instant One-Time Level Rewards — triggered on milestone rank achievement.
 *
 * === OVERVIEW =================================================================
 *   The Level Rewards pool receives 15% of ALL platform deposits.
 *   When a user first achieves a new salary rank (Alpha/Prime/Elite/Crown),
 *   they instantly receive a one-time reward proportional to the pool balance.
 *
 * === REWARD STRUCTURE =========================================================
 *   Each rank triggers a SINGLE, INSTANT, ONE-TIME payout:
 *
 *   Alpha milestone (first achieved) → 10% of current pool balance
 *   Prime milestone (first achieved) → 15% of current pool balance
 *   Elite milestone (first achieved) → 25% of current pool balance
 *   Crown milestone (first achieved) → 50% of current pool balance
 *
 *   Example: If pool has 10,000 TROB when user hits Crown:
 *     Crown payout = 5,000 TROB (50% of 10,000)
 *     Pool balance becomes 5,000 TROB after payout.
 *
 *   NOTE: The pool balance grows continuously from deposits, so each milestone
 *   payout is based on the pool balance AT THE TIME the rank is achieved.
 *
 * === TRIGGER MECHANISM ========================================================
 *   `creditMilestoneReward()` is called by EquoraSalaryPool when it detects
 *   a user crossing a rank threshold via `advanceMilestone()`.
 *
 *   Only EquoraSalaryPool (authorized) can call creditMilestoneReward().
 *   One-time enforcement: `rankRewarded[user][rank]` mapping prevents double-claiming.
 *
 * === FUND FLOW ================================================================
 *   EquoraVault → transfers 15% of every deposit → this contract (poolBalance)
 *   EquoraSalaryPool → calls creditMilestoneReward(user, rank) on rank-up
 *   User → calls claimReward() to receive pending TROB
 *
 * === NO PAUSE / NO STOP ======================================================
 *   No owner. Fully permissionless. Runs autonomously once deployed.
 */
contract EquoraRewardPool is ReentrancyGuard {

    // ─── Rank Constants ────────────────────────────────────────────────────────

    uint8 public constant RANK_ALPHA = 1;  // matches PoolTier.ALPHA
    uint8 public constant RANK_PRIME = 2;  // matches PoolTier.PRIME
    uint8 public constant RANK_ELITE = 3;  // matches PoolTier.ELITE
    uint8 public constant RANK_CROWN = 4;  // matches PoolTier.CROWN

    // Percentage of pool balance paid out for each rank (in BPS)
    uint256 public constant ALPHA_REWARD_BPS = 1000;  // 10%
    uint256 public constant PRIME_REWARD_BPS = 1500;  // 15%
    uint256 public constant ELITE_REWARD_BPS = 2500;  // 25%
    uint256 public constant CROWN_REWARD_BPS = 5000;  // 50%
    uint256 public constant BPS_BASE         = 10000;

    // ─── State ─────────────────────────────────────────────────────────────────

    IERC20  public immutable paymentToken;
    address public immutable vault;         // EquoraVault — sends pool deposits here

    address public authorizedCaller;        // EquoraSalaryPool — calls creditMilestoneReward

    uint256 public poolBalance;             // TROB available for milestone rewards
    uint256 public totalDistributed;

    // Per-user milestone reward tracking
    mapping(address => mapping(uint8 => bool))    public rankRewarded;   // user => rank => paid?
    mapping(address => uint256)                   public pendingReward;   // claimable TROB
    mapping(address => uint256)                   public totalRewarded;   // lifetime claimed

    // ─── Events ────────────────────────────────────────────────────────────────

    event PoolDeposit(uint256 amount, uint256 newPoolBalance, uint256 timestamp);
    event MilestoneRewarded(
        address indexed user,
        uint8   indexed rank,
        uint256 rewardAmount,
        uint256 poolBalanceBefore,
        uint256 timestamp
    );
    event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event AuthorizedCallerSet(address indexed caller);

    // ─── Errors ────────────────────────────────────────────────────────────────

    error OnlyVault();
    error OnlyAuthorized();
    error NothingToClaim();
    error TransferFailed();
    error InvalidRank();
    error AlreadyRewarded();

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor(address _paymentToken, address _vault) {
        require(_paymentToken != address(0), "EquoraRewardPool: Invalid token");
        require(_vault        != address(0), "EquoraRewardPool: Invalid vault");
        paymentToken = IERC20(_paymentToken);
        vault        = _vault;
    }

    /**
     * @dev Set the authorized caller (EquoraSalaryPool) for creditMilestoneReward.
     *      Can only be set once (after deployment wiring).
     */
    function setAuthorizedCaller(address _caller) external {
        require(authorizedCaller == address(0), "EquoraRewardPool: already set");
        require(_caller != address(0), "EquoraRewardPool: invalid caller");
        authorizedCaller = _caller;
        emit AuthorizedCallerSet(_caller);
    }

    // ─── Fund Reception (from EquoraVault) ────────────────────────────────────

    /**
     * @dev Called implicitly — TROB is transferred to this contract by EquoraVault.
     *      The poolBalance must be manually synced OR we use a receive/deposit pattern.
     *      Since vault uses transfer() directly, we track via receiveDeposit().
     */
    function receiveDeposit(uint256 amount) external {
        // Anyone can call this to sync the pool balance, but TROB must already
        // be transferred to this contract. Vault calls this after each transfer.
        // In practice, poolBalance is tracked by reading token balance.
        // For simplicity: vault transfers, then calls this to update accounting.
        poolBalance += amount;
        emit PoolDeposit(amount, poolBalance, block.timestamp);
    }

    // ─── Milestone Reward (called by EquoraSalaryPool) ────────────────────────

    /**
     * @dev Credit a one-time milestone reward to a user when they achieve a new rank.
     *      Called by EquoraSalaryPool when a user crosses a rank threshold.
     *
     *      Reward amounts (% of current pool balance at time of achievement):
     *        Alpha → 10%  of poolBalance
     *        Prime → 15%  of poolBalance
     *        Elite → 25%  of poolBalance
     *        Crown → 50%  of poolBalance
     *
     * @param user  The user who achieved the rank
     * @param rank  The rank achieved (1=Alpha, 2=Prime, 3=Elite, 4=Crown)
     */
    function creditMilestoneReward(address user, uint8 rank) external {
        if (msg.sender != authorizedCaller) revert OnlyAuthorized();
        if (rank < RANK_ALPHA || rank > RANK_CROWN) revert InvalidRank();
        if (rankRewarded[user][rank]) return; // Silently skip if already rewarded (no revert)

        // Mark as rewarded before calculating (prevent reentrancy edge case)
        rankRewarded[user][rank] = true;

        if (poolBalance == 0) return; // Pool empty — no reward this time

        uint256 rewardBps;
        if      (rank == RANK_ALPHA) rewardBps = ALPHA_REWARD_BPS;
        else if (rank == RANK_PRIME) rewardBps = PRIME_REWARD_BPS;
        else if (rank == RANK_ELITE) rewardBps = ELITE_REWARD_BPS;
        else if (rank == RANK_CROWN) rewardBps = CROWN_REWARD_BPS;

        uint256 balanceBefore = poolBalance;
        uint256 reward        = (poolBalance * rewardBps) / BPS_BASE;

        if (reward > poolBalance) reward = poolBalance; // safety cap
        if (reward == 0) return;

        poolBalance      -= reward;
        totalDistributed += reward;
        pendingReward[user] += reward;

        emit MilestoneRewarded(user, rank, reward, balanceBefore, block.timestamp);
    }

    // ─── User Claim ────────────────────────────────────────────────────────────

    /**
     * @dev User claims their pending milestone rewards. Pull-based.
     */
    function claimReward() external nonReentrant {
        uint256 amount = pendingReward[msg.sender];
        if (amount == 0) revert NothingToClaim();

        pendingReward[msg.sender]  = 0;
        totalRewarded[msg.sender] += amount;

        bool ok = paymentToken.transfer(msg.sender, amount);
        if (!ok) revert TransferFailed();

        emit RewardClaimed(msg.sender, amount, block.timestamp);
    }

    // ─── View Functions ────────────────────────────────────────────────────────

    function getPendingReward(address user) external view returns (uint256) {
        return pendingReward[user];
    }

    /**
     * @dev Preview how much a user would receive if they hit a rank right now.
     */
    function previewMilestoneReward(uint8 rank) external view returns (uint256 reward) {
        if (rank < RANK_ALPHA || rank > RANK_CROWN || poolBalance == 0) return 0;

        uint256 rewardBps;
        if      (rank == RANK_ALPHA) rewardBps = ALPHA_REWARD_BPS;
        else if (rank == RANK_PRIME) rewardBps = PRIME_REWARD_BPS;
        else if (rank == RANK_ELITE) rewardBps = ELITE_REWARD_BPS;
        else if (rank == RANK_CROWN) rewardBps = CROWN_REWARD_BPS;

        return (poolBalance * rewardBps) / BPS_BASE;
    }

    /**
     * @dev Returns a user's reward claim status for all 4 ranks.
     */
    function getUserRewardStatus(address user) external view returns (
        bool alphaRewarded,
        bool primeRewarded,
        bool eliteRewarded,
        bool crownRewarded,
        uint256 pending,
        uint256 lifetimeClaimed
    ) {
        return (
            rankRewarded[user][RANK_ALPHA],
            rankRewarded[user][RANK_PRIME],
            rankRewarded[user][RANK_ELITE],
            rankRewarded[user][RANK_CROWN],
            pendingReward[user],
            totalRewarded[user]
        );
    }

    function getPoolStats()
        external view
        returns (
            uint256 balance,
            uint256 totalDist
        )
    {
        return (poolBalance, totalDistributed);
    }
}
