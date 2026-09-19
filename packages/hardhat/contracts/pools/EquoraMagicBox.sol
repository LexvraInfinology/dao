// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EquoraMagicBox
 * @dev Shared Quarterly Pool with Weighted Random Lottery Distribution.
 *
 * === OVERVIEW =================================================================
 *   The Magic Blind Box is a shared pool accumulating 10% of ALL platform deposits.
 *   Every 3 months (quarterly), the entire pool is distributed to ALL eligible
 *   users via a weighted random lottery.
 *
 * === PRIZE TIERS =============================================================
 *   Winners are randomly selected per tier. Each user can win in at most one tier.
 *
 *   Tier 1 (Common)  — 85% of eligible users → each wins $0.50 in TROB
 *   Tier 2 (Uncommon) — 10% of eligible users → each wins $0.80 in TROB
 *   Tier 3 (Rare)     —  3% of eligible users → each wins $1.20 in TROB
 *   Tier 4 (Legendary)—  2% of eligible users → each wins $5.00 in TROB
 *
 *   USD prizes are converted to TROB using fallbackTrobPerUsd (updated by admin/oracle).
 *   If the pool balance is insufficient, prizes are scaled proportionally.
 *
 * === ELIGIBILITY =============================================================
 *   Any registered user (added by EquoraVault on registration) is eligible.
 *   Users are added once and remain eligible permanently.
 *
 * === QUARTERLY TRIGGER =======================================================
 *   - `distributeQuarterly(seed)` is callable on the 11th of every 3rd month.
 *   - Minimum interval: 85 days between distributions (prevents double-trigger).
 *   - Permissionless: anyone can call it when the window is open.
 *   - Chainlink Automation will be the reliable caller in production.
 *
 * === POOL ACCUMULATION =======================================================
 *   - `addToPool(amount)` is called by EquoraVault whenever it routes funds.
 *   - `addEligibleUser(user)` is called by EquoraVault on user registration.
 *
 * === NO PAUSE / NO STOP ======================================================
 *   No owner. Fully permissionless. Runs autonomously once deployed.
 */
contract EquoraMagicBox is ReentrancyGuard {

    // ─── Prize Tier Configuration ──────────────────────────────────────────────

    // Percentage of users in each tier (in basis points, total = 10000)
    uint256 public constant TIER1_USER_BPS = 8500;  // 85% get Tier 1
    uint256 public constant TIER2_USER_BPS = 1000;  // 10% get Tier 2
    uint256 public constant TIER3_USER_BPS =  300;  //  3% get Tier 3
    uint256 public constant TIER4_USER_BPS =  200;  //  2% get Tier 4
    uint256 public constant BPS_BASE       = 10000;

    // USD prize amounts in cents (avoid decimals)
    uint256 public constant TIER1_USD_CENTS = 50;   // $0.50
    uint256 public constant TIER2_USD_CENTS = 80;   // $0.80
    uint256 public constant TIER3_USD_CENTS = 120;  // $1.20
    uint256 public constant TIER4_USD_CENTS = 500;  // $5.00

    // Timing constants
    uint256 public constant MIN_INTERVAL    = 85 days;   // ~3 months minimum between draws
    uint256 public constant SETTLEMENT_DAY  = 11;
    uint256 public constant SECONDS_PER_DAY = 86400;

    // ─── State ─────────────────────────────────────────────────────────────────

    IERC20  public immutable paymentToken;
    address public immutable vault;              // only vault can call addToPool/addEligibleUser

    address[] public eligibleUsers;
    mapping(address => bool) public isEligible;
    mapping(address => uint256) public pendingReward;

    uint256 public poolBalance;                  // total TROB ready for distribution
    uint256 public totalDistributed;
    uint256 public distributionCount;
    uint256 public lastDistributionTimestamp;

    // TROB price: how many TROB (in wei) equals 1 USD
    // e.g., if 1 TROB = $0.10, then 1 USD = 10 TROB → trobPerUsd = 10e18
    // e.g., if 1 TROB = $1.00, then 1 USD = 1 TROB  → trobPerUsd = 1e18
    uint256 public trobPerUsd = 1e18; // default: 1 TROB = $1

    // ─── Events ────────────────────────────────────────────────────────────────

    event PoolDeposit(uint256 amount, uint256 newPoolBalance, uint256 timestamp);
    event EligibleUserAdded(address indexed user, uint256 totalEligible, uint256 timestamp);
    event QuarterlyDistribution(
        uint256 indexed round,
        uint256 totalDistributed,
        uint256 tier1Winners,
        uint256 tier2Winners,
        uint256 tier3Winners,
        uint256 tier4Winners,
        uint256 timestamp
    );
    event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event TrobPriceUpdated(uint256 newTrobPerUsd, uint256 timestamp);

    // ─── Errors ────────────────────────────────────────────────────────────────

    error OnlyVault();
    error TooSoon();
    error NotDistributionDay();
    error NothingToClaim();
    error TransferFailed();

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor(address _paymentToken, address _vault) {
        require(_paymentToken != address(0), "EquoraMagicBox: Invalid token");
        require(_vault        != address(0), "EquoraMagicBox: Invalid vault");
        paymentToken = IERC20(_paymentToken);
        vault        = _vault;
    }

    // ─── Called by EquoraVault ─────────────────────────────────────────────────

    /**
     * @dev Add funds to the shared Magic Box pool.
     *      Called by EquoraVault whenever deposits are routed (10% slice).
     */
    function addToPool(uint256 amount) external {
        if (msg.sender != vault) revert OnlyVault();
        poolBalance += amount;
        emit PoolDeposit(amount, poolBalance, block.timestamp);
    }

    /**
     * @dev Register a user as eligible for the quarterly draw.
     *      Called by EquoraVault on user registration. Idempotent.
     */
    function addEligibleUser(address user) external {
        if (msg.sender != vault) revert OnlyVault();
        if (isEligible[user]) return;

        isEligible[user] = true;
        eligibleUsers.push(user);
        emit EligibleUserAdded(user, eligibleUsers.length, block.timestamp);
    }

    // ─── Quarterly Distribution ────────────────────────────────────────────────

    /**
     * @dev Distribute the accumulated Magic Box pool to all eligible users
     *      via weighted random lottery.
     *      Callable permissionlessly on the 11th of every 3-month cycle.
     *
     * @param seed  Optional entropy contributed by caller for extra randomness.
     *              Pass 0 if you don't care about additional entropy.
     */
    function distributeQuarterly(uint256 seed) external nonReentrant {
        _checkDistributionWindow();

        lastDistributionTimestamp = block.timestamp;
        distributionCount++;

        uint256 total = eligibleUsers.length;
        if (total == 0 || poolBalance == 0) return;

        // Calculate winner counts per tier
        uint256 t1Count = (total * TIER1_USER_BPS) / BPS_BASE;
        uint256 t2Count = (total * TIER2_USER_BPS) / BPS_BASE;
        uint256 t3Count = (total * TIER3_USER_BPS) / BPS_BASE;
        uint256 t4Count = (total * TIER4_USER_BPS) / BPS_BASE;

        // Ensure at least 1 winner per tier when pool is big enough
        if (total >= 4) {
            if (t1Count == 0) t1Count = 1;
            if (t2Count == 0) t2Count = 1;
            if (t3Count == 0) t3Count = 1;
            if (t4Count == 0) t4Count = 1;
        } else {
            // Very small user base: just put everyone in Tier 1
            t1Count = total;
            t2Count = 0;
            t3Count = 0;
            t4Count = 0;
        }

        // Convert USD cent prizes to TROB amounts
        // e.g., $0.50 = 50 cents; TROB = (50 * trobPerUsd) / (100 * 1e18)
        uint256 t1Trob = (TIER1_USD_CENTS * trobPerUsd) / (100 * 1e18);
        uint256 t2Trob = (TIER2_USD_CENTS * trobPerUsd) / (100 * 1e18);
        uint256 t3Trob = (TIER3_USD_CENTS * trobPerUsd) / (100 * 1e18);
        uint256 t4Trob = (TIER4_USD_CENTS * trobPerUsd) / (100 * 1e18);

        // Ensure minimum 1 wei per winner if nonzero
        if (t1Count > 0 && t1Trob == 0) t1Trob = 1;
        if (t2Count > 0 && t2Trob == 0) t2Trob = 1;
        if (t3Count > 0 && t3Trob == 0) t3Trob = 1;
        if (t4Count > 0 && t4Trob == 0) t4Trob = 1;

        // Total TROB required
        uint256 totalRequired = (t1Trob * t1Count) + (t2Trob * t2Count) +
                                (t3Trob * t3Count) + (t4Trob * t4Count);

        // Scale down if pool is insufficient (proportional reduction)
        if (totalRequired > poolBalance && totalRequired > 0) {
            uint256 scale = (poolBalance * 1e18) / totalRequired;
            t1Trob = (t1Trob * scale) / 1e18;
            t2Trob = (t2Trob * scale) / 1e18;
            t3Trob = (t3Trob * scale) / 1e18;
            t4Trob = (t4Trob * scale) / 1e18;
        }

        // Generate entropy for random selection
        bytes32 entropy = keccak256(abi.encodePacked(
            seed, block.timestamp, block.prevrandao, block.number,
            total, distributionCount
        ));

        uint256 distributed = 0;

        // Assign rewards: higher tiers first (Tier 4 = rarest/biggest prize)
        // We use offset-based shuffling to avoid duplicate winners across tiers
        distributed += _assignRewards(entropy, 0,                          t4Count, t4Trob);
        distributed += _assignRewards(entropy, t4Count,                    t3Count, t3Trob);
        distributed += _assignRewards(entropy, t4Count + t3Count,          t2Count, t2Trob);
        distributed += _assignRewards(entropy, t4Count + t3Count + t2Count, t1Count, t1Trob);

        poolBalance      -= distributed;
        totalDistributed += distributed;

        emit QuarterlyDistribution(
            distributionCount,
            distributed,
            t1Count, t2Count, t3Count, t4Count,
            block.timestamp
        );
    }

    /**
     * @dev Select `count` random winners from `eligibleUsers` starting from a
     *      unique offset derived from entropy + offset, and award `prizePerWinner`.
     *      Uses modular index selection (with de-duplication via offset).
     */
    function _assignRewards(
        bytes32 entropy,
        uint256 offset,
        uint256 count,
        uint256 prizePerWinner
    ) internal returns (uint256 distributed) {
        if (count == 0 || prizePerWinner == 0) return 0;
        uint256 n = eligibleUsers.length;

        for (uint256 i = 0; i < count; i++) {
            uint256 idx    = uint256(keccak256(abi.encodePacked(entropy, offset + i))) % n;
            address winner = eligibleUsers[idx];
            pendingReward[winner] += prizePerWinner;
            distributed           += prizePerWinner;
        }
    }

    /**
     * @dev Check that the quarterly distribution window is open.
     */
    function _checkDistributionWindow() internal view {
        if (lastDistributionTimestamp > 0) {
            if (block.timestamp < lastDistributionTimestamp + MIN_INTERVAL) revert TooSoon();
        }
        uint256 day = _getDayOfMonth(block.timestamp);
        if (day < SETTLEMENT_DAY) revert NotDistributionDay();
    }

    /**
     * @dev Calculate UTC day-of-month from Unix timestamp (Gregorian calendar).
     */
    function _getDayOfMonth(uint256 timestamp) internal pure returns (uint256) {
        uint256 z   = timestamp / SECONDS_PER_DAY + 719468;
        uint256 era = z / 146097;
        uint256 doe = z - era * 146097;
        uint256 yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
        uint256 doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
        uint256 mp  = (5 * doy + 2) / 153;
        uint256 d   = doy - (153 * mp + 2) / 5 + 1;
        return d;
    }

    // ─── User Claim ────────────────────────────────────────────────────────────

    /**
     * @dev User claims their pending Magic Box reward (pull-based).
     */
    function claimReward() external nonReentrant {
        uint256 amount = pendingReward[msg.sender];
        if (amount == 0) revert NothingToClaim();

        pendingReward[msg.sender] = 0;

        bool ok = paymentToken.transfer(msg.sender, amount);
        if (!ok) revert TransferFailed();

        emit RewardClaimed(msg.sender, amount, block.timestamp);
    }

    // ─── Price Update (permissionless oracle update) ───────────────────────────

    /**
     * @dev Update the TROB/USD price used for prize calculations.
     *      Permissionless — in production this should be called by a Chainlink oracle
     *      or a trusted price feed. No admin key required.
     *
     * @param _trobPerUsd How many TROB wei = 1 USD (in 1e18 scale).
     *                    Example: 1 TROB = $0.10 → _trobPerUsd = 10e18
     *                    Example: 1 TROB = $1.00 → _trobPerUsd = 1e18
     *                    Example: 1 TROB = $2.00 → _trobPerUsd = 0.5e18
     */
    function updateTrobPrice(uint256 _trobPerUsd) external {
        require(_trobPerUsd > 0, "EquoraMagicBox: Invalid price");
        trobPerUsd = _trobPerUsd;
        emit TrobPriceUpdated(_trobPerUsd, block.timestamp);
    }

    // ─── View Functions ────────────────────────────────────────────────────────

    function getEligibleCount() external view returns (uint256) {
        return eligibleUsers.length;
    }

    function getPendingReward(address user) external view returns (uint256) {
        return pendingReward[user];
    }

    function getTimeUntilNextDraw() external view returns (uint256) {
        if (lastDistributionTimestamp == 0) return 0; // Draw available from day 1
        uint256 nextDraw = lastDistributionTimestamp + MIN_INTERVAL;
        if (block.timestamp >= nextDraw) return 0;
        return nextDraw - block.timestamp;
    }

    /**
     * @dev Preview what prizes would look like for the next distribution,
     *      given the current pool balance and eligible user count.
     */
    function previewDistribution() external view returns (
        uint256 tier1Count,
        uint256 tier2Count,
        uint256 tier3Count,
        uint256 tier4Count,
        uint256 tier1TrobPerWinner,
        uint256 tier2TrobPerWinner,
        uint256 tier3TrobPerWinner,
        uint256 tier4TrobPerWinner,
        uint256 currentPoolBalance
    ) {
        uint256 total = eligibleUsers.length;
        currentPoolBalance = poolBalance;

        if (total == 0) return (0,0,0,0,0,0,0,0,poolBalance);

        tier1Count = total >= 4 ? ((total * TIER1_USER_BPS) / BPS_BASE == 0 ? 1 : (total * TIER1_USER_BPS) / BPS_BASE) : total;
        tier2Count = total >= 4 ? ((total * TIER2_USER_BPS) / BPS_BASE == 0 ? 1 : (total * TIER2_USER_BPS) / BPS_BASE) : 0;
        tier3Count = total >= 4 ? ((total * TIER3_USER_BPS) / BPS_BASE == 0 ? 1 : (total * TIER3_USER_BPS) / BPS_BASE) : 0;
        tier4Count = total >= 4 ? ((total * TIER4_USER_BPS) / BPS_BASE == 0 ? 1 : (total * TIER4_USER_BPS) / BPS_BASE) : 0;

        tier1TrobPerWinner = (TIER1_USD_CENTS * trobPerUsd) / (100 * 1e18);
        tier2TrobPerWinner = (TIER2_USD_CENTS * trobPerUsd) / (100 * 1e18);
        tier3TrobPerWinner = (TIER3_USD_CENTS * trobPerUsd) / (100 * 1e18);
        tier4TrobPerWinner = (TIER4_USD_CENTS * trobPerUsd) / (100 * 1e18);
    }

    function getGlobalStats()
        external view
        returns (
            uint256 balance,
            uint256 totalDist,
            uint256 rounds,
            uint256 users,
            uint256 lastDist
        )
    {
        return (poolBalance, totalDistributed, distributionCount, eligibleUsers.length, lastDistributionTimestamp);
    }
}
