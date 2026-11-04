// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IEquoraRegistry.sol";
import "../interfaces/IEquoraNFT.sol";

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
    uint256 public constant MAX_CASCADE_DEPTH    = 12;

    uint256 public trobPriceUsd6                 = 56_000;       // Benchmark $0.056 USD (6 decimals, matches EquoraDAOv2)
    uint256 public baseSlotCost                  = 535_714_285;  // 535.714285 TROB in SUN ($30 USD at $0.056)
    uint256 public lastPriceUpdateTimestamp;
    address public priceOracle;

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
        address[14] nodes;           // ACTIVE cycle positions (occupants)
        address[14] payoutRecipients;// on-chain recipient of payout for each of the 14 positions
        uint8[14]   payoutTypes;     // on-chain payout type for each of the 14 positions
        uint256     totalEarned;     // lifetime owner income from this slot
    }

    /// @dev Permanent, immutable history of every completed cycle.
    ///      Once pushed, entries are never deleted or modified.
    struct MatrixCycleSnapshot {
        uint256     cycleNumber;
        address[14] nodes;           // snapshot of positions at completion
        address[14] payoutRecipients;// snapshot of payout recipients
        uint8[14]   payoutTypes;     // snapshot of payout types
        uint256     completedAt;     // block.timestamp
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

    // Genesis Apex Root wallet address
    address public genesisRoot;

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
    event GenesisRootSet(address indexed root);
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
    event PriceOracleSet(address indexed oracle);
    event DownlineCascadeStep(
        address indexed target,
        address indexed placedUser,
        uint8   slot,
        uint8   position,
        uint256 depth,
        uint256 amount
    );
    event DownlineCascadeResolved(
        address indexed target,
        address indexed finalRecipient,
        uint8   slot,
        uint8   position,
        uint256 depth,
        uint256 amount,
        string  reason
    );

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
    // Admin & Price Oracle (only callable before renounceOwnership)
    // -------------------------------------------------------------------------

    function setPriceOracle(address _oracle) external onlyOwner {
        priceOracle = _oracle;
        emit PriceOracleSet(_oracle);
    }

    /**
     * @dev Updates the live TROB market price and dynamically recalculates slot costs for $30 USD.
     *      Formula: baseSlotCost = ($30 USD / _trobPriceUsd6) * 1e6 (in SUN)
     *      Callable by owner or authorized priceOracle.
     */
    function setTrobPrice(uint256 _trobPriceUsd6) public {
        require(msg.sender == owner() || (priceOracle != address(0) && msg.sender == priceOracle), "EquoraMatrix: unauthorized");
        require(_trobPriceUsd6 > 0, "EquoraMatrix: price must be > 0");
        trobPriceUsd6 = _trobPriceUsd6;
        lastPriceUpdateTimestamp = block.timestamp;

        uint256 newBase = (ENTRY_FEE_USD * 1e6) / _trobPriceUsd6;
        if (newBase < MIN_SLOT1_FLOOR) newBase = MIN_SLOT1_FLOOR;
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
     * @dev Returns exact required TROB (in SUN) for a slot pegged to live TROB price.
     */
    function getRequiredTrobForSlot(uint256 slot) public view returns (uint256) {
        require(slot >= 1 && slot <= TOTAL_SLOTS, "EquoraMatrix: invalid slot");
        uint256 cost = (ENTRY_FEE_USD * 1e6) / trobPriceUsd6;
        if (cost < MIN_SLOT1_FLOOR) cost = MIN_SLOT1_FLOOR;
        return cost;
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

    function setGenesisRoot(address _root) external onlyOwner {
        require(_root != address(0), "EquoraMatrix: invalid root");
        genesisRoot = _root;
        emit GenesisRootSet(_root);
    }

    /**
     * @dev Seeds the Genesis Apex Root and Seat #1 (Node 1) on-chain.
     *      _genesisRoot is set to Apex Root (#0001) with Slot 1 unlocked.
     *      _node1User is placed directly in Seat #1 (nodes[0]) under Genesis Root.
     *      Seat #2 (nodes[1]) is left open (address(0)) for the next natural entrant.
     */
    function seedGenesisEcosystem(address _genesisRoot, address _node1User) external onlyOwner {
        require(_genesisRoot != address(0), "EquoraMatrix: invalid genesis root");
        genesisRoot = _genesisRoot;

        // 1. Setup Genesis Root Slot 1
        userSlots[_genesisRoot][1].isUnlocked = true;
        userSlots[_genesisRoot][1].isLive = true;
        userSlots[_genesisRoot][1].currentCycle = 1;
        highestSlot[_genesisRoot] = 1;

        if (!registry.isRegistered(_genesisRoot)) {
            try registry.registerUser(_genesisRoot, vaultContract) {} catch {}
        }

        // 2. Setup Node 1 User (_node1User) in Seat #1
        if (_node1User != address(0)) {
            if (!registry.isRegistered(_node1User)) {
                try registry.registerUser(_node1User, _genesisRoot) {} catch {}
            }

            userSlots[_node1User][1].isUnlocked = true;
            userSlots[_node1User][1].isLive = true;
            userSlots[_node1User][1].currentCycle = 1;
            highestSlot[_node1User] = 1;

            // Place into Seat #1 (Position 1, index 0)
            userSlots[_genesisRoot][1].nodes[0] = _node1User;
            userSlots[_genesisRoot][1].filledNodes = 1;

            if (!hasDirectReferralDeposited[_genesisRoot][_node1User]) {
                hasDirectReferralDeposited[_genesisRoot][_node1User] = true;
                activeDirectReferrals[_genesisRoot] = 1;
                _activeDirectReferralsList[_genesisRoot].push(_node1User);
                emit ActiveDirectReferralCounted(_genesisRoot, _node1User, 1, block.timestamp);
            }

            emit SlotJoined(_node1User, 1, baseSlotCost, _genesisRoot, block.timestamp);
            emit PositionFilled(_genesisRoot, 1, 1, 1, _node1User, baseSlotCost);
        }

        emit GenesisRootSet(_genesisRoot);
        emit SlotJoined(_genesisRoot, 1, baseSlotCost, vaultContract, block.timestamp);
        emit TreeGraphStarted(_genesisRoot, 1, block.timestamp);
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
        if (validSponsor == address(0) || validSponsor == owner() || validSponsor == vaultContract || validSponsor == address(this)) {
            validSponsor = _getRootMatrixOwner();
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

        uint256 dynamicCost = (ENTRY_FEE_USD * 1e6) / trobPriceUsd6;
        if (dynamicCost < MIN_SLOT1_FLOOR) dynamicCost = MIN_SLOT1_FLOOR;
        uint256 minAllowed = (dynamicCost * 90) / 100;
        if (minAllowed < MIN_SLOT1_FLOOR) minAllowed = MIN_SLOT1_FLOOR;

        uint256 cost = dynamicCost;
        if (msg.value > 0) {
            require(msg.value >= minAllowed, "EquoraMatrix: payment below live market rate");
            cost = msg.value;
        } else if (address(paymentToken) != address(0)) {
            require(cost >= minAllowed, "EquoraMatrix: payment below minimum floor");
            bool ok = paymentToken.transferFrom(msg.sender, address(this), cost);
            require(ok, "EquoraMatrix: payment failed");
        } else {
            revert("EquoraMatrix: payment required in native TROB");
        }

        totalVolumeProcessed += cost;

        // Register user on first join (slot 1) if not already registered
        if (!registry.isRegistered(msg.sender)) {
            address targetSponsor = sponsor;
            if (targetSponsor == address(0) || targetSponsor == owner() || targetSponsor == vaultContract || targetSponsor == address(this)) {
                targetSponsor = _getRootMatrixOwner();
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
        if (genesisRoot != address(0)) {
            return genesisRoot;
        }
        address regRoot = address(0);
        try registry.getRoot() returns (address r) {
            regRoot = r;
        } catch {}
        if (regRoot != address(0)) {
            return regRoot;
        }
        if (daoContract != address(0)) {
            try IEquoraDAOForMatrix(daoContract).getLastMember() returns (address lastDaoMember) {
                if (lastDaoMember != address(0)) {
                    return lastDaoMember;
                }
            } catch {}
        }
        return vaultContract;
    }

    /**
     * @dev Place new user in matrix upon slot activation.
     *      Identifies the user\'s direct sponsor. If sponsor\'s slot is not unlocked yet,
     *      bubbles up to the first unlocked upline (or root matrix owner).
     *      Recursively executes placement into the board\'s next vacant seat (1..14).
     */
    function _placeUserInMatrix(address newUser, uint256 slot, uint256 cost) internal {
        address rootOwner = _getRootMatrixOwner();
        address sponsor = registry.getSponsor(newUser);
        if (sponsor == address(0) || sponsor == owner()) sponsor = rootOwner;

        // Auto-activate slot for root matrix owner if not yet unlocked
        if (rootOwner != address(0) && !userSlots[rootOwner][slot].isUnlocked) {
            userSlots[rootOwner][slot].isUnlocked   = true;
            userSlots[rootOwner][slot].isLive       = true;
            userSlots[rootOwner][slot].currentCycle = 1;
            userSlots[rootOwner][slot].filledNodes  = 0;
            if (slot > highestSlot[rootOwner]) {
                highestSlot[rootOwner] = slot;
            }
            emit SlotJoined(rootOwner, slot, 0, address(0), block.timestamp);
            emit TreeGraphStarted(rootOwner, uint8(slot), block.timestamp);
        }

        // If newUser is the root matrix owner, there is no upline tree to place into
        if (newUser == rootOwner || newUser == address(0)) {
            return;
        }

        // Sponsor is the primary board to receive this direct referral.
        // If sponsor\'s slot is not unlocked yet, bubble up to first eligible upline.
        address targetBoard = sponsor;
        uint256 depth = 0;
        while (
            (!userSlots[targetBoard][slot].isUnlocked ||
             (slot > 1 && !userSlots[targetBoard][slot].isLive)) &&
            targetBoard != rootOwner &&
            depth < MAX_UPLINE_DEPTH
        ) {
            address up = registry.getSponsor(targetBoard);
            if (up == address(0) || up == targetBoard || up == owner()) {
                targetBoard = rootOwner;
                break;
            }
            targetBoard = up;
            depth++;
        }

        if (!userSlots[targetBoard][slot].isUnlocked || (slot > 1 && !userSlots[targetBoard][slot].isLive)) {
            targetBoard = rootOwner;
        }

        _executeBoardPlacement(targetBoard, newUser, slot, cost, 1);
    }

    // -------------------------------------------------------------------------
    // Dynamic Recursive Board Placement & Action Engine
    // -------------------------------------------------------------------------

    /**
     * @dev Core Recursive Matrix Placement & Dynamic Action Router.
     *      Places placedUser into oardOwner\'s next vacant seat (1..14).
     *      Executes that specific seat\'s economic rule.
     *      If the seat is a Pass-Up (P1, P2) or Spillover (P7, P10, P13), it places the user
     *      into the recipient\'s board in THEIR next vacant seat and executes THEIR action recursively!
     *      Returns the address of the ultimate recipient who received the funds.
     */
    function _executeBoardPlacement(
        address boardOwner,
        address placedUser,
        uint256 slot,
        uint256 cost,
        uint256 depth
    ) internal returns (address recipient) {
        if (boardOwner == address(0) || cost == 0 || depth > MAX_CASCADE_DEPTH) {
            _forwardToVault(boardOwner, cost);
            return vaultContract;
        }

        address rootOwner = _getRootMatrixOwner();
        if (boardOwner == rootOwner && !userSlots[boardOwner][slot].isUnlocked) {
            userSlots[boardOwner][slot].isUnlocked   = true;
            userSlots[boardOwner][slot].isLive       = true;
            userSlots[boardOwner][slot].currentCycle = 1;
            userSlots[boardOwner][slot].filledNodes  = 0;
            if (slot > highestSlot[boardOwner]) {
                highestSlot[boardOwner] = slot;
            }
        }

        MatrixSlot storage mSlot = userSlots[boardOwner][slot];
        if (!mSlot.isUnlocked || (slot > 1 && !mSlot.isLive)) {
            _forwardToVault(boardOwner, cost);
            return vaultContract;
        }

        // 1. Determine next vacant seat (1..14)
        uint256 vacantPos = mSlot.filledNodes + 1;
        if (vacantPos > TREE_NODES) {
            _completeCycle(boardOwner, slot);
            vacantPos = 1;
        }

        // 2. Place user in board
        mSlot.nodes[vacantPos - 1] = placedUser;
        mSlot.filledNodes++;

        uint8 s = uint8(slot);
        uint8 p = uint8(vacantPos);
        uint256 curCycle = mSlot.currentCycle;

        emit PositionFilled(boardOwner, s, curCycle, p, placedUser, cost);

        // 3. Dynamic Action Execution based on vacantPos
        if (vacantPos == 1) {
            // Level 1 Left Pass-Up -> Upline 1
            address upline1 = registry.getSponsor(boardOwner);
            if (upline1 == address(0) || upline1 == owner()) upline1 = rootOwner;

            if (
                boardOwner != rootOwner &&
                upline1 != address(0) &&
                upline1 != boardOwner &&
                isMatrixQualified(upline1) &&
                userSlots[upline1][slot].isUnlocked
            ) {
                // Pass-Up: placedUser lands in upline1\'s next vacant seat!
                recipient = _executeBoardPlacement(upline1, placedUser, slot, cost, depth + 1);
                mSlot.payoutRecipients[p - 1] = recipient;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.UPLINE_1);
                emit DistributionExecuted(recipient, cost, PayoutType.UPLINE_1, s, curCycle, p);
            } else {
                // Unqualified upline or top of tree -> funds divert 100% to 4 Protocol Pools
                _forwardToVault(boardOwner, cost);
                recipient = vaultContract;
                mSlot.payoutRecipients[p - 1] = vaultContract;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.PROTOCOL_POOL);
                emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, curCycle, p);
                emit ProtocolPoolFunded(boardOwner, cost, s, curCycle, p, block.timestamp);
            }

        } else if (vacantPos == 2) {
            // Level 1 Right Pass-Up -> Upline 2
            address up1 = registry.getSponsor(boardOwner);
            if (up1 == address(0) || up1 == owner()) up1 = rootOwner;
            address upline2 = (up1 != address(0)) ? registry.getSponsor(up1) : address(0);
            if (upline2 == address(0) || upline2 == owner()) upline2 = (up1 != rootOwner) ? rootOwner : address(0);

            // Skip unqualified uplines
            uint256 uDepth = 0;
            while (
                (upline2 == up1 || upline2 == boardOwner || upline2 == owner() || !isMatrixQualified(upline2)) &&
                upline2 != address(0) &&
                uDepth < MAX_UPLINE_DEPTH
            ) {
                address nextUp = registry.getSponsor(upline2);
                if (nextUp == address(0) || nextUp == upline2) {
                    upline2 = (up1 != rootOwner && boardOwner != rootOwner) ? rootOwner : address(0);
                    break;
                }
                upline2 = nextUp;
                uDepth++;
            }

            if (
                boardOwner != rootOwner &&
                upline2 != address(0) &&
                upline2 != up1 &&
                upline2 != boardOwner &&
                isMatrixQualified(upline2) &&
                userSlots[upline2][slot].isUnlocked
            ) {
                // Pass-Up: placedUser lands in upline2\'s next vacant seat!
                recipient = _executeBoardPlacement(upline2, placedUser, slot, cost, depth + 1);
                mSlot.payoutRecipients[p - 1] = recipient;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.UPLINE_2);
                emit DistributionExecuted(recipient, cost, PayoutType.UPLINE_2, s, curCycle, p);
            } else {
                // Unqualified or top of tree -> funds divert 100% to 4 Protocol Pools
                _forwardToVault(boardOwner, cost);
                recipient = vaultContract;
                mSlot.payoutRecipients[p - 1] = vaultContract;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.PROTOCOL_POOL);
                emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, curCycle, p);
                emit ProtocolPoolFunded(boardOwner, cost, s, curCycle, p, block.timestamp);
            }

        } else if (
            vacantPos == 3  || vacantPos == 6  ||
            vacantPos == 8  || vacantPos == 9  ||
            vacantPos == 11 || vacantPos == 12
        ) {
            // Direct Owner Income seats:
            // Must have strict 2 active direct referrals (or be Root Owner)
            if (isMatrixQualified(boardOwner)) {
                _creditOwner(boardOwner, slot, cost);
                recipient = boardOwner;
                mSlot.payoutRecipients[p - 1] = boardOwner;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.OWNER_DIRECT);
                emit DistributionExecuted(boardOwner, cost, PayoutType.OWNER_DIRECT, s, curCycle, p);
            } else {
                _forwardToVault(boardOwner, cost);
                recipient = vaultContract;
                mSlot.payoutRecipients[p - 1] = vaultContract;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.PROTOCOL_POOL);
                emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, curCycle, p);
                emit ProtocolPoolFunded(boardOwner, cost, s, curCycle, p, block.timestamp);
            }

        } else if (vacantPos == 4 || vacantPos == 5 || vacantPos == 14) {
            // Protocol Pools via EquoraVault (35% DAO, 40% Royalty, 15% Level Rewards, 10% Blind Box)
            _forwardToVault(boardOwner, cost);
            recipient = vaultContract;
            mSlot.payoutRecipients[p - 1] = vaultContract;
            mSlot.payoutTypes[p - 1] = uint8(PayoutType.PROTOCOL_POOL);
            emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, curCycle, p);
            emit ProtocolPoolFunded(boardOwner, cost, s, curCycle, p, block.timestamp);

            // Position 5: Two-Stage Tier Escalation (Stage 1) - reserve next slot in standby mode
            if (vacantPos == 5 && slot < TOTAL_SLOTS) {
                uint256 nextSlot = slot + 1;
                if (!userSlots[boardOwner][nextSlot].isUnlocked) {
                    userSlots[boardOwner][nextSlot].isUnlocked   = true;
                    userSlots[boardOwner][nextSlot].isLive       = false; // RESERVED STANDBY
                    userSlots[boardOwner][nextSlot].currentCycle = 1;
                    userSlots[boardOwner][nextSlot].filledNodes  = 0;
                    if (nextSlot > highestSlot[boardOwner]) {
                        highestSlot[boardOwner] = nextSlot;
                    }
                    emit SlotReserved(boardOwner, s, uint8(nextSlot), block.timestamp);
                }
            }

            // Position 14: Two-Stage Tier Escalation (Stage 2) & Complete Cycle
            if (vacantPos == 14) {
                _completeCycle(boardOwner, slot);
            }

        } else if (vacantPos == 7) {
            // Spillover Downline 1 (Node 1 of boardOwner\'s tree)
            address dl1 = mSlot.nodes[0];
            if (
                dl1 != address(0) &&
                dl1 != boardOwner &&
                isMatrixQualified(dl1) &&
                userSlots[dl1][slot].isUnlocked
            ) {
                p7PaidRecipient[boardOwner][slot][curCycle] = dl1;
                emit SpilloverResolved(boardOwner, dl1, 7, false);
                // Spillover: lands in dl1\'s next vacant seat!
                recipient = _executeBoardPlacement(dl1, placedUser, slot, cost, depth + 1);
                mSlot.payoutRecipients[p - 1] = recipient;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.SPILLOVER_DOWNLINE1);
                emit DistributionExecuted(recipient, cost, PayoutType.SPILLOVER_DOWNLINE1, s, curCycle, 7);
            } else {
                _forwardToVault(boardOwner, cost);
                recipient = vaultContract;
                mSlot.payoutRecipients[p - 1] = vaultContract;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.PROTOCOL_POOL);
                emit SpilloverResolved(boardOwner, vaultContract, 7, true);
                emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, curCycle, 7);
                emit ProtocolPoolFunded(boardOwner, cost, s, curCycle, 7, block.timestamp);
            }

        } else if (vacantPos == 10) {
            // Spillover Downline 2 (Node 2 of boardOwner\'s tree)
            address dl2 = mSlot.nodes[1];
            if (
                dl2 != address(0) &&
                dl2 != boardOwner &&
                isMatrixQualified(dl2) &&
                userSlots[dl2][slot].isUnlocked
            ) {
                emit SpilloverResolved(boardOwner, dl2, 10, false);
                // Spillover: lands in dl2\'s next vacant seat!
                recipient = _executeBoardPlacement(dl2, placedUser, slot, cost, depth + 1);
                mSlot.payoutRecipients[p - 1] = recipient;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.SPILLOVER_DOWNLINE2);
                emit DistributionExecuted(recipient, cost, PayoutType.SPILLOVER_DOWNLINE2, s, curCycle, 10);
            } else {
                _forwardToVault(boardOwner, cost);
                recipient = vaultContract;
                mSlot.payoutRecipients[p - 1] = vaultContract;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.PROTOCOL_POOL);
                emit SpilloverResolved(boardOwner, vaultContract, 10, true);
                emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, curCycle, 10);
                emit ProtocolPoolFunded(boardOwner, cost, s, curCycle, 10, block.timestamp);
            }

        } else if (vacantPos == 13) {
            // Waterfall across Level 2 Downlines (Nodes 3, 4, 5, 6)
            address dl1 = mSlot.nodes[0];
            address dl2 = mSlot.nodes[1];
            address target = address(0);
            for (uint256 i = 2; i <= 5; i++) {
                address candidate = mSlot.nodes[i];
                if (
                    candidate != address(0) &&
                    candidate != boardOwner &&
                    candidate != dl1 &&
                    candidate != dl2 &&
                    isMatrixQualified(candidate) &&
                    userSlots[candidate][slot].isUnlocked &&
                    (slot == 1 || userSlots[candidate][slot].isLive) &&
                    userSlots[candidate][slot].filledNodes < TREE_NODES
                ) {
                    target = candidate;
                    break;
                }
            }

            if (target != address(0)) {
                emit SpilloverResolved(boardOwner, target, 13, false);
                // Waterfall spillover: lands in candidate\'s next vacant seat!
                recipient = _executeBoardPlacement(target, placedUser, slot, cost, depth + 1);
                mSlot.payoutRecipients[p - 1] = recipient;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.SPILLOVER_DOWNLINE1);
                emit DistributionExecuted(recipient, cost, PayoutType.SPILLOVER_DOWNLINE1, s, curCycle, 13);
            } else {
                _forwardToVault(boardOwner, cost);
                recipient = vaultContract;
                mSlot.payoutRecipients[p - 1] = vaultContract;
                mSlot.payoutTypes[p - 1] = uint8(PayoutType.PROTOCOL_POOL);
                emit SpilloverResolved(boardOwner, vaultContract, 13, true);
                emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, curCycle, 13);
                emit ProtocolPoolFunded(boardOwner, cost, s, curCycle, 13, block.timestamp);
            }
        }

        // 4. Complete cycle if 14 nodes reached (and not already completed in position 14)
        if (mSlot.filledNodes == TREE_NODES && vacantPos != 14) {
            _completeCycle(boardOwner, slot);
        }

        return recipient;
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
            try IEquoraVault(vaultContract).routePoolDeposit{value: amount, gas: 3000000}(amount) {
                ok = true;
            } catch {
                (bool sent, ) = payable(vaultContract).call{value: amount, gas: 3000000}("");
                ok = sent;
            }
        }
        if (!ok && address(paymentToken) != address(0)) {
            try paymentToken.transfer(vaultContract, amount) returns (bool res) {
                ok = res;
                if (ok) {
                    try IEquoraVault(vaultContract).routePoolDeposit(amount) {} catch {}
                }
            } catch {}
        }

        if (!ok) {
            _pushMatrixPayment(matrixOwner, amount);
        }
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
            snap.payoutRecipients[i] = mSlot.payoutRecipients[i];
            snap.payoutTypes[i] = mSlot.payoutTypes[i];
        }
        cycleSnapshots[user][slot].push(snap);

        // 2. Advance and reset ACTIVE state only
        mSlot.currentCycle++;
        mSlot.filledNodes = 0;
        for (uint256 i = 0; i < TREE_NODES; i++) {
            mSlot.nodes[i] = address(0);
            mSlot.payoutRecipients[i] = address(0);
            mSlot.payoutTypes[i] = 0;
        }

        totalRecycles++;
        emit CycleCompleted(user, uint8(slot), completedCycle, block.timestamp);
        emit MatrixRecycled(user, uint8(slot), mSlot.currentCycle, block.timestamp);

        // 3. Two-Stage Tier Escalation (Stage 2):
        // When completing any slot < TOTAL_SLOTS, the next slot activates live,
        // and P4 and P5 from this completed cycle seed Level 1 (P1 & P2) of the next slot!
        if (slot < TOTAL_SLOTS) {
            uint256 nextSlot = slot + 1;
            MatrixSlot storage nextMSlot = userSlots[user][nextSlot];
            if (!nextMSlot.isUnlocked) {
                nextMSlot.isUnlocked = true;
                nextMSlot.currentCycle = 1;
                nextMSlot.filledNodes = 0;
            }
            nextMSlot.isLive = true;

            // Dynamic Follow-Me Placement:
            // This upgraded user is placed into their sponsor's nextSlot board!
            // The first team members to upgrade dynamically fill Seat 1, Seat 2, Seat 3...
            address sponsorAddr = registry.getSponsor(user);
            if (sponsorAddr != address(0) && sponsorAddr != user && sponsorAddr != owner()) {
                _placeUserInMatrix(user, nextSlot, baseSlotCost);
            }

            emit SlotAutoActivated(user, uint8(slot), uint8(nextSlot), block.timestamp);
            emit SlotActivatedForEarning(user, uint8(nextSlot), block.timestamp);
        } else if (slot == TOTAL_SLOTS) {
            // 4. Global Cycle 2 Escalation:
            // When Slot 12 completes all 14 positions, user ascends to Cycle 2!
            // Slot 1 is prepared for Cycle 2 team placements.
            userSlots[user][1].currentCycle++;
            userSlots[user][1].filledNodes = 0;
            for (uint256 i = 0; i < TREE_NODES; i++) {
                userSlots[user][1].nodes[i] = address(0);
            }
            emit MatrixRecycled(user, 1, userSlots[user][1].currentCycle, block.timestamp);
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
    function getSlotNodesDetail(address user, uint256 slot) external view returns (
        address[14] memory nodeAddresses,
        uint32[14]  memory nodeCodes,
        uint256[14] memory nodeMemberIds,
        address[14] memory payoutRecipients,
        uint8[14]   memory payoutTypes
    ) {
        MatrixSlot storage m = userSlots[user][slot];
        nodeAddresses    = m.nodes;
        payoutRecipients = m.payoutRecipients;
        payoutTypes      = m.payoutTypes;
        for (uint256 i = 0; i < TREE_NODES; i++) {
            address nodeAddr = m.nodes[i];
            if (nodeAddr != address(0)) {
                nodeCodes[i]     = registry.getCodeByUser(nodeAddr);
                nodeMemberIds[i] = registry.getUserId(nodeAddr);
            }
        }
    }

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
    function routePoolDeposit(uint256 amount) external payable;
}
