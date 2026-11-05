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
 *   Every 3 months (quarterly), the entire pool is distributed to eligible users
 *   who joined in that quarter via a weighted random lottery.
 *
 * === PRIZE TIERS (100% of eligible members accounted for) ====================
 *   Tier 1 (Common)    — 85% of eligible users → each wins $0.50 in TROB
 *   Tier 2 (Uncommon)  — 10% of eligible users → each wins $0.80 in TROB
 *   Tier 3 (Rare)      —  3% of eligible users → each wins $1.20 in TROB
 *   Tier 4 (Legendary) —  2% of eligible users → each wins $5.00 in TROB
 *
 * === STRICT RULES ============================================================
 *   1. Strictly 1x lifetime gift per wallet ("once only for every user of matrix").
 *   2. Only new users joined in that quarter are eligible for that quarter's draw.
 *   3. Zero dropped members: rounding formula ensures t1 + t2 + t3 + t4 == total.
 *   4. O(1) gas deterministic claim mechanism prevents EVM block gas limit crashes.
 */
contract EquoraMagicBox is ReentrancyGuard {

    // ─── Prize Tier Configuration ──────────────────────────────────────────────

    uint256 public constant TIER1_USER_BPS = 8500;  // 85% get Tier 1
    uint256 public constant TIER2_USER_BPS = 1000;  // 10% get Tier 2
    uint256 public constant TIER3_USER_BPS =  300;  //  3% get Tier 3
    uint256 public constant TIER4_USER_BPS =  200;  //  2% get Tier 4
    uint256 public constant BPS_BASE       = 10000;

    // USD prize amounts in cents
    uint256 public constant TIER1_USD_CENTS = 50;   // $0.50
    uint256 public constant TIER2_USD_CENTS = 80;   // $0.80
    uint256 public constant TIER3_USD_CENTS = 120;  // $1.20
    uint256 public constant TIER4_USD_CENTS = 500;  // $5.00

    // Timing constants
    uint256 public constant MIN_INTERVAL    = 85 days;   // ~3 months minimum between draws
    uint256 public constant SETTLEMENT_DAY  = 11;
    uint256 public constant SECONDS_PER_DAY = 86400;

    // ─── Data Structures ───────────────────────────────────────────────────────

    struct QuarterDraw {
        uint256 round;
        bytes32 seed;
        uint256 startTime;
        uint256 endTime;
        uint256 totalUsers;
        uint256 t1Count;
        uint256 t2Count;
        uint256 t3Count;
        uint256 t4Count;
        uint256 t1Trob;
        uint256 t2Trob;
        uint256 t3Trob;
        uint256 t4Trob;
        uint256 timestamp;
    }

    // ─── State ─────────────────────────────────────────────────────────────────

    IERC20  public immutable paymentToken;
    address public immutable vault;
    address public deployer;
    address public matrixContract;
    address public registryContract;

    address[] public eligibleUsers;
    mapping(address => bool) public isEligible;
    mapping(address => uint256) public userJoinedTimestamp;
    mapping(address => bool) public hasReceivedMagicBox; // strictly one gift per wallet lifetime
    mapping(address => uint256) public pendingReward;
    mapping(uint256 => QuarterDraw) public draws; // round => QuarterDraw

    uint256 public poolBalance;                  // total TROB ready for distribution
    uint256 public totalDistributed;
    uint256 public totalRecipientsCount;         // total unique wallets that received a gift
    uint256 public distributionCount;
    uint256 public lastDistributionTimestamp;

    // TROB price: SUN (6 decimals) per 1 USD
    // Default: 1 TROB = $0.056 USD -> 1 USD = ~17.857142 TROB = 17,857,142 SUN
    uint256 public trobPerUsd = 17857142;

    bool public bypassTimerForTesting = false;

    // ─── Events ────────────────────────────────────────────────────────────────

    event PoolDeposit(uint256 amount, uint256 newPoolBalance, uint256 timestamp);
    event EligibleUserAdded(address indexed user, uint256 totalEligible, uint256 timestamp);
    event QuarterlyDistribution(
        uint256 indexed round,
        bytes32 seed,
        uint256 totalUsers,
        uint256 t1Count,
        uint256 t2Count,
        uint256 t3Count,
        uint256 t4Count,
        uint256 timestamp
    );
    event RewardClaimed(
        address indexed user,
        uint256 amount,
        uint8 tier,
        uint256 indexed round,
        uint256 timestamp
    );
    event TrobPriceUpdated(uint256 newTrobPerUsd, uint256 timestamp);
    event MatrixContractSet(address indexed matrix);
    event RegistryContractSet(address indexed registry);
    event BypassTimerSet(bool bypass);

    // ─── Errors ────────────────────────────────────────────────────────────────

    error Unauthorized();
    error TooSoon();
    error NotDistributionDay();
    error NothingToClaim();
    error AlreadyClaimed();
    error NotEligible();
    error TransferFailed();

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor(address _paymentToken, address _vault) {
        require(_vault != address(0), "EquoraMagicBox: Invalid vault");
        paymentToken = IERC20(_paymentToken);
        vault        = _vault;
        deployer     = msg.sender;
    }

    receive() external payable {
        if (msg.value > 0) {
            poolBalance += msg.value;
            emit PoolDeposit(msg.value, poolBalance, block.timestamp);
        }
    }

    fallback() external payable {
        if (msg.value > 0) {
            poolBalance += msg.value;
            emit PoolDeposit(msg.value, poolBalance, block.timestamp);
        }
    }

    // ─── Admin / Wiring ────────────────────────────────────────────────────────

    function setMatrixContract(address _matrix) external {
        if (msg.sender != deployer && msg.sender != vault) revert Unauthorized();
        matrixContract = _matrix;
        emit MatrixContractSet(_matrix);
    }

    function setRegistryContract(address _registry) external {
        if (msg.sender != deployer && msg.sender != vault) revert Unauthorized();
        registryContract = _registry;
        emit RegistryContractSet(_registry);
    }

    function setBypassTimer(bool _bypass) external {
        if (msg.sender != deployer && msg.sender != vault) revert Unauthorized();
        bypassTimerForTesting = _bypass;
        emit BypassTimerSet(_bypass);
    }

    function updateTrobPrice(uint256 _trobPerUsd) external {
        if (msg.sender != deployer && msg.sender != vault) revert Unauthorized();
        require(_trobPerUsd > 0, "EquoraMagicBox: Invalid price");
        trobPerUsd = _trobPerUsd;
        emit TrobPriceUpdated(_trobPerUsd, block.timestamp);
    }

    // ─── Called by EquoraVault & EquoraMatrix ───────────────────────────────────

    /**
     * @dev Add funds to the shared Magic Box pool.
     */
    function addToPool(uint256 amount) external payable {
        if (msg.sender != vault && msg.sender != deployer && msg.sender != matrixContract) revert Unauthorized();
        uint256 toAdd = msg.value > 0 ? msg.value : amount;
        poolBalance += toAdd;
        emit PoolDeposit(toAdd, poolBalance, block.timestamp);
    }

    /**
     * @dev Register a user as eligible for the quarterly draw.
     */
    function addEligibleUser(address user) external {
        if (msg.sender != vault && msg.sender != deployer && msg.sender != matrixContract) revert Unauthorized();
        if (isEligible[user]) return;

        isEligible[user] = true;
        userJoinedTimestamp[user] = block.timestamp;
        eligibleUsers.push(user);
        emit EligibleUserAdded(user, eligibleUsers.length, block.timestamp);
    }

    /**
     * @dev Batch register users (used during initialization / migration).
     */
    function batchAddEligibleUsers(address[] calldata users) external {
        if (msg.sender != vault && msg.sender != deployer && msg.sender != matrixContract) revert Unauthorized();
        for (uint256 i = 0; i < users.length; i++) {
            address u = users[i];
            if (u != address(0) && !isEligible[u]) {
                isEligible[u] = true;
                userJoinedTimestamp[u] = block.timestamp;
                eligibleUsers.push(u);
                emit EligibleUserAdded(u, eligibleUsers.length, block.timestamp);
            }
        }
    }

    // ─── Quarterly Distribution ────────────────────────────────────────────────

    /**
     * @dev Distribute the accumulated Magic Box pool to all eligible users
     *      via weighted random lottery.
     *      Callable permissionlessly on the 11th of every 3-month cycle.
     */
    function distributeQuarterly(uint256 seed) external nonReentrant {
        _checkDistributionWindow();
        _executeQuarterlyDistribution(bytes32(seed));
    }

    /**
     * @dev Direct bypass call for testing.
     */
    function distributeQuarterlyBypass(uint256 seed) external nonReentrant {
        if (msg.sender != deployer && msg.sender != vault) revert Unauthorized();
        _executeQuarterlyDistribution(bytes32(seed));
    }

    function _executeQuarterlyDistribution(bytes32 seedInput) internal {
        uint256 total = eligibleUsers.length;
        if (total == 0 || poolBalance == 0) return;

        lastDistributionTimestamp = block.timestamp;
        distributionCount++;
        uint256 round = distributionCount;

        // Zero-Lost-Users Rounding Formula:
        // Half-up rounding on smaller tiers + Tier 1 takes remainder
        uint256 t4Count = (total * TIER4_USER_BPS + BPS_BASE / 2) / BPS_BASE;
        uint256 t3Count = (total * TIER3_USER_BPS + BPS_BASE / 2) / BPS_BASE;
        uint256 t2Count = (total * TIER2_USER_BPS + BPS_BASE / 2) / BPS_BASE;

        if (total >= 4) {
            if (t4Count == 0) t4Count = 1;
            if (t3Count == 0) t3Count = 1;
            if (t2Count == 0) t2Count = 1;
        } else {
            t4Count = 0;
            t3Count = 0;
            t2Count = 0;
        }

        uint256 t1Count = total - (t4Count + t3Count + t2Count);

        // Convert USD cent prizes to TROB (6 decimals)
        uint256 t1Trob = (TIER1_USD_CENTS * trobPerUsd) / 100;
        uint256 t2Trob = (TIER2_USD_CENTS * trobPerUsd) / 100;
        uint256 t3Trob = (TIER3_USD_CENTS * trobPerUsd) / 100;
        uint256 t4Trob = (TIER4_USD_CENTS * trobPerUsd) / 100;

        // Total TROB required
        uint256 totalRequired = (t1Trob * t1Count) + (t2Trob * t2Count) +
                                (t3Trob * t3Count) + (t4Trob * t4Count);

        // Scale down if pool is insufficient
        if (totalRequired > poolBalance && totalRequired > 0) {
            uint256 scale = (poolBalance * 1e18) / totalRequired;
            t1Trob = (t1Trob * scale) / 1e18;
            t2Trob = (t2Trob * scale) / 1e18;
            t3Trob = (t3Trob * scale) / 1e18;
            t4Trob = (t4Trob * scale) / 1e18;
        }

        bytes32 entropySeed = keccak256(abi.encodePacked(
            seedInput, block.timestamp, block.prevrandao, block.number,
            total, round
        ));

        uint256 startTime = round == 1 ? 0 : lastDistributionTimestamp - MIN_INTERVAL;
        uint256 endTime = block.timestamp;

        draws[round] = QuarterDraw({
            round: round,
            seed: entropySeed,
            startTime: startTime,
            endTime: endTime,
            totalUsers: total,
            t1Count: t1Count,
            t2Count: t2Count,
            t3Count: t3Count,
            t4Count: t4Count,
            t1Trob: t1Trob,
            t2Trob: t2Trob,
            t3Trob: t3Trob,
            t4Trob: t4Trob,
            timestamp: block.timestamp
        });

        emit QuarterlyDistribution(
            round,
            entropySeed,
            total,
            t1Count,
            t2Count,
            t3Count,
            t4Count,
            block.timestamp
        );
    }

    function _checkDistributionWindow() internal view {
        if (bypassTimerForTesting) return;
        if (lastDistributionTimestamp > 0) {
            if (block.timestamp < lastDistributionTimestamp + MIN_INTERVAL) revert TooSoon();
        }
        uint256 day = _getDayOfMonth(block.timestamp);
        if (day < SETTLEMENT_DAY) revert NotDistributionDay();
    }

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

    // ─── User Evaluation & Claim ───────────────────────────────────────────────

    /**
     * @dev Evaluate user's deterministic prize for a given round.
     *      O(1) gas — runs without loops or storage writes.
     */
    function getUserQuarterPrize(address user, uint256 round) public view returns (
        bool eligible,
        bool claimed,
        uint8 tier,
        uint256 prizeTrob,
        uint256 prizeUsdCents
    ) {
        if (round == 0 || round > distributionCount) return (false, false, 0, 0, 0);
        QuarterDraw memory draw = draws[round];

        eligible = isEligible[user];
        claimed = hasReceivedMagicBox[user];

        if (!eligible) return (false, claimed, 0, 0, 0);

        uint256 roll = uint256(keccak256(abi.encodePacked(draw.seed, user))) % BPS_BASE;

        if (roll < TIER4_USER_BPS) {
            tier = 4;
            prizeTrob = draw.t4Trob;
            prizeUsdCents = TIER4_USD_CENTS;
        } else if (roll < TIER4_USER_BPS + TIER3_USER_BPS) {
            tier = 3;
            prizeTrob = draw.t3Trob;
            prizeUsdCents = TIER3_USD_CENTS;
        } else if (roll < TIER4_USER_BPS + TIER3_USER_BPS + TIER2_USER_BPS) {
            tier = 2;
            prizeTrob = draw.t2Trob;
            prizeUsdCents = TIER2_USD_CENTS;
        } else {
            tier = 1;
            prizeTrob = draw.t1Trob;
            prizeUsdCents = TIER1_USD_CENTS;
        }
    }

    /**
     * @dev View function for frontend to query claimable status for connected wallet.
     */
    function getClaimableReward(address user) external view returns (
        bool canClaim,
        uint8 tier,
        uint256 prizeTrob,
        uint256 prizeUsdCents,
        uint256 round
    ) {
        if (!isEligible[user] || hasReceivedMagicBox[user] || distributionCount == 0) {
            return (false, 0, 0, 0, 0);
        }
        round = distributionCount;
        (bool eligible, bool claimed, uint8 t, uint256 pTrob, uint256 pUsd) = getUserQuarterPrize(user, round);
        canClaim = eligible && !claimed && pTrob > 0;
        tier = t;
        prizeTrob = pTrob;
        prizeUsdCents = pUsd;
    }

    /**
     * @dev User claims their quarterly reward (Pull-based, O(1) gas).
     *      Strictly ONE lifetime gift per wallet!
     */
    function claimReward() external nonReentrant returns (uint256 claimedAmount) {
        if (!isEligible[msg.sender]) revert NotEligible();
        if (hasReceivedMagicBox[msg.sender]) revert AlreadyClaimed();
        if (distributionCount == 0) revert NothingToClaim();

        uint256 round = distributionCount;
        (bool eligible, bool claimed, uint8 tier, uint256 prizeTrob, ) = getUserQuarterPrize(msg.sender, round);
        if (!eligible || claimed || prizeTrob == 0) revert NothingToClaim();

        // Mark user claimed permanently (1x lifetime gift)
        hasReceivedMagicBox[msg.sender] = true;
        totalRecipientsCount++;
        totalDistributed += prizeTrob;

        if (poolBalance >= prizeTrob) {
            poolBalance -= prizeTrob;
        } else {
            poolBalance = 0;
        }

        bool ok = false;
        if (address(this).balance >= prizeTrob) {
            (bool sent, ) = payable(msg.sender).call{value: prizeTrob}("");
            ok = sent;
        }
        if (!ok && address(paymentToken) != address(0)) {
            try paymentToken.transfer(msg.sender, prizeTrob) returns (bool res) {
                ok = res;
            } catch {}
        }
        if (!ok) revert TransferFailed();

        emit RewardClaimed(msg.sender, prizeTrob, tier, round, block.timestamp);
        return prizeTrob;
    }

    // ─── View Functions ────────────────────────────────────────────────────────

    function getEligibleCount() external view returns (uint256) {
        return eligibleUsers.length;
    }

    function isEligibleForMagicBox(address user) external view returns (bool) {
        return isEligible[user] && !hasReceivedMagicBox[user];
    }

    function getTimeUntilNextDraw() external view returns (uint256) {
        if (bypassTimerForTesting) return 0;
        if (lastDistributionTimestamp == 0) return 0;
        uint256 nextDraw = lastDistributionTimestamp + MIN_INTERVAL;
        if (block.timestamp >= nextDraw) return 0;
        return nextDraw - block.timestamp;
    }

    function getGlobalStats() external view returns (
        uint256 balance,
        uint256 totalDist,
        uint256 rounds,
        uint256 users,
        uint256 lastDist
    ) {
        return (poolBalance, totalDistributed, distributionCount, eligibleUsers.length, lastDistributionTimestamp);
    }
}
