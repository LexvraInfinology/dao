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


// File contracts/pools/EquoraMagicBox.sol

// Original license: SPDX_License_Identifier: MIT


/**
 * @title EquoraMagicBox
 * @dev Autonomous Rolling Quarterly Pool with Automatic On-Chain Direct Push Payouts.
 *
 * === OVERVIEW =================================================================
 *   The Magic Blind Box is an autonomous protocol pool accumulating 10% of platform deposits.
 *   Every 3 months (quarterly), eligible new users who registered in that quarter receive
 *   an AUTOMATIC ON-CHAIN DIRECT PUSH transfer of native TROB directly into their wallets.
 *   Users do NOT have to click a frontend claim button to receive their payout —
 *   the funds are already transferred on-chain upon quarterly settlement.
 *
 * === ROLLING QUARTERLY COHORT LOOPS ===========================================
 *   1. Users registered in Quarter Q belong to Cohort Q.
 *   2. When Quarter Q settles (after 3 months), all Cohort Q users are automatically paid on-chain.
 *   3. Settlement immediately increments currentQuarter to Q+1 and restarts the 3-month timer.
 *   4. Any new users registered after settlement automatically enter Cohort Q+1 for the next 3 months.
 *   5. Strictly 1x lifetime gift per wallet: hasReceivedMagicBox[user] is permanent.
 *      Past recipients can NEVER enter subsequent quarter cohorts.
 *
 * === PRIZE TIERS (100% of eligible cohort members accounted for) =============
 *   Tier 1 (Common)    — 85% of eligible users → each wins $0.50 in TROB
 *   Tier 2 (Uncommon)  — 10% of eligible users → each wins $0.80 in TROB
 *   Tier 3 (Rare)      —  3% of eligible users → each wins $1.20 in TROB
 *   Tier 4 (Legendary) —  2% of eligible users → each wins $5.00 in TROB
 *
 *   Zero Dropped Users: Rounding formula ensures t1 + t2 + t3 + t4 == totalUsers.
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
    uint256 public constant MIN_INTERVAL    = 90 days;   // Full 3 months quarterly duration (90 days)
    uint256 public constant SETTLEMENT_DAY  = 11;
    uint256 public constant SECONDS_PER_DAY = 86400;

    // ─── Data Structures ───────────────────────────────────────────────────────

    struct TierConfig {
        uint256 t1Count;
        uint256 t2Count;
        uint256 t3Count;
        uint256 t4Count;
        uint256 t1Trob;
        uint256 t2Trob;
        uint256 t3Trob;
        uint256 t4Trob;
    }

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
        uint256 totalPaidTrob;
        uint256 timestamp;
    }

    // ─── State ─────────────────────────────────────────────────────────────────

    IERC20  public immutable paymentToken;
    address public immutable vault;
    address public deployer;
    address public matrixContract;
    address public registryContract;

    // Rolling Quarterly Cohorts
    uint256 public currentQuarter = 1;
    uint256 public quarterStartTime;

    mapping(uint256 => address[]) private _quarterUsers;
    mapping(uint256 => mapping(address => bool)) public isUserInQuarter;
    mapping(address => uint256) public userQuarter;

    // Global registry of users
    address[] public eligibleUsers;
    mapping(address => bool) public isEligible;
    mapping(address => uint256) public userJoinedTimestamp;

    // Strictly 1x lifetime gift per wallet
    mapping(address => bool) public hasReceivedMagicBox;

    // On-Chain Auto-Push Settlement Records per User
    mapping(address => uint256) public userReceivedAmount;    // in TROB (SUN, 6 decimals)
    mapping(address => uint8)   public userReceivedTier;      // 1..4
    mapping(address => uint256) public userReceivedQuarter;   // Quarter round #
    mapping(address => uint256) public userReceivedTimestamp; // block.timestamp
    mapping(address => uint256) public userReceivedUsdCents;  // 50, 80, 120, 500

    // Fallback pull-claim if an auto-push transfer fails (e.g. strict contract wallet)
    mapping(address => uint256) public pendingReward;

    mapping(uint256 => QuarterDraw) public draws;

    uint256 public poolBalance;                  // Total TROB ready for distribution
    uint256 public totalDistributed;             // Total TROB pushed to wallets
    uint256 public totalRecipientsCount;         // Total unique wallets that received a gift
    uint256 public distributionCount;
    uint256 public lastDistributionTimestamp;

    // TROB price: SUN (6 decimals) per 1 USD
    // Default: 1 TROB = $0.056 USD -> 1 USD = ~17.857142 TROB = 17,857,142 SUN
    uint256 public trobPerUsd = 17857142;

    bool public bypassTimerForTesting = false;

    // ─── Events ────────────────────────────────────────────────────────────────

    event PoolDeposit(uint256 amount, uint256 newPoolBalance, uint256 timestamp);
    event EligibleUserAdded(address indexed user, uint256 cohortSize, uint256 indexed quarter, uint256 timestamp);
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
    event RewardAutoPushed(
        address indexed recipient,
        uint256 amountTrob,
        uint8 tier,
        uint256 indexed quarter,
        uint256 timestamp
    );
    event PushFailedFallbackAvailable(
        address indexed recipient,
        uint256 amountTrob,
        uint8 tier,
        uint256 indexed quarter,
        uint256 timestamp
    );
    event QuarterSettledAndAdvanced(
        uint256 indexed settledQuarter,
        uint256 indexed nextQuarter,
        uint256 totalUsers,
        uint256 totalPaidTrob,
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
    event QuarterStartTimeSet(uint256 startTime);

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
        quarterStartTime = 1790812800; // Oct 1, 2026 00:00:00 UTC (Current Q4 Quarter Baseline)
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

    function setQuarterStartTime(uint256 _startTime) external {
        if (msg.sender != deployer && msg.sender != vault) revert Unauthorized();
        require(_startTime > 0, "Invalid timestamp");
        quarterStartTime = _startTime;
        emit QuarterStartTimeSet(_startTime);
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
     * @dev Register a new user into the CURRENT rolling quarter cohort.
     *      Strictly 1x lifetime gift: if user already received, they are never re-added.
     */
    function addEligibleUser(address user) external {
        if (msg.sender != vault && msg.sender != deployer && msg.sender != matrixContract && msg.sender != registryContract) revert Unauthorized();
        if (user == address(0)) return;
        if (hasReceivedMagicBox[user]) return; // strictly 1x lifetime per wallet!
        if (isUserInQuarter[currentQuarter][user]) return;

        isUserInQuarter[currentQuarter][user] = true;
        userQuarter[user] = currentQuarter;
        _quarterUsers[currentQuarter].push(user);

        if (!isEligible[user]) {
            isEligible[user] = true;
            userJoinedTimestamp[user] = block.timestamp;
            eligibleUsers.push(user);
        }

        emit EligibleUserAdded(user, _quarterUsers[currentQuarter].length, currentQuarter, block.timestamp);
    }

    /**
     * @dev Batch register users into the CURRENT rolling quarter cohort.
     */
    function batchAddEligibleUsers(address[] calldata users) external {
        if (msg.sender != vault && msg.sender != deployer && msg.sender != matrixContract && msg.sender != registryContract) revert Unauthorized();
        for (uint256 i = 0; i < users.length; i++) {
            address u = users[i];
            if (u != address(0) && !hasReceivedMagicBox[u] && !isUserInQuarter[currentQuarter][u]) {
                isUserInQuarter[currentQuarter][u] = true;
                userQuarter[u] = currentQuarter;
                _quarterUsers[currentQuarter].push(u);

                if (!isEligible[u]) {
                    isEligible[u] = true;
                    userJoinedTimestamp[u] = block.timestamp;
                    eligibleUsers.push(u);
                }

                emit EligibleUserAdded(u, _quarterUsers[currentQuarter].length, currentQuarter, block.timestamp);
            }
        }
    }

    // ─── Automatic On-Chain Push Quarterly Distribution ────────────────────────

    /**
     * @dev Standard quarterly distribution trigger.
     *      Calculates prize distribution and AUTOMATICALLY PUSHES native TROB
     *      directly to every cohort member's wallet on-chain!
     *      Then advances to the next quarter loop for upcoming new users.
     */
    function distributeQuarterly(uint256 seed) external nonReentrant {
        _checkDistributionWindow();
        _executeQuarterlyAutoPush(bytes32(seed));
    }

    /**
     * @dev Direct bypass call for testing and demonstration.
     */
    function distributeQuarterlyBypass(uint256 seed) external nonReentrant {
        if (msg.sender != deployer && msg.sender != vault) revert Unauthorized();
        _executeQuarterlyAutoPush(bytes32(seed));
    }

    function _computeTierConfig(uint256 total, uint256 balanceToDistribute) internal pure returns (TierConfig memory tc) {
        if (total >= 4) {
            tc.t4Count = (total * TIER4_USER_BPS + BPS_BASE / 2) / BPS_BASE;
            tc.t3Count = (total * TIER3_USER_BPS + BPS_BASE / 2) / BPS_BASE;
            tc.t2Count = (total * TIER2_USER_BPS + BPS_BASE / 2) / BPS_BASE;
            if (tc.t4Count == 0) tc.t4Count = 1;
            if (tc.t3Count == 0) tc.t3Count = 1;
            if (tc.t2Count == 0) tc.t2Count = 1;
        } else {
            tc.t4Count = 0;
            tc.t3Count = 0;
            tc.t2Count = 0;
        }

        tc.t1Count = total - (tc.t4Count + tc.t3Count + tc.t2Count);

        if (total < 4) {
            tc.t1Trob = balanceToDistribute / total;
            tc.t2Trob = 0;
            tc.t3Trob = 0;
            tc.t4Trob = 0;
            return tc;
        }

        // Relative Tier Weights:
        // Tier 1: 50  ($0.50 relative weight)
        // Tier 2: 80  ($0.80 relative weight)
        // Tier 3: 120 ($1.20 relative weight)
        // Tier 4: 500 ($5.00 relative weight)
        uint256 totalWeight = (tc.t1Count * TIER1_USD_CENTS) +
                              (tc.t2Count * TIER2_USD_CENTS) +
                              (tc.t3Count * TIER3_USD_CENTS) +
                              (tc.t4Count * TIER4_USD_CENTS);

        tc.t1Trob = (balanceToDistribute * TIER1_USD_CENTS) / totalWeight;
        tc.t2Trob = (balanceToDistribute * TIER2_USD_CENTS) / totalWeight;
        tc.t3Trob = (balanceToDistribute * TIER3_USD_CENTS) / totalWeight;
        tc.t4Trob = (balanceToDistribute * TIER4_USD_CENTS) / totalWeight;
    }

    /**
     * @dev Core Automatic Push Engine:
     *      1. Empties and distributes 100% OF THE ENTIRE ACCUMULATED POOL BALANCE.
     *      2. Zero leftover balance: entire balanceToDistribute is sent on-chain.
     *      3. Proportions respect the 4 tiers: 85% ($0.50), 10% ($0.80), 3% ($1.20), 2% ($5.00).
     *      4. Directly transfers native TROB to all cohort wallets on-chain.
     *      5. Advances currentQuarter++ and restarts the 3-month timer for new users!
     */
    function _executeQuarterlyAutoPush(bytes32 seedInput) internal {
        uint256 q = currentQuarter;
        uint256 total = _quarterUsers[q].length;

        // If no users in this cohort, simply advance to next quarter
        if (total == 0) {
            lastDistributionTimestamp = block.timestamp;
            distributionCount++;
            currentQuarter++;
            quarterStartTime = block.timestamp;
            emit QuarterSettledAndAdvanced(q, currentQuarter, 0, 0, block.timestamp);
            return;
        }

        uint256 balanceToDistribute = address(this).balance;
        if (balanceToDistribute == 0) {
            lastDistributionTimestamp = block.timestamp;
            distributionCount++;
            currentQuarter++;
            quarterStartTime = block.timestamp;
            emit QuarterSettledAndAdvanced(q, currentQuarter, total, 0, block.timestamp);
            return;
        }

        TierConfig memory tc = _computeTierConfig(total, balanceToDistribute);

        // Division dust remainder added to rank 0 to guarantee exactly 0 balance remains
        uint256 baseAllocated = (tc.t1Count * tc.t1Trob) +
                                (tc.t2Count * tc.t2Trob) +
                                (tc.t3Count * tc.t3Trob) +
                                (tc.t4Count * tc.t4Trob);
        uint256 dustRemainder = balanceToDistribute > baseAllocated ? balanceToDistribute - baseAllocated : 0;

        bytes32 entropySeed = keccak256(abi.encodePacked(
            seedInput, block.timestamp, block.prevrandao, block.number,
            total, q
        ));

        // Create an in-memory Fisher-Yates shuffled permutation to guarantee exact tier quotas:
        // rank 0 .. t4Count-1                         -> Tier 4 (2%  = $5.00 weight)
        // rank t4Count .. t4Count+t3Count-1           -> Tier 3 (3%  = $1.20 weight)
        // rank t4Count+t3Count .. +t2Count-1          -> Tier 2 (10% = $0.80 weight)
        // all remaining ranks                         -> Tier 1 (85% = $0.50 weight)
        uint256[] memory shuffled = new uint256[](total);
        for (uint256 i = 0; i < total; i++) {
            shuffled[i] = i;
        }
        for (uint256 i = 0; i < total; i++) {
            uint256 j = i + (uint256(keccak256(abi.encodePacked(entropySeed, i, "SHUFFLE"))) % (total - i));
            uint256 temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }

        // AUTOMATIC ON-CHAIN DIRECT PUSH TRANSFER LOOP
        uint256 totalPaid = 0;
        uint256 successfulRecipients = 0;

        for (uint256 rank = 0; rank < total; rank++) {
            address recipient = _quarterUsers[q][shuffled[rank]];
            if (recipient == address(0) || hasReceivedMagicBox[recipient]) continue;

            uint8 tier = 1;
            uint256 prizeTrob = tc.t1Trob;

            if (rank < tc.t4Count) {
                tier = 4;
                prizeTrob = tc.t4Trob;
            } else if (rank < tc.t4Count + tc.t3Count) {
                tier = 3;
                prizeTrob = tc.t3Trob;
            } else if (rank < tc.t4Count + tc.t3Count + tc.t2Count) {
                tier = 2;
                prizeTrob = tc.t2Trob;
            }

            // Distribute fractional division dust to rank 0 to leave exact 0 balance in contract
            if (rank == 0 && dustRemainder > 0) {
                prizeTrob += dustRemainder;
            }

            uint256 prizeUsd = (prizeTrob * 100) / trobPerUsd;

            // Permanently mark user received (1x lifetime gift)
            hasReceivedMagicBox[recipient] = true;
            userReceivedAmount[recipient] = prizeTrob;
            userReceivedTier[recipient] = tier;
            userReceivedQuarter[recipient] = q;
            userReceivedTimestamp[recipient] = block.timestamp;
            userReceivedUsdCents[recipient] = prizeUsd;

            // Direct On-Chain Push Transfer to user's wallet!
            if (prizeTrob > 0 && address(this).balance >= prizeTrob) {
                (bool sent, ) = payable(recipient).call{value: prizeTrob, gas: 100000}("");
                if (sent) {
                    totalPaid += prizeTrob;
                    successfulRecipients++;
                    emit RewardAutoPushed(recipient, prizeTrob, tier, q, block.timestamp);
                } else {
                    // Fallback safety: store in pendingReward so user can pull claim
                    pendingReward[recipient] = prizeTrob;
                    emit PushFailedFallbackAvailable(recipient, prizeTrob, tier, q, block.timestamp);
                }
            } else {
                // If contract balance ran dry, record pending
                pendingReward[recipient] = prizeTrob;
                emit PushFailedFallbackAvailable(recipient, prizeTrob, tier, q, block.timestamp);
            }
        }

        // Update contract accounting — entire poolBalance is distributed (0 left)
        totalDistributed += totalPaid;
        totalRecipientsCount += successfulRecipients;
        poolBalance = 0;

        // Record draw history
        draws[q] = QuarterDraw({
            round: q,
            seed: entropySeed,
            startTime: quarterStartTime,
            endTime: block.timestamp,
            totalUsers: total,
            t1Count: tc.t1Count,
            t2Count: tc.t2Count,
            t3Count: tc.t3Count,
            t4Count: tc.t4Count,
            t1Trob: tc.t1Trob,
            t2Trob: tc.t2Trob,
            t3Trob: tc.t3Trob,
            t4Trob: tc.t4Trob,
            totalPaidTrob: totalPaid,
            timestamp: block.timestamp
        });

        emit QuarterlyDistribution(
            q,
            entropySeed,
            total,
            tc.t1Count,
            tc.t2Count,
            tc.t3Count,
            tc.t4Count,
            block.timestamp
        );

        // ADVANCE TO NEXT QUARTER ROLLING LOOP!
        lastDistributionTimestamp = block.timestamp;
        distributionCount++;
        uint256 settledQuarter = q;
        currentQuarter = q + 1;
        quarterStartTime = block.timestamp;

        emit QuarterSettledAndAdvanced(
            settledQuarter,
            currentQuarter,
            total,
            totalPaid,
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

    // ─── Fallback Pull Claim (Only for failed push or pending rewards) ──────────

    /**
     * @dev Fallback pull-claim if an auto-push transfer failed to credit.
     */
    function claimReward() external nonReentrant returns (uint256 claimedAmount) {
        uint256 amount = pendingReward[msg.sender];
        if (amount == 0) revert NothingToClaim();

        pendingReward[msg.sender] = 0;
        totalDistributed += amount;
        totalRecipientsCount++;

        if (poolBalance >= amount) {
            poolBalance -= amount;
        } else {
            poolBalance = 0;
        }

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        if (!sent) revert TransferFailed();

        emit RewardClaimed(msg.sender, amount, userReceivedTier[msg.sender], userReceivedQuarter[msg.sender], block.timestamp);
        return amount;
    }

    // ─── View Functions for Frontend & Diagnostics ─────────────────────────────

    /**
     * @dev Comprehensive view function returning all relevant status for a wallet in ONE call.
     */
    function getUserStatus(address user) external view returns (
        bool hasReceived,
        uint256 receivedAmount,
        uint8 receivedTier,
        uint256 receivedQuarter,
        uint256 receivedTimestamp,
        uint256 receivedUsdCents,
        bool isInCurrentQuarter,
        uint256 userQuarterNumber,
        uint256 activeQuarter,
        uint256 timeRemainingSeconds
    ) {
        hasReceived = hasReceivedMagicBox[user];
        receivedAmount = userReceivedAmount[user];
        receivedTier = userReceivedTier[user];
        receivedQuarter = userReceivedQuarter[user];
        receivedTimestamp = userReceivedTimestamp[user];
        receivedUsdCents = userReceivedUsdCents[user];
        isInCurrentQuarter = isUserInQuarter[currentQuarter][user];
        userQuarterNumber = userQuarter[user];
        activeQuarter = currentQuarter;

        if (bypassTimerForTesting) {
            timeRemainingSeconds = 0;
        } else {
            uint256 startTime = quarterStartTime > 0 ? quarterStartTime : lastDistributionTimestamp;
            uint256 nextDraw = startTime + MIN_INTERVAL;
            if (block.timestamp >= nextDraw) {
                timeRemainingSeconds = 0;
            } else {
                timeRemainingSeconds = nextDraw - block.timestamp;
            }
        }
    }

    function getQuarterUsers(uint256 quarter) external view returns (address[] memory) {
        return _quarterUsers[quarter];
    }

    function getQuarterUserCount(uint256 quarter) external view returns (uint256) {
        return _quarterUsers[quarter].length;
    }

    function getEligibleCount() external view returns (uint256) {
        return eligibleUsers.length;
    }

    function isEligibleForMagicBox(address user) external view returns (bool) {
        return !hasReceivedMagicBox[user] && (isUserInQuarter[currentQuarter][user] || isEligible[user]);
    }

    function getTimeUntilNextDraw() external view returns (uint256) {
        if (bypassTimerForTesting) return 0;
        uint256 startTime = quarterStartTime > 0 ? quarterStartTime : lastDistributionTimestamp;
        if (startTime == 0) return 0;
        uint256 nextDraw = startTime + MIN_INTERVAL;
        if (block.timestamp >= nextDraw) return 0;
        return nextDraw - block.timestamp;
    }

    function getGlobalStats() external view returns (
        uint256 balance,
        uint256 totalDist,
        uint256 rounds,
        uint256 totalRecipients,
        uint256 activeQuarter,
        uint256 currentCohortUsers,
        uint256 lastDist
    ) {
        return (
            address(this).balance,
            totalDistributed,
            distributionCount,
            totalRecipientsCount,
            currentQuarter,
            _quarterUsers[currentQuarter].length,
            lastDistributionTimestamp
        );
    }
}
