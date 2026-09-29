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
 * === SLOT COSTS (formula: 30 x 2^(N-1)) =====================================
 *   Slot 1:  30     Slot 2:  60     Slot 3:  120    Slot 4:  240
 *   Slot 5:  480    Slot 6:  960    Slot 7:  1920   Slot 8:  3840
 *   Slot 9:  7680   Slot 10: 15360  Slot 11: 30720  Slot 12: 61440
 *
 * === 14-NODE PAYOUT ROUTING ==================================================
 *  ALL CYCLES:
 *   P1  -> Upline 1 (immediate eligible upline above matrix owner)
 *   P2  -> Upline 2 (upline's upline)
 *   P3  -> Slot Owner (YOU)
 *   P4  -> Protocol Pools via EquoraVault (35% DAO, 40% Salary, 15% Rewards, 10% Box)
 *   P5  -> Protocol Pools via EquoraVault
 *   P6  -> Slot Owner (YOU)
 *   P7  -> Downline 1 (spillover to first direct under you, if qualified)
 *   P8  -> Slot Owner (YOU)
 *   P9  -> Slot Owner (YOU)
 *   P10 -> Downline 1 (spillover)
 *   P11 -> Slot Owner (YOU)
 *   P12 -> Slot Owner (YOU)
 *   P13 -> Downline 2 (spillover to second direct under you, if qualified)
 *   P14 -> Protocol Pools via EquoraVault
 *
 * Per-slot breakdown for Slot 1 (cost = 30 TROB per node, 14 nodes = 420 TROB):
 *   P1 + P2            = 60  TROB → Immediate Upline (2 × 30)
 *   P3+P6+P8+P9+P11+P12= 180 TROB → YOU (6 × 30)
 *   P4+P5+P14          = 90  TROB → Protocol Pools (3 × 30)
 *   P7+P10             = 60  TROB → Downline 1 (2 × 30)
 *   P13                = 30  TROB → Downline 2 (1 × 30)
 *   Total              = 420 TROB
 *
 * === QUALIFICATION ===========================================================
 *   isQualified = directReferrals >= 2
 *   Unqualified fallback = Matrix Owner (never root wallet)
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
    function daoCompleted() external view returns (bool);
}

contract EquoraMatrix is Ownable, ReentrancyGuard {

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    uint256 public constant TOTAL_SLOTS      = 12;
    uint256 public constant TREE_NODES       = 14;
    uint256 public constant BASE_SLOT_COST   = 30 * 10 ** 18;
    uint256 public constant MAX_UPLINE_DEPTH = 12;

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
    event SlotAutoActivated(
        address indexed user,
        uint8   indexed fromSlot,
        uint8   indexed activatedSlot,
        uint256 timestamp
    );

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(
        address _paymentToken,
        address _registry,
        address _nftContract
    ) Ownable(msg.sender) {
        require(_paymentToken != address(0), "EquoraMatrix: invalid token");
        require(_registry     != address(0), "EquoraMatrix: invalid registry");

        paymentToken = IERC20(_paymentToken);
        registry     = IEquoraRegistry(_registry);
        nftContract  = IEquoraNFT(_nftContract);

        // Precompute slot costs: 30, 60, 120, 240 ... 61440
        for (uint256 i = 1; i <= TOTAL_SLOTS; i++) {
            slotCosts[i] = BASE_SLOT_COST * (2 ** (i - 1));
        }
    }

    // -------------------------------------------------------------------------
    // Admin (only callable before renounceOwnership)
    // -------------------------------------------------------------------------

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
     * @dev Check if the matrix is open for retail enrollment.
     */
    function isMatrixOpen() public view returns (bool) {
        if (matrixLaunchTime > 0) {
            return block.timestamp >= matrixLaunchTime;
        }
        return true;
    }

    // -------------------------------------------------------------------------
    // Join Slot
    // -------------------------------------------------------------------------

    /**
     * @dev Join or unlock a specific matrix slot.
     *      Slot 1: any registered user (2 direct referrals required via Registry).
     *      Slots 2-12: previous slot must be unlocked.
     */
    function joinSlot(uint256 slot, address sponsor) external nonReentrant {
        require(isMatrixOpen(), "EquoraMatrix: matrix locked during 21-day Genesis DAO phase");
        require(slot >= 1 && slot <= TOTAL_SLOTS,         "EquoraMatrix: invalid slot");
        require(slot == 1,                                "EquoraMatrix: only slot 1 can be joined directly; higher slots are auto-unlocked");
        require(!userSlots[msg.sender][slot].isUnlocked,  "EquoraMatrix: already unlocked");

        uint256 cost = slotCosts[slot];

        bool ok = paymentToken.transferFrom(msg.sender, address(this), cost);
        require(ok, "EquoraMatrix: payment failed - approve token first");

        totalVolumeProcessed += cost;

        // Register user on first join (slot 1)
        if (!registry.isRegistered(msg.sender)) {
            registry.registerUser(msg.sender, sponsor);
        }

        // Welcome pass NFT on slot 1
        if (slot == 1 && address(nftContract) != address(0) && !nftContract.hasWelcomePass(msg.sender)) {
            try nftContract.mintWelcomePass(msg.sender) {} catch {}
        }

        // Unlock slot
        userSlots[msg.sender][slot].isUnlocked   = true;
        userSlots[msg.sender][slot].currentCycle = 1;
        userSlots[msg.sender][slot].filledNodes  = 0;

        if (slot > highestSlot[msg.sender]) highestSlot[msg.sender] = slot;
        if (slot == 1) totalMembers++;

        address sponsorAddr = registry.getSponsor(msg.sender);
        emit SlotJoined(msg.sender, slot, cost, sponsorAddr, block.timestamp);

        _placeUserInMatrix(msg.sender, slot, cost);
    }

    // -------------------------------------------------------------------------
    // Matrix Placement
    // -------------------------------------------------------------------------

    /**
     * @dev Resolves the genesis root matrix owner.
     *      If Genesis DAO is connected and has members, the LAST member becomes the Root Matrix Owner!
     *      Otherwise falls back to registry.getRoot().
     */
    function _getRootMatrixOwner() internal view returns (address) {
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
     */
    function _placeUserInMatrix(address newUser, uint256 slot, uint256 cost) internal {
        address rootOwner = _getRootMatrixOwner();

        address sponsor = registry.getSponsor(newUser);
        if (sponsor == address(0)) sponsor = rootOwner;

        address matrixOwner = sponsor;
        uint256 depth = 0;
        while (!userSlots[matrixOwner][slot].isUnlocked && depth < MAX_UPLINE_DEPTH) {
            address up = registry.getSponsor(matrixOwner);
            if (up == address(0) || up == matrixOwner) {
                matrixOwner = rootOwner;
                break;
            }
            matrixOwner = up;
            depth++;
        }

        if (!userSlots[matrixOwner][slot].isUnlocked) {
            matrixOwner = rootOwner;
        }

        // Auto-activate slot for root matrix owner if not yet unlocked
        if (matrixOwner == rootOwner && !userSlots[matrixOwner][slot].isUnlocked) {
            userSlots[matrixOwner][slot].isUnlocked   = true;
            userSlots[matrixOwner][slot].currentCycle = 1;
            userSlots[matrixOwner][slot].filledNodes  = 0;
            if (slot > highestSlot[matrixOwner]) {
                highestSlot[matrixOwner] = slot;
            }
            emit SlotJoined(matrixOwner, slot, 0, address(0), block.timestamp);
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
     *  P1  → Upline 1
     *  P2  → Upline 2
     *  P3, P6, P8, P9, P11, P12 → Slot Owner (direct income)
     *  P4, P5, P14 → EquoraVault (Protocol Pools: 35% DAO, 40% Salary, 15% Rewards, 10% Box)
     *  P7, P10 → Downline 1 (if qualified), else Owner
     *  P13 → Downline 2 (if qualified), else Owner
     *
     *  INVARIANT: every wei of cost is distributed — no silent sinks.
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
            if (upline1 == address(0)) upline1 = _getRootMatrixOwner();
            _creditUser(upline1, matrixOwner, cost);
            emit DistributionExecuted(upline1, cost, PayoutType.UPLINE_1, s, cycle, p);

        } else if (position == 2) {
            // P2 → Upline 2
            address up1    = registry.getSponsor(matrixOwner);
            address upline2 = (up1 != address(0)) ? registry.getSponsor(up1) : address(0);
            if (upline2 == address(0)) upline2 = _getRootMatrixOwner();
            _creditUser(upline2, matrixOwner, cost);
            emit DistributionExecuted(upline2, cost, PayoutType.UPLINE_2, s, cycle, p);

        } else if (
            position == 3  || position == 6  ||
            position == 8  || position == 9  ||
            position == 11 || position == 12
        ) {
            // P3, P6, P8, P9, P11, P12 → Owner direct income
            _creditOwner(matrixOwner, slot, cost);
            emit DistributionExecuted(matrixOwner, cost, PayoutType.OWNER_DIRECT, s, cycle, p);

        } else if (position == 4 || position == 5 || position == 14) {
            // P4, P5, P14 → Protocol Pools via EquoraVault (35% Ecosystem & DAO Pool, 40% Salary Pool, 15% Level Rewards, 10% Magic Blind Box)
            _forwardToVault(matrixOwner, cost);
            emit DistributionExecuted(vaultContract, cost, PayoutType.PROTOCOL_POOL, s, cycle, p);
            emit ProtocolPoolFunded(matrixOwner, cost, s, cycle, p, block.timestamp);

            // Re-topup Rule (Flow #3): 4th and 5th ID fund goes to pools automatically
            // and simultaneously activates next slot's top ID of user
            if (position == 5 && slot < TOTAL_SLOTS) {
                uint256 nextSlot = slot + 1;
                if (!userSlots[matrixOwner][nextSlot].isUnlocked) {
                    userSlots[matrixOwner][nextSlot].isUnlocked   = true;
                    userSlots[matrixOwner][nextSlot].currentCycle = 1;
                    userSlots[matrixOwner][nextSlot].filledNodes  = 0;
                    if (nextSlot > highestSlot[matrixOwner]) {
                        highestSlot[matrixOwner] = nextSlot;
                    }
                    emit SlotAutoActivated(matrixOwner, s, uint8(nextSlot), block.timestamp);
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

        if (dl1 != address(0) && registry.isQualified(dl1)) {
            p7PaidRecipient[matrixOwner][slot][cycle] = dl1;
            _pushMatrixPayment(dl1, cost);
            emit SpilloverResolved(matrixOwner, dl1, 7, false);
            emit DistributionExecuted(dl1, cost, PayoutType.SPILLOVER_DOWNLINE1, s, cycle, 7);
        } else if (dl2 != address(0) && registry.isQualified(dl2)) {
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

        if (dl2 != address(0) && registry.isQualified(dl2) && dl2 != alreadyPaid) {
            _pushMatrixPayment(dl2, cost);
            emit SpilloverResolved(matrixOwner, dl2, 10, false);
            emit DistributionExecuted(dl2, cost, PayoutType.SPILLOVER_DOWNLINE2, s, cycle, 10);
        } else if (dl1 != address(0) && registry.isQualified(dl1) && dl1 != alreadyPaid) {
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
            if (c != address(0) && registry.isQualified(c) && c != matrixOwner && c != dl1 && c != dl2) {
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
            if (c != address(0) && registry.isQualified(c) && c != matrixOwner && c != dl1 && c != dl2) {
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
     * @dev Push matrix payment directly to user's wallet via paymentToken.transfer.
     *      Recipients receive their earnings automatically on-chain with zero gas fees.
     *      Anti-griefing: if direct transfer fails, held in userBalance for manual withdrawal.
     */
    function _pushMatrixPayment(address recipient, uint256 amount) internal {
        if (recipient == address(0) || amount == 0) return;
        totalEarned[recipient] += amount;

        bool ok = false;
        try paymentToken.transfer(recipient, amount) returns (bool res) {
            ok = res;
        } catch {}

        if (!ok) {
            userBalance[recipient] += amount;
        }
    }

    /**
     * @dev Credit user balance with qualification check.
     *      Unqualified recipient → reroutes directly to Matrix Owner.
     *      Root Matrix Owner is always considered qualified.
     */
    function _creditUser(address user, address fallbackOwner, uint256 amount) internal {
        if (registry.isQualified(user) || user == _getRootMatrixOwner()) {
            _pushMatrixPayment(user, amount);
        } else {
            // Ineligible / Did not meet referral criteria -> fallback to matrixOwner (never root)
            _pushMatrixPayment(fallbackOwner, amount);
        }
    }

    /**
     * @dev Credit matrix owner's balance and track per-slot earnings.
     */
    function _creditOwner(address matrixOwner, uint256 slot, uint256 amount) internal {
        userSlots[matrixOwner][slot].totalEarned += amount;
        _pushMatrixPayment(matrixOwner, amount);
    }

    /**
     * @dev Forward P4/P5/P14 funds to EquoraVault for protocol pool distribution.
     *      The vault routes: 35% Ecosystem & DAO Pool, 40% Salary Pool, 15% Level Rewards, 10% Magic Blind Box.
     *      If vault is not configured (pre-wiring), funds credit to owner as safety.
     */
    function _forwardToVault(address matrixOwner, uint256 amount) internal {
        totalPoolForwarded += amount;

        if (vaultContract == address(0)) {
            // Safety fallback before wiring: push to matrix owner temporarily
            _pushMatrixPayment(matrixOwner, amount);
            return;
        }

        bool ok = paymentToken.transfer(vaultContract, amount);
        require(ok, "EquoraMatrix: vault transfer failed");

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

        // 3. Milestone: Slots 3,6,9,12 on first cycle → mint Rank NFT
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

        bool ok = paymentToken.transfer(msg.sender, amount);
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
    ///      Vault splits: 35% Ecosystem & DAO Pool | 40% Salary Pool | 15% Level Rewards | 10% Magic Blind Box.
    function routePoolDeposit(uint256 amount) external;
}
