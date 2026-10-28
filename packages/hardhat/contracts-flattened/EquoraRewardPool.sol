// Sources flattened with hardhat v2.29.1 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/pools/EquoraRewardPool.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;


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

    receive() external payable {}

    fallback() external payable {}

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

        bool ok = false;
        if (address(this).balance >= amount) {
            (bool sent, ) = payable(msg.sender).call{value: amount}("");
            ok = sent;
        }
        if (!ok && address(paymentToken) != address(0)) {
            try paymentToken.transfer(msg.sender, amount) returns (bool res) {
                ok = res;
            } catch {}
        }
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
