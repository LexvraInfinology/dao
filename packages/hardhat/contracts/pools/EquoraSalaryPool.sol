// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EquoraSalaryPool
 * @dev Monthly salary distribution across 4 pool tiers: Alpha, Prime, Elite, Crown.
 *
 * === POOL TIER STRUCTURE =====================================================
 *   Users progress through tiers based on cumulative salary deposit contributions.
 *   A "milestone event" = one creditUser() call from the vault (one deposit received).
 *
 *   Alpha Pool  — milestones  1–42   (14 nodes × 3 cycles)
 *   Prime Pool  — milestones 43–84
 *   Elite Pool  — milestones 85–126
 *   Crown Pool  — milestones 127–168
 *
 * === CUMULATIVE LADDERING =====================================================
 *   Unlike a simple exclusive split, higher tier members receive from ALL lower pools:
 *
 *     Pool A (25%): distributed equally among ALL users with rank >= Alpha
 *                   (alpha + prime + elite + crown members together)
 *     Pool B (25%): distributed equally among users with rank >= Prime
 *                   (prime + elite + crown members together)
 *     Pool C (25%): distributed equally among users with rank >= Elite
 *                   (elite + crown members together)
 *     Pool D (25%): distributed equally among Crown members ONLY
 *
 *   Example: A Crown member receives a share from ALL 4 pools.
 *            An Elite member receives from Pool A, B, and C (3 pools).
 *            A Prime member receives from Pool A and B (2 pools).
 *            An Alpha member receives from Pool A only (1 pool).
 *
 *   This rewards higher achievers significantly more while still including
 *   all members in at least the base pool.
 *
 * === AUTO-SETTLEMENT =========================================================
 *   - `settleMonthly()` callable on the 11th of every month (UTC).
 *   - Permissionless: anyone can trigger it once the condition is met.
 *   - Chainlink Automation will be the reliable caller in production.
 *   - Cannot be settled twice in the same month.
 *
 * === MILESTONE REWARD TRIGGER ================================================
 *   When a user first reaches a new tier (Alpha/Prime/Elite/Crown), this contract
 *   calls the EquoraRewardPool to credit them a one-time instant milestone reward.
 *
 * === NO PAUSE / NO STOP ======================================================
 *   This contract has NO owner, NO pause, NO stop function.
 *   Once deployed, salary distribution runs autonomously forever.
 */
contract EquoraSalaryPool is ReentrancyGuard {

    // ─── Pool Enum ─────────────────────────────────────────────────────────────

    enum PoolTier { NONE, ALPHA, PRIME, ELITE, CROWN }

    uint256 public constant ALPHA_THRESHOLD = 42;   // 42 IDs (3 levels × 14 slots)  → Alpha
    uint256 public constant PRIME_THRESHOLD = 84;   // 84 IDs (6 levels × 14 slots)  → Prime
    uint256 public constant ELITE_THRESHOLD = 126;  // 126 IDs (9 levels × 14 slots) → Elite
    uint256 public constant CROWN_THRESHOLD = 168;  // 168 IDs (12 levels × 14 slots)→ Crown

    // ─── Constants ─────────────────────────────────────────────────────────────

    uint256 public constant POOL_SHARE_BPS  = 2500;  // 25% per pool (4 pools total)
    uint256 public constant BPS_BASE        = 10000;

    uint256 public constant SETTLEMENT_DAY  = 11;
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant MIN_INTERVAL    = 28 days;

    // ─── State ─────────────────────────────────────────────────────────────────

    IERC20  public immutable paymentToken;
    address public immutable vault;          // EquoraVault — only caller of creditUser
    address public rewardPool;               // EquoraRewardPool — notified on rank-up

    // Per-user tracking
    mapping(address => uint256) public userMilestones;      // cumulative deposit events
    mapping(address => uint256) public pendingBalance;      // claimable salary
    mapping(address => uint256) public totalSalaryClaimed;  // lifetime claimed

    // Pool membership arrays
    // NOTE: Alpha array = ALL members that crossed alpha threshold
    //       Prime array = members that crossed prime threshold
    //       (These are NOT mutually exclusive — Crown is in alpha/prime/elite/crown all)
    address[] public alphaMembers;  // all users with milestone >= 42
    address[] public primeMembers;  // all users with milestone >= 84
    address[] public eliteMembers;  // all users with milestone >= 126
    address[] public crownMembers;  // all users with milestone >= 168

    mapping(address => bool) public inAlpha;
    mapping(address => bool) public inPrime;
    mapping(address => bool) public inElite;
    mapping(address => bool) public inCrown;

    // Accumulated TROB balance ready for next settlement
    uint256 public pendingPoolBalance;

    // Settlement tracking
    uint256 public lastSettlementTimestamp;
    uint256 public settlementCount;
    uint256 public totalDistributed;

    // ─── Events ────────────────────────────────────────────────────────────────

    event UserCredited(address indexed user, uint256 contribution, PoolTier tier, uint256 timestamp);
    event RankAchieved(address indexed user, PoolTier newTier, uint256 milestones, uint256 timestamp);
    event MonthlySettlement(
        uint256 indexed settlementNumber,
        uint256 totalDistributed,
        uint256 alphaEligible,
        uint256 primeEligible,
        uint256 eliteEligible,
        uint256 crownEligible,
        uint256 timestamp
    );
    event SalaryClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event RewardPoolSet(address indexed rewardPool);

    // ─── Errors ────────────────────────────────────────────────────────────────

    error OnlyVault();
    error NotSettlementDay();
    error TooSoon();
    error NothingToClaim();
    error TransferFailed();

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor(address _paymentToken, address _vault) {
        require(_paymentToken != address(0), "EquoraSalaryPool: Invalid token");
        require(_vault        != address(0), "EquoraSalaryPool: Invalid vault");
        paymentToken = IERC20(_paymentToken);
        vault        = _vault;
    }

    /**
     * @dev Set EquoraRewardPool address (called once after deployment wiring).
     *      Can only be set once.
     */
    function setRewardPool(address _rewardPool) external {
        require(rewardPool == address(0), "EquoraSalaryPool: already set");
        require(_rewardPool != address(0), "EquoraSalaryPool: invalid");
        rewardPool = _rewardPool;
        emit RewardPoolSet(_rewardPool);
    }

    // ─── Called by EquoraVault ─────────────────────────────────────────────────

    /**
     * @dev Called by EquoraVault when routing a user deposit.
     *      Accumulates the salary slice into pendingPoolBalance.
     *      Also advances the user's milestone count (each deposit = 1 milestone event).
     */
    function creditUser(address user, uint256 salaryContribution) external {
        if (msg.sender != vault) revert OnlyVault();

        pendingPoolBalance += salaryContribution;

        // Advance milestone and check for tier promotions
        _advanceMilestone(user);

        PoolTier tier = _getTier(userMilestones[user]);
        emit UserCredited(user, salaryContribution, tier, block.timestamp);
    }

    /**
     * @dev Called by EquoraVault when routing matrix volume deposits (P4, P5, P14).
     *      Adds to pendingPoolBalance for monthly salary distribution.
     */
    function receivePoolDeposit(uint256 amount) external {
        if (msg.sender != vault) revert OnlyVault();
        pendingPoolBalance += amount;
    }

    /**
     * @dev Internal: advance user milestone count and trigger tier promotions.
     *      Each tier promotion triggers a one-time reward from EquoraRewardPool.
     */
    function _advanceMilestone(address user) internal {
        userMilestones[user]++;
        uint256 count = userMilestones[user];

        if (count >= ALPHA_THRESHOLD && !inAlpha[user]) {
            inAlpha[user] = true;
            alphaMembers.push(user);
            emit RankAchieved(user, PoolTier.ALPHA, count, block.timestamp);
            _notifyRewardPool(user, uint8(PoolTier.ALPHA));
        }
        if (count >= PRIME_THRESHOLD && !inPrime[user]) {
            inPrime[user] = true;
            primeMembers.push(user);
            emit RankAchieved(user, PoolTier.PRIME, count, block.timestamp);
            _notifyRewardPool(user, uint8(PoolTier.PRIME));
        }
        if (count >= ELITE_THRESHOLD && !inElite[user]) {
            inElite[user] = true;
            eliteMembers.push(user);
            emit RankAchieved(user, PoolTier.ELITE, count, block.timestamp);
            _notifyRewardPool(user, uint8(PoolTier.ELITE));
        }
        if (count >= CROWN_THRESHOLD && !inCrown[user]) {
            inCrown[user] = true;
            crownMembers.push(user);
            emit RankAchieved(user, PoolTier.CROWN, count, block.timestamp);
            _notifyRewardPool(user, uint8(PoolTier.CROWN));
        }
    }

    /**
     * @dev Notify EquoraRewardPool of a new rank milestone for instant payout.
     *      Uses try/catch so a reward pool failure never reverts salary logic.
     */
    function _notifyRewardPool(address user, uint8 rank) internal {
        if (rewardPool == address(0)) return;
        try IEquoraRewardPool(rewardPool).creditMilestoneReward(user, rank) {} catch {}
    }

    // ─── Settlement (11th of Month) ────────────────────────────────────────────

    /**
     * @dev Distribute the accumulated salary pool using CUMULATIVE LADDERING.
     *      Callable by ANYONE (permissionless) on the 11th of each month.
     *      Cannot be called twice in the same calendar month.
     *
     *      CUMULATIVE DISTRIBUTION:
     *        Pool A (25%): shared among all Alpha+ members (alpha + prime + elite + crown)
     *        Pool B (25%): shared among all Prime+ members (prime + elite + crown)
     *        Pool C (25%): shared among all Elite+ members (elite + crown)
     *        Pool D (25%): shared among Crown members only
     *
     *      This means a Crown member gets a share from ALL 4 pools (effectively earning
     *      proportionally much more than an Alpha-only member).
     *
     *      Rolldown: if a pool tier has 0 members, its 25% rolls down to the next
     *      lower eligible tier. If all higher tiers are empty, Alpha gets everything.
     */
    function settleMonthly() external nonReentrant {
        _checkSettlementWindow();

        uint256 totalPool = pendingPoolBalance;

        // Mark settled even if pool is empty
        lastSettlementTimestamp = block.timestamp;
        settlementCount++;

        if (totalPool == 0) return;

        pendingPoolBalance = 0;

        uint256 perPool    = totalPool / 4;
        uint256 dustToAlpha = totalPool - (perPool * 4);

        // ── Pool D: Crown members only ────────────────────────────────────────
        // Crown is included in elite, prime, alpha arrays too (cumulative membership)
        // But for Pool D distribution, we use crownMembers array specifically.
        uint256 distributed = 0;

        // Pool D (25%) → Crown only
        distributed += _distributePerPool(crownMembers, inCrown, perPool, alphaMembers, inAlpha);

        // Pool C (25%) → Elite+ (Elite + Crown together)
        // Build combined list: eliteMembers (which includes those NOT crown)
        // Since our arrays are additive (inElite = true for elite, prime, crown),
        // we use the full eliteMembers array which has everyone >= Elite threshold.
        distributed += _distributePerPool(eliteMembers, inElite, perPool, alphaMembers, inAlpha);

        // Pool B (25%) → Prime+ (Prime + Elite + Crown together)
        distributed += _distributePerPool(primeMembers, inPrime, perPool, alphaMembers, inAlpha);

        // Pool A (25% + dust) → Alpha+ (everyone with rank)
        distributed += _distributePerPool(alphaMembers, inAlpha, perPool + dustToAlpha, alphaMembers, inAlpha);

        totalDistributed += distributed;

        emit MonthlySettlement(
            settlementCount,
            distributed,
            alphaMembers.length,
            primeMembers.length,
            eliteMembers.length,
            crownMembers.length,
            block.timestamp
        );
    }

    /**
     * @dev Distribute `poolShare` equally among `members`.
     *      If members array is empty, rolls down to `fallbackMembers`.
     *      Returns total amount actually distributed.
     */
    function _distributePerPool(
        address[] storage members,
        mapping(address => bool) storage memberMap,
        uint256 poolShare,
        address[] storage fallbackMembers,
        mapping(address => bool) storage fallbackMap
    ) internal returns (uint256 distributed) {
        if (poolShare == 0) return 0;

        // Use primary members if available
        address[] storage eligibleList = members.length > 0 ? members : fallbackMembers;
        mapping(address => bool) storage eligibleMap = members.length > 0 ? memberMap : fallbackMap;

        uint256 eligible = eligibleList.length;
        if (eligible == 0) return 0;

        uint256 perMember = poolShare / eligible;
        if (perMember == 0) return 0;

        for (uint256 i = 0; i < eligible; i++) {
            address m = eligibleList[i];
            if (eligibleMap[m]) {
                pendingBalance[m] += perMember;
                distributed       += perMember;
            }
        }
    }

    function _checkSettlementWindow() internal view {
        if (lastSettlementTimestamp > 0) {
            if (block.timestamp < lastSettlementTimestamp + MIN_INTERVAL) revert TooSoon();
        }
        uint256 dayOfMonth = _getDayOfMonth(block.timestamp);
        if (dayOfMonth < SETTLEMENT_DAY) revert NotSettlementDay();
        // Allow settling any time from day 11 onward in the month
        // (Chainlink automation calls on exact 11th, but we don't lock out day 12+
        //  in case automation missed it — MIN_INTERVAL prevents double-settling)
    }

    /**
     * @dev Calculate UTC day-of-month from Unix timestamp.
     *      Proleptic Gregorian calendar algorithm.
     */
    function _getDayOfMonth(uint256 timestamp) internal pure returns (uint256) {
        uint256 z   = timestamp / SECONDS_PER_DAY + 719468;
        uint256 era = z / 146097;
        uint256 doe = z - era * 146097;
        uint256 yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
        uint256 doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
        uint256 mp  = (5 * doy + 2) / 153;
        uint256 d   = doy - (153 * mp + 2) / 5 + 1;
        return d; // 1-indexed day of month
    }

    // ─── User Claim ────────────────────────────────────────────────────────────

    /**
     * @dev User claims their accumulated salary. Pull-based, permissionless.
     */
    function claimSalary() external nonReentrant {
        uint256 amount = pendingBalance[msg.sender];
        if (amount == 0) revert NothingToClaim();

        pendingBalance[msg.sender]       = 0;
        totalSalaryClaimed[msg.sender]  += amount;

        bool ok = paymentToken.transfer(msg.sender, amount);
        if (!ok) revert TransferFailed();

        emit SalaryClaimed(msg.sender, amount, block.timestamp);
    }

    // ─── View Functions ────────────────────────────────────────────────────────

    function getUserTier(address user) external view returns (PoolTier) {
        return _getTier(userMilestones[user]);
    }

    function _getTier(uint256 milestones) internal pure returns (PoolTier) {
        if (milestones >= CROWN_THRESHOLD) return PoolTier.CROWN;
        if (milestones >= ELITE_THRESHOLD) return PoolTier.ELITE;
        if (milestones >= PRIME_THRESHOLD) return PoolTier.PRIME;
        if (milestones >= ALPHA_THRESHOLD) return PoolTier.ALPHA;
        return PoolTier.NONE;
    }

    function getPoolCounts()
        external view
        returns (uint256 alpha, uint256 prime, uint256 elite, uint256 crown)
    {
        return (alphaMembers.length, primeMembers.length, eliteMembers.length, crownMembers.length);
    }

    function getClaimable(address user) external view returns (uint256) {
        return pendingBalance[user];
    }

    function getPoolStats()
        external view
        returns (
            uint256 pending,
            uint256 totalDist,
            uint256 settlements,
            uint256 lastSettlement
        )
    {
        return (pendingPoolBalance, totalDistributed, settlementCount, lastSettlementTimestamp);
    }

    /**
     * @dev Returns how many of the 4 salary pools a user qualifies for.
     *      Alpha = 1 pool, Prime = 2 pools, Elite = 3 pools, Crown = 4 pools.
     */
    function getUserPoolCount(address user) external view returns (uint256) {
        uint256 count = 0;
        if (inAlpha[user]) count++;
        if (inPrime[user]) count++;
        if (inElite[user]) count++;
        if (inCrown[user]) count++;
        return count;
    }
}

// ─── Minimal interface for EquoraRewardPool notification ──────────────────────

interface IEquoraRewardPool {
    function creditMilestoneReward(address user, uint8 rank) external;
}
