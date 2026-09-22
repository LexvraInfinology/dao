// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EquoraSalaryPool
 * @dev Monthly salary distribution across 4 exclusive pool tiers:
 *        Alpha: 10% (1,000 BPS)
 *        Prime: 15% (1,500 BPS)
 *        Elite: 25% (2,500 BPS)
 *        Crown: 50% (5,000 BPS)
 *
 * === POOL TIER MILESTONES ====================================================
 *   Users progress through tiers based on cumulative milestone contributions:
 *     Alpha Pool  — milestones >= 42   (14 nodes × 3 levels)
 *     Prime Pool  — milestones >= 84   (14 nodes × 6 levels)
 *     Elite Pool  — milestones >= 126  (14 nodes × 9 levels)
 *     Crown Pool  — milestones >= 168  (14 nodes × 12 levels)
 *
 * === EXCLUSIVE CURRENT-ACHIEVEMENT-ONLY MODEL =================================
 *   Users receive payouts ONLY for their current highest tier:
 *     Alpha Pool (10%):  split equally among current Alpha members only.
 *     Prime Pool (15%):  split equally among current Prime members only.
 *     Elite Pool (25%):  split equally among current Elite members only.
 *     Crown Pool (50%):  split equally among current Crown members only.
 *
 *   When a user advances from Alpha to Prime, they are removed from Alpha
 *   and added to Prime, ensuring zero double-dipping or multi-pool dilution.
 *
 * === EMPTY TIER HANDLING (ZERO-ACHIEVER STRATEGY) =============================
 *   1. All Tiers Empty (0 achievers platform-wide):
 *      The entire pending balance remains in `pendingPoolBalance` and carries over
 *      (rolls over) to the next month's settlement on the 11th. Zero funds are lost.
 *   2. Higher Tiers Empty:
 *      Unclaimed shares waterfall down to the highest active tier:
 *        Crown (50%) -> Elite -> Prime -> Alpha
 *      If lower tiers are empty (e.g. all members promoted to Prime/Elite):
 *        Alpha (10%) -> Prime -> Elite -> Crown
 *      Ensures 100% of accumulated funds are always distributed if any achievers exist.
 *
 * === AUTO-SETTLEMENT =========================================================
 *   - `settleMonthly()` callable on or after the 11th of every month (UTC).
 *   - Minimum 28 days interval between settlements (cannot double-settle).
 *   - Permissionless: anyone or Chainlink Automation can trigger it.
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

    // ─── Constants (10% Alpha, 15% Prime, 25% Elite, 50% Crown = 100%) ────────

    uint256 public constant ALPHA_POOL_BPS  = 1000;  // 10%
    uint256 public constant PRIME_POOL_BPS  = 1500;  // 15%
    uint256 public constant ELITE_POOL_BPS  = 2500;  // 25%
    uint256 public constant CROWN_POOL_BPS  = 5000;  // 50%
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
    mapping(address => PoolTier) public currentTier;        // user's exclusive active tier

    // Pool membership arrays (stores members EXCLUSIVELY in that specific tier)
    address[] public alphaMembers;  // current exclusive Alpha members
    address[] public primeMembers;  // current exclusive Prime members
    address[] public eliteMembers;  // current exclusive Elite members
    address[] public crownMembers;  // current exclusive Crown members

    mapping(address => bool) public inAlpha;
    mapping(address => bool) public inPrime;
    mapping(address => bool) public inElite;
    mapping(address => bool) public inCrown;

    mapping(address => uint256) internal _tierIndex; // 0-indexed position in current tier array

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
    event MonthlySettlementRollover(uint256 rolloverAmount, uint256 timestamp);
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

        emit UserCredited(user, salaryContribution, currentTier[user], block.timestamp);
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
     * @dev Internal: advance user milestone count and trigger exclusive tier promotions.
     *      Each tier promotion notifies EquoraRewardPool for a one-time cash reward.
     *      Maintains exclusive arrays via O(1) swap-and-pop.
     */
    function _advanceMilestone(address user) internal {
        userMilestones[user]++;
        uint256 count = userMilestones[user];
        PoolTier oldTier = currentTier[user];
        PoolTier newTier = _getTier(count);

        if (newTier != oldTier && newTier != PoolTier.NONE) {
            currentTier[user] = newTier;

            // Remove from previous tier array if user was promoted from a lower tier
            if (oldTier == PoolTier.ALPHA) {
                _removeFromTier(alphaMembers, user);
                inAlpha[user] = false;
            } else if (oldTier == PoolTier.PRIME) {
                _removeFromTier(primeMembers, user);
                inPrime[user] = false;
            } else if (oldTier == PoolTier.ELITE) {
                _removeFromTier(eliteMembers, user);
                inElite[user] = false;
            }

            // Add to new tier array
            if (newTier == PoolTier.ALPHA) {
                _tierIndex[user] = alphaMembers.length;
                alphaMembers.push(user);
                inAlpha[user] = true;
            } else if (newTier == PoolTier.PRIME) {
                _tierIndex[user] = primeMembers.length;
                primeMembers.push(user);
                inPrime[user] = true;
            } else if (newTier == PoolTier.ELITE) {
                _tierIndex[user] = eliteMembers.length;
                eliteMembers.push(user);
                inElite[user] = true;
            } else if (newTier == PoolTier.CROWN) {
                _tierIndex[user] = crownMembers.length;
                crownMembers.push(user);
                inCrown[user] = true;
            }

            emit RankAchieved(user, newTier, count, block.timestamp);
            _notifyRewardPool(user, uint8(newTier));
        }
    }

    function _removeFromTier(address[] storage arr, address user) internal {
        uint256 len = arr.length;
        if (len == 0) return;
        uint256 idx = _tierIndex[user];
        uint256 lastIdx = len - 1;
        if (idx != lastIdx) {
            address lastUser = arr[lastIdx];
            arr[idx] = lastUser;
            _tierIndex[lastUser] = idx;
        }
        arr.pop();
        delete _tierIndex[user];
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
     * @dev Distribute the accumulated salary pool across the 4 exclusive tiers:
     *      Alpha (10%), Prime (15%), Elite (25%), Crown (50%).
     *      Callable by ANYONE (permissionless) on or after the 11th of each month.
     *      Cannot be called twice in the same calendar month.
     *
     *      EXCLUSIVE CURRENT-ACHIEVEMENT DISTRIBUTION:
     *        Members receive payouts ONLY for their current tier.
     *
     *      ZERO-ACHIEVER HANDLING:
     *        1. If ALL tiers are empty (0 achievers platform-wide):
     *           100% of pendingPoolBalance rolls over to the next month's settlement.
     *        2. If higher tiers are empty:
     *           Unclaimed funds cascade downward to the highest populated tier
     *           (Crown -> Elite -> Prime -> Alpha).
     *        3. If lower tiers are empty:
     *           Unclaimed funds cascade upward (Alpha -> Prime -> Elite -> Crown).
     */
    function settleMonthly() external nonReentrant {
        _checkSettlementWindow();

        uint256 totalPool = pendingPoolBalance;
        uint256 totalAchievers = alphaMembers.length + primeMembers.length + eliteMembers.length + crownMembers.length;

        // Condition 1: Zero achievers in any tier platform-wide -> Full rollover to next month
        if (totalAchievers == 0) {
            lastSettlementTimestamp = block.timestamp;
            settlementCount++;
            emit MonthlySettlementRollover(totalPool, block.timestamp);
            return;
        }

        // Mark settled
        lastSettlementTimestamp = block.timestamp;
        settlementCount++;

        if (totalPool == 0) return;

        pendingPoolBalance = 0;

        // Calculate initial tier shares: 10% Alpha, 15% Prime, 25% Elite, 50% Crown
        uint256 alphaPool = (totalPool * ALPHA_POOL_BPS) / BPS_BASE;
        uint256 primePool = (totalPool * PRIME_POOL_BPS) / BPS_BASE;
        uint256 elitePool = (totalPool * ELITE_POOL_BPS) / BPS_BASE;
        uint256 crownPool = (totalPool * CROWN_POOL_BPS) / BPS_BASE;

        // Cascade top-down if higher tiers are empty
        if (crownMembers.length == 0) {
            elitePool += crownPool;
            crownPool = 0;
        }
        if (eliteMembers.length == 0) {
            primePool += elitePool;
            elitePool = 0;
        }
        if (primeMembers.length == 0) {
            alphaPool += primePool;
            primePool = 0;
        }

        // Cascade bottom-up if lower tiers are empty (e.g., all members promoted)
        if (alphaMembers.length == 0) {
            if (primeMembers.length > 0) {
                primePool += alphaPool;
                alphaPool = 0;
            } else if (eliteMembers.length > 0) {
                elitePool += alphaPool;
                alphaPool = 0;
            } else if (crownMembers.length > 0) {
                crownPool += alphaPool;
                alphaPool = 0;
            }
        }

        // Distribute each pool equally to current tier members
        uint256 distributed = 0;
        distributed += _distributeToMembers(crownMembers, crownPool);
        distributed += _distributeToMembers(eliteMembers, elitePool);
        distributed += _distributeToMembers(primeMembers, primePool);
        distributed += _distributeToMembers(alphaMembers, alphaPool);

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

    function _distributeToMembers(address[] storage members, uint256 poolAmount) internal returns (uint256) {
        uint256 count = members.length;
        if (count == 0 || poolAmount == 0) return 0;
        uint256 perMember = poolAmount / count;
        if (perMember == 0) return 0;

        for (uint256 i = 0; i < count; i++) {
            pendingBalance[members[i]] += perMember;
        }
        return perMember * count;
    }

    function _checkSettlementWindow() internal view {
        if (lastSettlementTimestamp > 0) {
            if (block.timestamp < lastSettlementTimestamp + MIN_INTERVAL) revert TooSoon();
        }
        uint256 dayOfMonth = _getDayOfMonth(block.timestamp);
        if (dayOfMonth < SETTLEMENT_DAY) revert NotSettlementDay();
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
        return currentTier[user] != PoolTier.NONE ? currentTier[user] : _getTier(userMilestones[user]);
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
     * @dev Returns 1 if user qualifies for a salary pool, 0 if none.
     */
    function getUserPoolCount(address user) external view returns (uint256) {
        return currentTier[user] != PoolTier.NONE ? 1 : 0;
    }
}

// ─── Minimal interface for EquoraRewardPool notification ──────────────────────

interface IEquoraRewardPool {
    function creditMilestoneReward(address user, uint8 rank) external;
}
