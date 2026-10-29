// Sources flattened with hardhat v2.29.1 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


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


// File contracts/interfaces/IEquoraNFT.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEquoraNFT
 * @dev Interface for the Equora NFT contract (Welcome Pass + Rank Badges)
 */
interface IEquoraNFT {
    enum Rank {
        NONE,       // Not yet ranked
        ALPHA,      // Slot 3 completed (Levels 1-3 | 42 slots)
        PRIME,      // Slot 6 completed (Levels 4-6 | 84 slots)
        ELITE,      // Slot 9 completed (Levels 7-9 | 126 slots)
        CROWN       // Slot 12 completed (Levels 10-12 | 168 slots - max)
    }

    function mintWelcomePass(address to) external returns (uint256 tokenId);
    function mintRankBadge(address to, Rank rank) external returns (uint256 tokenId);
    function getWelcomePassTokenId(address user) external view returns (uint256);
    function getUserRank(address user) external view returns (Rank);
    function hasWelcomePass(address user) external view returns (bool);
}


// File contracts/interfaces/IEquoraRegistry.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEquoraRegistry
 * @dev Interface for the Equora.Fi user registry, referral tracking, and 5-digit referral code system
 */
interface IEquoraRegistry {
    function registerUser(address user, uint32 sponsorCode) external returns (bool);
    function registerUser(address user, address sponsor) external returns (bool);
    function isRegistered(address user) external view returns (bool);
    function getSponsor(address user) external view returns (address);
    function getDirectReferrals(address user) external view returns (address[] memory);
    function getDirectReferralsCount(address user) external view returns (uint256);
    function isQualified(address user) external view returns (bool);
    function getRoot() external view returns (address);

    // 5-digit referral code system
    function getUserByCode(uint32 code) external view returns (address);
    function getCodeByUser(address user) external view returns (uint32);
    function getUserId(address user) external view returns (uint256);
}


// File contracts/core/EquoraMatrix.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;





/**
 * @title EquoraMatrix — V3 (Equora.Fi Aligned)
 * @dev 12-Slot, 14-Node Single-Leg Matrix Engine
 *
 * === BOARD VALUE & 100% AUTO-PROGRESSION MODEL =============================
 *   • Slot 1: $30 USD Entry (The ONLY slot a user ever pays from their wallet)
 *   • Slots 2 to 12: $0 Out-of-Pocket (100% Auto-Unlocked via Node 4 & Node 5)
 *   • Accounting Value per Node: $30 USD (Every node placement distributes $30)
 *   • Payout per 14-Node Completed Board: $180 USD (6 nodes × $30) to Slot Owner
 *
 * === 14-NODE PAYOUT ROUTING ==================================================
 *  ALL CYCLES:
 *   P1  -> Upline 1 (immediate eligible upline above matrix owner)
 *   P2  -> Upline 2 (upline's upline)
 *   P3  -> Slot Owner (YOU)
 *   P4  -> Protocol Pools via EquoraVault (35% DAO, 40% Royalty, 15% Rewards, 10% Box)
 *   P5  -> Protocol Pools via EquoraVault
 *   P6  -> Slot Owner (YOU)
 *   P7  -> Downline 1 (spillover to first direct under you, if qualified; else 4 Protocol Pools via EquoraVault)
 *   P8  -> Slot Owner (YOU)
 *   P9  -> Slot Owner (YOU)
 *   P10 -> Downline 1 / Downline 2 (if qualified; else 4 Protocol Pools via EquoraVault)
 *   P11 -> Slot Owner (YOU)
 *   P12 -> Slot Owner (YOU)
 *   P13 -> Downline 2 / Tier 2 Waterfall (if qualified; else 4 Protocol Pools via EquoraVault)
 *   P14 -> Protocol Pools via EquoraVault
 *
 * Per-slot breakdown for Slot 1 (cost = 30 TROB per node, 14 nodes = 420 TROB):
 *   P1 + P2            = 60  TROB → Immediate Upline (2 × 30) (if qualified; else 4 Protocol Pools)
 *   P3+P6+P8+P9+P11+P12= 180 TROB → YOU (6 × 30)
 *   P4+P5+P14          = 90  TROB → Protocol Pools (3 × 30) (35% DAO, 40% Royalty, 15% Rewards, 10% Box)
 *   P7+P10             = 60  TROB → Downline 1 (2 × 30) (if qualified; else 4 Protocol Pools)
 *   P13                = 30  TROB → Downline 2 (1 × 30) (if qualified; else 4 Protocol Pools)
 *   Total              = 420 TROB
 *
 * === QUALIFICATION ===========================================================
 *   isQualified = directReferrals >= 2
 *   Unqualified fallback = 4 Protocol Pools via EquoraVault (never root wallet, zero fund leakage)
 *
 * === MAGIC BLIND BOX MILESTONES =============================================
 *   Slots 3,6,9,12 first cycle completion: Rank NFT minted (Alpha/Prime/Elite/Crown)
 *
 * === NULL KEY (Null Ownership) ===============================================
 *   After deployment wiring, renounceOwnership() is called — no admin can
 *   ever pause, modify fees, or redirect funds.
 *
 * Security:
 *   - ReentrancyGuard on all state-changing external functions
 *   - Upline traversal capped at MAX_UPLINE_DEPTH
 *   - Cycle history permanently preserved (never deleted)
 *   - 100% accounting: every wei of cost is distributed
 */

interface IEquoraDAOForMatrix {
    function getLastMember() external view returns (address);
    function getAllMembers() external view returns (address[] memory);
    function daoLaunchTimestamp() external view returns (uint256);
    function getLaunchTimestamp() external view returns (uint256);
    function timeRemainingInWindow() external view returns (uint256);
    function daoCompleted() external view returns (bool);
    function lastTrobPriceUsd6() external view returns (uint256);
}

contract EquoraMatrix is Ownable, ReentrancyGuard {

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    uint256 public constant TOTAL_SLOTS          = 12;
    uint256 public constant TREE_NODES           = 14;
    uint256 public constant ENTRY_FEE_USD        = 30_000_000;   // $30 USD (6 decimals)
    /// @dev Safety minimum floor: 300 TROB (300 * 10^6 SUN). Prevents underfunded joins (1-5 TROB).
    uint256 public constant MIN_SLOT1_FLOOR      = 300 * 10 ** 6;  // 300 TROB floor ($30 at $0.10 max price)
    uint256 public constant MAX_UPLINE_DEPTH     = 12;

    uint256 public trobPriceUsd6                 = 56_000;       // Benchmark $0.056 USD (6 decimals, matches EquoraDAOv2)
    uint256 public baseSlotCost                  = 535_714_285;  // 535.714285 TROB in SUN ($30 USD at $0.056)
    uint256 public lastPriceUpdateTimestamp;

    /// @dev Official Super Representative (SR) address for Equora_Fi protocol governance
    string public constant OFFICIAL_SR_BASE58      = "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
    /// @dev Minimum creation timestamp for eligible deposit wallets: 1 October 2026 00:00:00 UTC
    uint256 public constant MIN_WALLET_CREATION_DATE = 1790812800;
    /// @dev Target daily free transactions for Matrix members (Formula: 5 TX/day)
    uint256 public constant MATRIX_TARGET_FREE_TX_PER_DAY = 5;

    // -------------------------------------------------------------------------
    // Enums
    // -------------------------------------------------------------------------

    enum PayoutType {
        UPLINE_1,
        UPLINE_2,
        OWNER_DIRECT,
        PROTOCOL_POOL,    // P4, P5, P14 — forwarded to EquoraVault
        SPILLOVER_DOWNLINE1,
        SPILLOVER_DOWNLINE2,
        CYCLE_COMPLETE
    }

    // -------------------------------------------------------------------------
    // Data Structures
    // -------------------------------------------------------------------------

    struct MatrixSlot {
        bool        isUnlocked;
        bool        isLive;          // false when reserved via P4+P5; true when activated via P14 full board completion!
        uint256     currentCycle;    // starts at 1
        uint256     filledNodes;     // 0 to 14
        address[14] nodes;           // ACTIVE cycle positions
        uint256     totalEarned;     // lifetime owner income from this slot
    }

    /// @dev Permanent, immutable history of every completed cycle.
    ///      Once pushed, entries are never deleted or modified.
    struct MatrixCycleSnapshot {
        uint256     cycleNumber;
        address[14] nodes;       // snapshot of positions at completion
        uint256     completedAt; // block.timestamp
    }

    // -------------------------------------------------------------------------
    // Dependencies
    // -------------------------------------------------------------------------

    IERC20          public paymentToken;
    IEquoraRegistry public registry;
    IEquoraNFT      public nftContract;

    // EquoraVault receives P4, P5, P14 and routes them to the 4 protocol pools
    address public vaultContract;

    // Optional launch delay to enforce the 21-day exclusive Genesis DAO phase
    uint256 public matrixLaunchTime;

    // Genesis DAO contract — to retrieve the Last Member who becomes the Root Matrix Owner on Day 22
    address public daoContract;

    // -------------------------------------------------------------------------
    // Matrix State
    // -------------------------------------------------------------------------

    // user => slot => active matrix slot state
    mapping(address => mapping(uint256 => MatrixSlot)) public userSlots;

    // user => slot => permanent cycle history (append-only, never deleted)
    mapping(address => mapping(uint256 => MatrixCycleSnapshot[])) public cycleSnapshots;

    // matrixOwner => slot => cycle => recipient of P7 downline payout (anti-double payout protection)
    mapping(address => mapping(uint256 => mapping(uint256 => address))) public p7PaidRecipient;

    // -------------------------------------------------------------------------
    // User Financials
    // -------------------------------------------------------------------------

    mapping(address => uint256) public userBalance;
    mapping(address => uint256) public totalEarned;
    mapping(address => uint256) public totalWithdrawn;
    mapping(address => uint256) public highestSlot;

    // -------------------------------------------------------------------------
    // 30$ Deposit Active Direct Referrals Tracking
    // -------------------------------------------------------------------------

    mapping(address => uint256) public activeDirectReferrals;
    mapping(address => mapping(address => bool)) public hasDirectReferralDeposited;
    mapping(address => address[]) private _activeDirectReferralsList;

    // -------------------------------------------------------------------------
    // Global Stats
    // -------------------------------------------------------------------------

    uint256 public totalMembers;
    uint256 public totalRecycles;
    uint256 public totalVolumeProcessed;
    uint256 public totalPoolForwarded; // total TROB sent to EquoraVault pools

    // -------------------------------------------------------------------------
    // Slot Costs (precomputed in constructor)
    // -------------------------------------------------------------------------

    mapping(uint256 => uint256) public slotCosts;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event SlotJoined(
        address indexed user,
        uint256 indexed slot,
        uint256 cost,
        address sponsor,
        uint256 timestamp
    );
    event PositionFilled(
        address indexed matrixOwner,
        uint8   indexed slot,
        uint256 indexed cycle,
        uint8   position,
        address participant,
        uint256 amount
    );
    event DistributionExecuted(
        address indexed recipient,
        uint256 amount,
        PayoutType payoutType,
        uint8  slot,
        uint256 cycle,
        uint8  position
    );
    event SpilloverResolved(
        address indexed matrixOwner,
        address indexed recipient,
        uint8   position,
        bool    wasOwnerFallback
    );
    event CycleCompleted(
        address indexed user,
        uint8   indexed slot,
        uint256 cycleNumber,
        uint256 timestamp
    );
    event MatrixRecycled(
        address indexed user,
        uint8   indexed slot,
        uint256 newCycle,
        uint256 timestamp
    );
    event MilestoneReached(
        address indexed user,
        uint8   indexed slot,
        uint8   rank,
        uint256 timestamp
    );
    event ProtocolPoolFunded(
        address indexed matrixOwner,
        uint256 amount,
        uint8   slot,
        uint256 cycle,
        uint8   position,
        uint256 timestamp
    );
    event BalanceWithdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event VaultContractSet(address indexed vault);
    event DaoContractSet(address indexed dao);
    event SlotReserved(
        address indexed user,
        uint8   indexed fromSlot,
        uint8   indexed reservedSlot,
        uint256 timestamp
    );
    event SlotAutoActivated(
        address indexed user,
        uint8   indexed fromSlot,
        uint8   indexed activatedSlot,
        uint256 timestamp
    );
    event SlotActivatedForEarning(
        address indexed user,
        uint8   indexed slot,
        uint256 timestamp
    );
    event ActiveDirectReferralCounted(
        address indexed sponsor,
        address indexed referral,
        uint256 totalActiveDirects,
        uint256 timestamp
    );
    event TrobPriceUpdated(uint256 priceUsd6, uint256 newBaseCost, uint256 timestamp);
    event BaseSlotCostUpdated(uint256 newBaseCost, uint256 priceUsd6, uint256 timestamp);

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(
        address _paymentToken,
        address _registry,
        address _nftContract
    ) Ownable(msg.sender) {
        require(_registry != address(0), "EquoraMatrix: invalid registry");

        if (_paymentToken != address(0)) {
            paymentToken = IERC20(_paymentToken);
        }
        registry     = IEquoraRegistry(_registry);
        nftContract  = IEquoraNFT(_nftContract);

        // Precompute slot costs pegged to $30 USD (default: 30 * 1e6 SUN at $1.00 USD)
        baseSlotCost = (ENTRY_FEE_USD * 1e6) / trobPriceUsd6;
        for (uint256 i = 1; i <= TOTAL_SLOTS; i++) {
            slotCosts[i] = baseSlotCost;
        }
    }

    receive() external payable {}
    fallback() external payable {}

    // -------------------------------------------------------------------------
    // Admin (only callable before renounceOwnership)
    // -------------------------------------------------------------------------

    /**
     * @dev Updates the live TROB market price and dynamically recalculates slot costs for $30 USD.
     *      Formula: baseSlotCost = ($30 USD / _trobPriceUsd6) * 1e6 (in SUN)
     *      Example: At $0.056/TROB (_trobPriceUsd6 = 56000), baseSlotCost = 535.714285 TROB (535,714,285 SUN)
     */
    function setTrobPrice(uint256 _trobPriceUsd6) external onlyOwner {
        require(_trobPriceUsd6 > 0, "EquoraMatrix: price must be > 0");
        trobPriceUsd6 = _trobPriceUsd6;
        lastPriceUpdateTimestamp = block.timestamp;

        uint256 newBase = (ENTRY_FEE_USD * 1e6) / _trobPriceUsd6;
        require(newBase >= MIN_SLOT1_FLOOR, "EquoraMatrix: cost below floor");
        baseSlotCost = newBase;

        for (uint256 i = 1; i <= TOTAL_SLOTS; i++) {
            slotCosts[i] = newBase;
        }
        emit TrobPriceUpdated(_trobPriceUsd6, newBase, block.timestamp);
    }

    /**
     * @dev Sets base slot cost directly with price validation.
     */
    function setBaseSlotCost(uint256 _newBaseCost, uint256 _trobPriceUsd6) external onlyOwner {
        require(_newBaseCost >= MIN_SLOT1_FLOOR, "EquoraMatrix: cost below floor");
        require(_trobPriceUsd6 > 0, "EquoraMatrix: price must be > 0");
        trobPriceUsd6 = _trobPriceUsd6;
        baseSlotCost  = _newBaseCost;
        lastPriceUpdateTimestamp = block.timestamp;

        for (uint256 i = 1; i <= TOTAL_SLOTS; i++) {
            slotCosts[i] = _newBaseCost;
        }
        emit BaseSlotCostUpdated(_newBaseCost, _trobPriceUsd6, block.timestamp);
    }

    /**
     * @dev Dynamic getter for BASE_SLOT_COST returning current $30 USD base cost.
     */
    function BASE_SLOT_COST() external view returns (uint256) {
        return baseSlotCost;
    }

    /**
     * @dev Calculate how much $30 USD (Slot 1) or higher slots is worth in TROB at a given price.
     */
    function getRequiredTrobForSlot(uint256 slot, uint256 currentPriceUsd6) external pure returns (uint256) {
        require(slot >= 1 && slot <= TOTAL_SLOTS, "EquoraMatrix: invalid slot");
        require(currentPriceUsd6 > 0, "EquoraMatrix: price must be > 0");
        return (ENTRY_FEE_USD * 1e6) / currentPriceUsd6;
    }

    function setVaultContract(address _vault) external onlyOwner {
        require(_vault != address(0), "EquoraMatrix: invalid vault");
        vaultContract = _vault;
        emit VaultContractSet(_vault);
    }

    function setDaoContract(address _dao) external onlyOwner {
        require(_dao != address(0), "EquoraMatrix: invalid dao");
        daoContract = _dao;
        emit DaoContractSet(_dao);
    }

    function setContracts(
        address _token,
        address _registry,
        address _nft
    ) external onlyOwner {
        if (_token    != address(0)) paymentToken = IERC20(_token);
        if (_registry != address(0)) registry     = IEquoraRegistry(_registry);
        if (_nft      != address(0)) nftContract  = IEquoraNFT(_nft);
    }

    function setMatrixLaunchTime(uint256 _launchTime) external onlyOwner {
        matrixLaunchTime = _launchTime;
    }

    /**
     * @dev Sync matrix launch time from Genesis DAO launch timestamp + 21 days.
     *      Ensures automatic Day 22 opening after the 21-day founding window.
     */
    function syncLaunchTimeFromDAO() external onlyOwner {
        if (daoContract != address(0)) {
            try IEquoraDAOForMatrix(daoContract).daoLaunchTimestamp() returns (uint256 launchTs) {
                if (launchTs > 0) {
                    matrixLaunchTime = launchTs + 21 days;
                }
            } catch {}
        }
    }

    /**
     * @dev Automatically syncs live TROB price and recalculates $30 slot costs from connected EquoraDAO contract.
     *      Ensures slot cost is always pegged to real live TROB rate and respects the MIN_SLOT1_FLOOR.
     */
    function syncPriceFromDAO() public {
        if (daoContract != address(0)) {
            try IEquoraDAOForMatrix(daoContract).lastTrobPriceUsd6() returns (uint256 daoPrice) {
                if (daoPrice > 0 && daoPrice <= 2_000_000) {
                    trobPriceUsd6 = daoPrice;
                    lastPriceUpdateTimestamp = block.timestamp;
                    uint256 newBase = (ENTRY_FEE_USD * 1e6) / daoPrice;
                    if (newBase >= MIN_SLOT1_FLOOR) {
                        baseSlotCost = newBase;
                        for (uint256 i = 1; i <= TOTAL_SLOTS; i++) {
                            slotCosts[i] = newBase;
                        }
                        emit TrobPriceUpdated(daoPrice, newBase, block.timestamp);
                    }
                }
            } catch {}
        }
    }

    /**
     * @dev Check if the matrix is open for retail enrollment.
     */
    function isMatrixOpen() public view returns (bool) {
        if (matrixLaunchTime > 0) {
            return block.timestamp >= matrixLaunchTime;
        }
        return true;
    }

    /**
     * @dev Returns remaining seconds in the 21-day Genesis DAO phase before Retail Matrix launch.
     *      Matches the exact countdown timer on the Matrix Bridge page.
     */
    function getRemainingLaunchSeconds() external view returns (uint256) {
        if (daoContract != address(0)) {
            try IEquoraDAOForMatrix(daoContract).timeRemainingInWindow() returns (uint256 rem) {
                return rem;
            } catch {}
        }
        if (matrixLaunchTime > 0) {
            if (block.timestamp >= matrixLaunchTime) return 0;
            return matrixLaunchTime - block.timestamp;
        }
        return 21 days;
    }

    event TreeGraphStarted(
        address indexed user,
        uint8   indexed slot,
        uint256 timestamp
    );

    // -------------------------------------------------------------------------
    // User Registration
    // -------------------------------------------------------------------------

    /**
     * @dev Register a user in the registry without joining a slot yet.
     *      Allows users to get their 5-digit referral code and build their 2 direct referrals
     *      before their matrix tree graph starts.
     */
    function register(address sponsor) external returns (bool) {
        address validSponsor = sponsor;
        if ((validSponsor == address(0) || validSponsor == owner()) && vaultContract != address(0)) {
            validSponsor = vaultContract;
        }
        return registry.registerUser(msg.sender, validSponsor);
    }

    /**
     * @dev Register a user in the registry via 5-digit sponsor code.
     */
    function register(uint32 sponsorCode) external returns (bool) {
        return registry.registerUser(msg.sender, sponsorCode);
    }

    // -------------------------------------------------------------------------
    // Join Slot
    // -------------------------------------------------------------------------

    /**
     * @dev Join or unlock a specific matrix slot.
     *      Slot 1: any registered user (personal tree graph starts upon 2 direct referrals).
     *      Slots 2-12: previous slot must be unlocked.
     */
    function joinSlot(uint256 slot, address sponsor) external payable nonReentrant {
        require(isMatrixOpen(), "EquoraMatrix: matrix locked during 21-day Genesis DAO phase");
        require(slot >= 1 && slot <= TOTAL_SLOTS,         "EquoraMatrix: invalid slot");
        if (slot > 1) {
            require(userSlots[msg.sender][slot - 1].isUnlocked, "EquoraMatrix: previous slot must be unlocked");
        }
        require(!userSlots[msg.sender][slot].isUnlocked,  "EquoraMatrix: already unlocked");

        uint256 cost = slotCosts[slot];
        require(cost >= MIN_SLOT1_FLOOR, "EquoraMatrix: slot cost below safety floor");
        if (msg.value > 0) {
            require(msg.value >= cost, "EquoraMatrix: insufficient TROB sent");
            require(msg.value >= MIN_SLOT1_FLOOR, "EquoraMatrix: payment below safety floor (min 300 TROB)");
            cost = msg.value;
        } else if (address(paymentToken) != address(0)) {
            require(cost >= baseSlotCost && cost >= MIN_SLOT1_FLOOR, "EquoraMatrix: payment below minimum floor");
            bool ok = paymentToken.transferFrom(msg.sender, address(this), cost);
            require(ok, "EquoraMatrix: payment failed");
        } else {
            revert("EquoraMatrix: payment required in native TROB");
        }

        totalVolumeProcessed += cost;

        // Register user on first join (slot 1) if not already registered
        if (!registry.isRegistered(msg.sender)) {
            address targetSponsor = sponsor;
            if ((targetSponsor == address(0) || targetSponsor == owner()) && vaultContract != address(0)) {
                targetSponsor = vaultContract;
            }
            registry.registerUser(msg.sender, targetSponsor);
        }

        // Welcome pass NFT on slot 1
        if (slot == 1 && address(nftContract) != address(0) && !nftContract.hasWelcomePass(msg.sender)) {
            try nftContract.mintWelcomePass(msg.sender) {} catch {}
        }

        // Unlock slot (Slot 1 is immediately live once qualified)
        userSlots[msg.sender][slot].isUnlocked   = true;
        userSlots[msg.sender][slot].isLive       = true;
        userSlots[msg.sender][slot].currentCycle = 1;
        userSlots[msg.sender][slot].filledNodes  = 0;

        if (slot > highestSlot[msg.sender]) highestSlot[msg.sender] = slot;
        if (slot == 1) totalMembers++;

        address sponsorAddr = registry.getSponsor(msg.sender);
        emit SlotJoined(msg.sender, slot, cost, sponsorAddr, block.timestamp);

        // Record 30$ deposit direct referral for sponsor upon Slot 1 deposit
        if (slot == 1 && sponsorAddr != address(0) && !hasDirectReferralDeposited[sponsorAddr][msg.sender]) {
            hasDirectReferralDeposited[sponsorAddr][msg.sender] = true;
            activeDirectReferrals[sponsorAddr]++;
            _activeDirectReferralsList[sponsorAddr].push(msg.sender);
            emit ActiveDirectReferralCounted(sponsorAddr, msg.sender, activeDirectReferrals[sponsorAddr], block.timestamp);

            if (isMatrixQualified(sponsorAddr) && userSlots[sponsorAddr][1].isUnlocked) {
                emit TreeGraphStarted(sponsorAddr, 1, block.timestamp);
            }
        }

        if (isMatrixQualified(msg.sender)) {
            emit TreeGraphStarted(msg.sender, uint8(slot), block.timestamp);
        }

        _placeUserInMatrix(msg.sender, slot, cost);
    }

    // -------------------------------------------------------------------------
    // Matrix Placement
    // -------------------------------------------------------------------------

    /**
     * @dev Resolves the genesis root matrix owner.
     *      Defaults to Protocol Vault smart contract for unreferred and apex volume.
     *      Otherwise falls back to registry.getRoot().
     */
    function _getRootMatrixOwner() internal view returns (address) {
        if (vaultContract != address(0)) {
            return vaultContract;
        }
        if (daoContract != address(0)) {
            try IEquoraDAOForMatrix(daoContract).getLastMember() returns (address lastDaoMember) {
                if (lastDaoMember != address(0)) {
                    return lastDaoMember;
                }
            } catch {}
        }
        return registry.getRoot();
    }

    /**
     * @dev Find matrix owner (bubble up sponsor chain, max depth 12),
     *      place new user in next available position, route payment.
     *      A user's personal tree graph only starts receiving placements when they have
     *      achieved 2 direct referrals eligibility with 30$ deposit each (or are the Genesis Root Matrix Owner).
     *      If an upline in the chain has not met 2 direct referrals, the placement skips them
     *      and bubbles up to an eligible upline sponsor or the root matrix owner.
     */
    function _placeUserInMatrix(address newUser, uint256 slot, uint256 cost) internal {
        address rootOwner = _getRootMatrixOwner();

        address sponsor = registry.getSponsor(newUser);
        if (sponsor == address(0) || sponsor == owner()) sponsor = rootOwner;

        address matrixOwner = sponsor;
        uint256 depth = 0;
        while (
            (!userSlots[matrixOwner][slot].isUnlocked ||
             (slot > 1 && !userSlots[matrixOwner][slot].isLive) ||
             (matrixOwner != sponsor && !isMatrixQualified(matrixOwner) && matrixOwner != rootOwner)) &&
            depth < MAX_UPLINE_DEPTH
        ) {
            address up = registry.getSponsor(matrixOwner);
            if (up == address(0) || up == matrixOwner || up == owner()) {
                matrixOwner = rootOwner;
                break;
            }
            matrixOwner = up;
            depth++;
        }

        if (!userSlots[matrixOwner][slot].isUnlocked ||
            (slot > 1 && !userSlots[matrixOwner][slot].isLive) ||
            (matrixOwner != sponsor && !isMatrixQualified(matrixOwner) && matrixOwner != rootOwner)) {
            matrixOwner = rootOwner;
        }

        // Auto-activate slot for root matrix owner if not yet unlocked
        if (matrixOwner == rootOwner && !userSlots[matrixOwner][slot].isUnlocked) {
            userSlots[matrixOwner][slot].isUnlocked   = true;
            userSlots[matrixOwner][slot].isLive       = true;
            userSlots[matrixOwner][slot].currentCycle = 1;
            userSlots[matrixOwner][slot].filledNodes  = 0;
            if (slot > highestSlot[matrixOwner]) {
                highestSlot[matrixOwner] = slot;
            }
            emit SlotJoined(matrixOwner, slot, 0, address(0), block.timestamp);
            emit TreeGraphStarted(matrixOwner, uint8(slot), block.timestamp);
        }

        // If newUser is the root matrix owner, they have no upline tree above them to place into
        if (matrixOwner == newUser) {
            return;
        }

        MatrixSlot storage mSlot = userSlots[matrixOwner][slot];
        uint256 position = mSlot.filledNodes + 1; // 1..14
        mSlot.nodes[position - 1] = newUser;
        mSlot.filledNodes++;

        _routePayment(matrixOwner, newUser, slot, position, mSlot.currentCycle, cost);

        if (mSlot.filledNodes == TREE_NODES) {
            _completeCycle(matrixOwner, slot);
        }
    }

    // -------------------------------------------------------------------------
    // Payment Router
    // -------------------------------------------------------------------------

    /**
     * @dev Route slot cost to correct recipient based on position.
     *
     *  P1  → Upline 1 (if qualified), else 4 Protocol Pools (EquoraVault)
     *  P2  → Upline 2 (if qualified), else 4 Protocol Pools (EquoraVault)
     *  P3, P6, P8, P9, P11, P12 → Slot Owner (direct income)
     *  P4, P5, P14 → EquoraVault (Protocol Pools: 35% DAO, 40% Royalty, 15% Rewards, 10% Box)
     *  P7, P10 → Downline 1 (if qualified), else 4 Protocol Pools (EquoraVault)
     *  P13 → Downline 2 (if qualified), else 4 Protocol Pools (EquoraVault)
     *
     *  INVARIANT: . wei of cost is distributed — no silent sinks.
     */
    function _routePayment(
        address matrixOwner,
        address /*placedUser*/,
        uint256 slot,
        uint256 position,
        uint256 cycle,
        uint256 cost
    ) internal {
        uint8 s = uint8(slot);
        uint8 p = uint8(position);

        emit PositionFilled(matrixOwner, s, cycle, p, matrixOwner, cost);

        if (position == 1) {
            // P1 → Upline 1
            address upline1 = registry.getSponsor(matrixOwner);
            if (upline1 != address(0) && isMatrixQualified(upline1)) {
                _pushMatrixPayment(upline1, cost);
                emit DistributionExecuted(upline1, cost, PayoutType.UPLINE_1, s, cycle, p);
            } else {
                // Unqualified or missing upline -> routed directly to the 4 automated protocol pools!
                _forwardToVault(matrixOwner, cost);
                emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, cycle, p);
                emit ProtocolPoolFunded(matrixOwner, cost, s, cycle, p, block.timestamp);
            }

        } else if (position == 2) {
            // P2 → Upline 2 (strictly distinct from Upline 1 and matrixOwner to prevent double payouts)
            address up1     = registry.getSponsor(matrixOwner);
            address upline2 = (up1 != address(0)) ? registry.getSponsor(up1) : address(0);
            uint256 depth = 0;
            while (
                (upline2 == up1 || upline2 == matrixOwner || !isMatrixQualified(upline2)) &&
                upline2 != address(0) &&
                depth < MAX_UPLINE_DEPTH
            ) {
                address nextUp = registry.getSponsor(upline2);
                if (nextUp == address(0) || nextUp == upline2) {
                    upline2 = address(0);
                    break;
                }
                upline2 = nextUp;
                depth++;
            }

            if (upline2 != address(0) && upline2 != up1 && upline2 != matrixOwner && isMatrixQualified(upline2)) {
                _pushMatrixPayment(upline2, cost);
                emit DistributionExecuted(upline2, cost, PayoutType.UPLINE_2, s, cycle, p);
            } else {
                // Unqualified, same sponsor, or missing upline -> routed directly to the 4 automated protocol pools!
                _forwardToVault(matrixOwner, cost);
                emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, cycle, p);
                emit ProtocolPoolFunded(matrixOwner, cost, s, cycle, p, block.timestamp);
            }

        } else if (
            position == 3  || position == 6  ||
            position == 8  || position == 9  ||
            position == 11 || position == 12
        ) {
            // P3, P6, P8, P9, P11, P12 → Owner direct income
            // Strict 2 direct referrals requirement: if not yet qualified, route to protocol pools!
            if (isMatrixQualified(matrixOwner)) {
                _creditOwner(matrixOwner, slot, cost);
                emit DistributionExecuted(matrixOwner, cost, PayoutType.OWNER_DIRECT, s, cycle, p);
            } else {
                _forwardToVault(matrixOwner, cost);
                emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, cycle, p);
                emit ProtocolPoolFunded(matrixOwner, cost, s, cycle, p, block.timestamp);
            }

        } else if (position == 4 || position == 5 || position == 14) {
            // P4, P5, P14 → Protocol Pools via EquoraVault (35% Ecosystem & DAO Pool, 40% Royalty Pool, 15% Level Rewards, 10% Magic Blind Box)
            _forwardToVault(matrixOwner, cost);
            emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, cycle, p);
            emit ProtocolPoolFunded(matrixOwner, cost, s, cycle, p, block.timestamp);

            // Two-Stage Tier Escalation (Stage 1):
            // 4th and 5th node fund protocol pools automatically ($0 out-of-pocket).
            // At position 5, the next slot is UNLOCKED & RESERVED in standby mode.
            // It does NOT start earning or accepting placements yet until this board completes all 14 nodes!
            if (position == 5 && slot < TOTAL_SLOTS) {
                uint256 nextSlot = slot + 1;
                if (!userSlots[matrixOwner][nextSlot].isUnlocked) {
                    userSlots[matrixOwner][nextSlot].isUnlocked   = true;
                    userSlots[matrixOwner][nextSlot].isLive       = false; // RESERVED STANDBY
                    userSlots[matrixOwner][nextSlot].currentCycle = 1;
                    userSlots[matrixOwner][nextSlot].filledNodes  = 0;
                    if (nextSlot > highestSlot[matrixOwner]) {
                        highestSlot[matrixOwner] = nextSlot;
                    }
                    emit SlotReserved(matrixOwner, s, uint8(nextSlot), block.timestamp);
                }
            }

        } else if (position == 7 || position == 10 || position == 13) {
            _routeDownlineSpillover(matrixOwner, slot, position, cycle, cost);
        }
    }

    /**
     * @dev Route downline spillover positions (P7, P10, P13).
     *      - P7: Targets Node 1 first. If unqualified -> fallback to Node 2. If neither -> pools.
     *      - P10: Targets Node 2 second. Anti-double payout prevents paying either node twice.
     *      - P13: Option B queue scan across downline's downlines (Nodes 3, 4, 5, 6).
     *             Splits equally among qualified candidates. If none -> pools.
     */
    function _routeDownlineSpillover(
        address matrixOwner,
        uint256 slot,
        uint256 position,
        uint256 cycle,
        uint256 cost
    ) internal {
        if (position == 7) {
            _routeP7(matrixOwner, slot, cycle, cost);
        } else if (position == 10) {
            _routeP10(matrixOwner, slot, cycle, cost);
        } else if (position == 13) {
            _routeP13(matrixOwner, slot, cycle, cost);
        }
    }

    function _routeP7(address matrixOwner, uint256 slot, uint256 cycle, uint256 cost) internal {
        uint8 s = uint8(slot);
        address dl1 = userSlots[matrixOwner][slot].nodes[0];
        address dl2 = userSlots[matrixOwner][slot].nodes[1];

        if (dl1 != address(0) && isMatrixQualified(dl1)) {
            p7PaidRecipient[matrixOwner][slot][cycle] = dl1;
            _pushMatrixPayment(dl1, cost);
            emit SpilloverResolved(matrixOwner, dl1, 7, false);
            emit DistributionExecuted(dl1, cost, PayoutType.SPILLOVER_DOWNLINE1, s, cycle, 7);
        } else if (dl2 != address(0) && isMatrixQualified(dl2)) {
            p7PaidRecipient[matrixOwner][slot][cycle] = dl2;
            _pushMatrixPayment(dl2, cost);
            emit SpilloverResolved(matrixOwner, dl2, 7, false);
            emit DistributionExecuted(dl2, cost, PayoutType.SPILLOVER_DOWNLINE2, s, cycle, 7);
        } else {
            _forwardToVault(matrixOwner, cost);
            emit SpilloverResolved(matrixOwner, vaultContract, 7, true);
            emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, cycle, 7);
            emit ProtocolPoolFunded(matrixOwner, cost, s, cycle, 7, block.timestamp);
        }
    }

    function _routeP10(address matrixOwner, uint256 slot, uint256 cycle, uint256 cost) internal {
        uint8 s = uint8(slot);
        address dl1 = userSlots[matrixOwner][slot].nodes[0];
        address dl2 = userSlots[matrixOwner][slot].nodes[1];
        address alreadyPaid = p7PaidRecipient[matrixOwner][slot][cycle];

        if (dl2 != address(0) && isMatrixQualified(dl2) && dl2 != alreadyPaid) {
            _pushMatrixPayment(dl2, cost);
            emit SpilloverResolved(matrixOwner, dl2, 10, false);
            emit DistributionExecuted(dl2, cost, PayoutType.SPILLOVER_DOWNLINE2, s, cycle, 10);
        } else if (dl1 != address(0) && isMatrixQualified(dl1) && dl1 != alreadyPaid) {
            _pushMatrixPayment(dl1, cost);
            emit SpilloverResolved(matrixOwner, dl1, 10, false);
            emit DistributionExecuted(dl1, cost, PayoutType.SPILLOVER_DOWNLINE1, s, cycle, 10);
        } else {
            _forwardToVault(matrixOwner, cost);
            emit SpilloverResolved(matrixOwner, vaultContract, 10, true);
            emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, cycle, 10);
            emit ProtocolPoolFunded(matrixOwner, cost, s, cycle, 10, block.timestamp);
        }
    }

    function _routeP13(address matrixOwner, uint256 slot, uint256 cycle, uint256 cost) internal {
        uint8 s = uint8(slot);
        uint256 count = 0;
        address dl1 = userSlots[matrixOwner][slot].nodes[0];
        address dl2 = userSlots[matrixOwner][slot].nodes[1];

        for (uint256 i = 2; i <= 5; i++) {
            address c = userSlots[matrixOwner][slot].nodes[i];
            if (c != address(0) && isMatrixQualified(c) && c != matrixOwner && c != dl1 && c != dl2) {
                count++;
            }
        }

        if (count == 0) {
            _forwardToVault(matrixOwner, cost);
            emit SpilloverResolved(matrixOwner, vaultContract, 13, true);
            emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, cycle, 13);
            emit ProtocolPoolFunded(matrixOwner, cost, s, cycle, 13, block.timestamp);
            return;
        }

        uint256 share = cost / count;
        uint256 rem = cost - (share * count);
        bool isFirst = true;

        for (uint256 i = 2; i <= 5; i++) {
            address c = userSlots[matrixOwner][slot].nodes[i];
            if (c != address(0) && isMatrixQualified(c) && c != matrixOwner && c != dl1 && c != dl2) {
                uint256 payout = isFirst ? (share + rem) : share;
                isFirst = false;
                _pushMatrixPayment(c, payout);
                emit SpilloverResolved(matrixOwner, c, 13, false);
                emit DistributionExecuted(c, payout, PayoutType.SPILLOVER_DOWNLINE1, s, cycle, 13);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Internal Helpers
    // -------------------------------------------------------------------------

    /**
     * @dev Push matrix payment directly to user's wallet via native TROB coin (or paymentToken fallback).
     *      Recipients receive their earnings automatically on-chain with zero gas fees.
     *      Anti-griefing: if direct transfer fails, held in userBalance for manual withdrawal.
     */
    function _pushMatrixPayment(address recipient, uint256 amount) internal {
        if (recipient == address(0) || amount == 0) return;
        // The deployer/owner key must NEVER act as a payout sink. Forward to Vault instead!
        if (recipient == owner() && vaultContract != address(0)) {
            _forwardToVault(recipient, amount);
            return;
        }
        totalEarned[recipient] += amount;

        bool ok = false;
        if (address(this).balance >= amount) {
            (bool sent, ) = payable(recipient).call{value: amount}("");
            ok = sent;
        }
        if (!ok && address(paymentToken) != address(0)) {
            try paymentToken.transfer(recipient, amount) returns (bool res) {
                ok = res;
            } catch {}
        }

        if (!ok) {
            userBalance[recipient] += amount;
        }
    }

    /**
     * @dev Credit matrix owner's balance and track per-slot earnings.
     */
    function _creditOwner(address matrixOwner, uint256 slot, uint256 amount) internal {
        userSlots[matrixOwner][slot].totalEarned += amount;
        if (matrixOwner == vaultContract || matrixOwner == owner()) {
            _forwardToVault(matrixOwner, amount);
        } else {
            _pushMatrixPayment(matrixOwner, amount);
        }
    }

    /**
     * @dev Forward P4/P5/P14 funds to EquoraVault for protocol pool distribution.
     *      The vault routes: 35% Ecosystem & DAO Pool, 40% Royalty Pool, 15% Level Rewards, 10% Magic Blind Box.
     *      If vault is not configured (pre-wiring), funds credit to owner as safety.
     */
    function _forwardToVault(address matrixOwner, uint256 amount) internal {
        totalPoolForwarded += amount;

        if (vaultContract == address(0)) {
            // Safety fallback before wiring: push to matrix owner temporarily
            _pushMatrixPayment(matrixOwner, amount);
            return;
        }

        bool ok = false;
        if (address(this).balance >= amount) {
            (bool sent, ) = payable(vaultContract).call{value: amount}("");
            ok = sent;
        }
        if (!ok && address(paymentToken) != address(0)) {
            try paymentToken.transfer(vaultContract, amount) returns (bool res) {
                ok = res;
            } catch {}
        }

        // Notify vault to route funds into the 4 pools
        try IEquoraVault(vaultContract).routePoolDeposit(amount) {} catch {}
    }

    /**
     * @dev Complete a cycle:
     *      1. Snapshot active nodes into permanent history.
     *      2. Advance cycle counter, reset active state.
     *      3. Check Magic Blind Box milestone (rank NFT on slots 3,6,9,12 first cycle).
     *
     *      INVARIANT: cycleSnapshots only ever grows. Entries are never deleted.
     */
    function _completeCycle(address user, uint256 slot) internal {
        MatrixSlot storage mSlot = userSlots[user][slot];
        uint256 completedCycle = mSlot.currentCycle;

        // 1. Permanent snapshot
        MatrixCycleSnapshot memory snap;
        snap.cycleNumber = completedCycle;
        snap.completedAt = block.timestamp;
        for (uint256 i = 0; i < TREE_NODES; i++) {
            snap.nodes[i] = mSlot.nodes[i];
        }
        cycleSnapshots[user][slot].push(snap);

        // 2. Advance and reset ACTIVE state only
        mSlot.currentCycle++;
        mSlot.filledNodes = 0;
        for (uint256 i = 0; i < TREE_NODES; i++) {
            mSlot.nodes[i] = address(0);
        }

        totalRecycles++;
        emit CycleCompleted(user, uint8(slot), completedCycle, block.timestamp);
        emit MatrixRecycled(user, uint8(slot), mSlot.currentCycle, block.timestamp);

        // 3. Two-Stage Tier Escalation (Stage 2):
        // When completing Cycle 1 on any slot < TOTAL_SLOTS, the next slot officially
        // ACTIVATES for live placements and earnings! Board is live and accepting team placements.
        if (slot < TOTAL_SLOTS && completedCycle == 1) {
            uint256 nextSlot = slot + 1;
            if (userSlots[user][nextSlot].isUnlocked && !userSlots[user][nextSlot].isLive) {
                userSlots[user][nextSlot].isLive = true;
                emit SlotAutoActivated(user, uint8(slot), uint8(nextSlot), block.timestamp);
                emit SlotActivatedForEarning(user, uint8(nextSlot), block.timestamp);
            }
        }

        // 4. Milestone: Slots 3,6,9,12 on first cycle → mint Rank NFT
        if ((slot == 3 || slot == 6 || slot == 9 || slot == 12) && completedCycle == 1) {
            _awardMilestoneNFT(user, slot);
        }
    }

    /**
     * @dev Award milestone rank NFT on first cycle completion of key slots.
     *      Slot 3 → ALPHA, Slot 6 → PRIME, Slot 9 → ELITE, Slot 12 → CROWN
     */
    function _awardMilestoneNFT(address user, uint256 slot) internal {
        IEquoraNFT.Rank rank;
        if      (slot == 3)  rank = IEquoraNFT.Rank.ALPHA;
        else if (slot == 6)  rank = IEquoraNFT.Rank.PRIME;
        else if (slot == 9)  rank = IEquoraNFT.Rank.ELITE;
        else if (slot == 12) rank = IEquoraNFT.Rank.CROWN;
        else return;

        if (address(nftContract) != address(0)) {
            try nftContract.mintRankBadge(user, rank) {} catch {}
        }

        emit MilestoneReached(user, uint8(slot), uint8(rank), block.timestamp);
    }

    // -------------------------------------------------------------------------
    // Withdraw (Matrix Earnings)
    // -------------------------------------------------------------------------

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0,                        "EquoraMatrix: amount must be > 0");
        require(userBalance[msg.sender] >= amount, "EquoraMatrix: insufficient balance");

        userBalance[msg.sender]    -= amount;
        totalWithdrawn[msg.sender] += amount;

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
        require(ok, "EquoraMatrix: transfer failed");

        emit BalanceWithdrawn(msg.sender, amount, block.timestamp);
    }

    // -------------------------------------------------------------------------
    // View Functions
    // -------------------------------------------------------------------------

    function getSlotData(address user, uint256 slot) external view returns (
        bool        isUnlocked,
        uint256     currentCycle,
        uint256     filledNodes,
        address[14] memory nodes,
        uint256     slotEarned
    ) {
        MatrixSlot storage m = userSlots[user][slot];
        return (m.isUnlocked, m.currentCycle, m.filledNodes, m.nodes, m.totalEarned);
    }

    /**
     * @dev Checks if a slot is formally live and accepting placements / earning.
     *      Slot 1 is live upon unlock. Slots 2-12 become live only after preceding slot completes 14 nodes.
     */
    function isSlotLive(address user, uint256 slot) external view returns (bool) {
        return userSlots[user][slot].isLive;
    }

    function getSlotDataV2(address user, uint256 slot) external view returns (
        bool        isUnlocked,
        bool        isLive,
        uint256     currentCycle,
        uint256     filledNodes,
        address[14] memory nodes,
        uint256     slotEarned
    ) {
        MatrixSlot storage m = userSlots[user][slot];
        return (m.isUnlocked, m.isLive, m.currentCycle, m.filledNodes, m.nodes, m.totalEarned);
    }

    /**
     * @dev Checks if a user is qualified in the matrix.
     *      A user is qualified when they have successfully directed at least 2 direct referrals
     *      who have EACH made a deposit for 30$ worth of TROB (unlocked Slot 1).
     *      Genesis Root Matrix Owner is exempt as the root apex of the entire retail tree.
     */
    function isMatrixQualified(address user) public view returns (bool) {
        if (user == _getRootMatrixOwner()) return true;
        return getActiveDirectReferralsCount(user) >= 2;
    }

    /**
     * @dev Returns count of direct referrals who have successfully deposited 30$ worth of TROB (Slot 1).
     */
    function getActiveDirectReferralsCount(address user) public view returns (uint256) {
        uint256 tracked = activeDirectReferrals[user];
        if (tracked >= 2) return tracked;

        // Scan direct referrals registered under user to count those who deposited for Slot 1
        address[] memory directs = registry.getDirectReferrals(user);
        uint256 count = 0;
        for (uint256 i = 0; i < directs.length; i++) {
            if (userSlots[directs[i]][1].isUnlocked) {
                count++;
                if (count >= 2) return count;
            }
        }
        return count > tracked ? count : tracked;
    }

    /**
     * @dev Returns the list of direct referrals who have successfully deposited 30$ worth of TROB (Slot 1).
     */
    function getActiveDirectReferrals(address user) external view returns (address[] memory) {
        return _activeDirectReferralsList[user];
    }

    /**
     * @dev Checks if a user's 14-node matrix tree graph is officially started and accepting placements.
     *      Requires:
     *      1. Slot is unlocked.
     *      2. User has achieved 2 direct referrals eligibility with 30$ deposit each (or is the Genesis Root Matrix Owner).
     */
    function isMatrixTreeStarted(address user, uint256 slot) public view returns (bool) {
        if (!userSlots[user][slot].isUnlocked) return false;
        if (slot > 1 && !userSlots[user][slot].isLive) return false;
        return isMatrixQualified(user);
    }

    /**
     * @dev Returns the 14 nodes of a user's slot tree graph along with their 5-digit member codes and member IDs.
     *      As members register & deposit in the matrix, their IDs are shown on their sponsor's graph!
     */
    function getSlotNodesWithCodes(address user, uint256 slot) external view returns (
        address[14] memory nodeAddresses,
        uint32[14]  memory nodeCodes,
        uint256[14] memory nodeMemberIds
    ) {
        MatrixSlot storage m = userSlots[user][slot];
        nodeAddresses = m.nodes;
        for (uint256 i = 0; i < TREE_NODES; i++) {
            address nodeAddr = m.nodes[i];
            if (nodeAddr != address(0)) {
                nodeCodes[i]     = registry.getCodeByUser(nodeAddr);
                nodeMemberIds[i] = registry.getUserId(nodeAddr);
            }
        }
    }

    function getAllSlotsStatus(address user) external view returns (
        bool[12]    memory unlocked,
        uint256[12] memory cycles,
        uint256[12] memory filled
    ) {
        for (uint256 i = 1; i <= TOTAL_SLOTS; i++) {
            unlocked[i - 1] = userSlots[user][i].isUnlocked;
            cycles[i - 1]   = userSlots[user][i].currentCycle;
            filled[i - 1]   = userSlots[user][i].filledNodes;
        }
    }

    function getAllSlotsLiveStatus(address user) external view returns (bool[12] memory live) {
        for (uint256 i = 1; i <= TOTAL_SLOTS; i++) {
            live[i - 1] = userSlots[user][i].isLive;
        }
    }

    function getUserFinancials(address user) external view returns (
        uint256 availableBalance,
        uint256 lifetimeEarned,
        uint256 withdrawn,
        uint256 highestSlotUnlocked
    ) {
        return (userBalance[user], totalEarned[user], totalWithdrawn[user], highestSlot[user]);
    }

    function getSlotCost(uint256 slot) external view returns (uint256) {
        require(slot >= 1 && slot <= TOTAL_SLOTS, "EquoraMatrix: invalid slot");
        return slotCosts[slot];
    }

    function getCycleSnapshotCount(address user, uint256 slot) external view returns (uint256) {
        return cycleSnapshots[user][slot].length;
    }

    function getCycleSnapshot(address user, uint256 slot, uint256 index) external view returns (
        uint256     cycleNumber,
        address[14] memory nodes,
        uint256     completedAt
    ) {
        MatrixCycleSnapshot storage snap = cycleSnapshots[user][slot][index];
        return (snap.cycleNumber, snap.nodes, snap.completedAt);
    }

    function getGlobalStats() external view returns (
        uint256 members,
        uint256 recycles,
        uint256 volume,
        uint256 poolForwarded
    ) {
        return (totalMembers, totalRecycles, totalVolumeProcessed, totalPoolForwarded);
    }
}

// ---------------------------------------------------------------------------
// Minimal interface for EquoraVault cross-contract call
// ---------------------------------------------------------------------------

interface IEquoraVault {
    /// @dev Called by EquoraMatrix to route P4/P5/P14 funds into the 4 protocol pools.
    ///      Vault splits: 35% Ecosystem & DAO Pool | 40% Royalty Pool | 15% Level Rewards | 10% Magic Blind Box.
    function routePoolDeposit(uint256 amount) external;
}
