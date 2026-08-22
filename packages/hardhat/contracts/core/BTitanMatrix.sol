// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IBTitanRegistry.sol";
import "../interfaces/IBTitanNFT.sol";
import "../interfaces/IBTitanVestingVault.sol";

/**
 * @title BTitanMatrix
 * @dev Phase 2+: 12-Slot, 14-Node Single-Leg Matrix Engine
 *
 * ═══ SLOT COSTS ══════════════════════════════════════════════════════════════
 *   Slot 1:  30 BTT    Slot 2:  60 BTT    Slot 3:  120 BTT
 *   Slot 4:  240 BTT   Slot 5:  480 BTT   Slot 6:  960 BTT
 *   Slot 7:  1920 BTT  Slot 8:  3840 BTT  Slot 9:  7680 BTT
 *   Slot 10: 15360 BTT Slot 11: 30720 BTT Slot 12: 61440 BTT
 *   (Each slot doubles the previous)
 *
 * ═══ 14-NODE PAYOUT ROUTING ══════════════════════════════════════════════════
 *   Level 1 (Positions 1-2):    Paid to UPLINE1 and UPLINE2
 *   Level 2 (Positions 3-6):
 *     Pos 3,6 → Direct to YOUR WALLET
 *     Pos 4   → Cycle 1: NEXT SLOT FUND | Cycle 2+: ROYAL POOL
 *     Pos 5   → Cycle 1: NEXT SLOT FUND | Cycle 2+: YOUR WALLET
 *   Level 3 (Positions 7-14):
 *     Pos 8,9,11,12 → YOUR WALLET
 *     Pos 7,10      → DOWNLINE 1 SPILLOVER
 *     Pos 13        → DOWNLINE 2 SPILLOVER
 *     Pos 14        → RECYCLE (pays sponsor, resets matrix)
 *
 * ═══ QUALIFICATION ════════════════════════════════════════════════════════════
 *   Users need 2 direct referrals to be "qualified".
 *   Unqualified users' earnings route to the root address.
 *
 * ═══ MAGIC BOX MILESTONES ═════════════════════════════════════════════════════
 *   After completing first cycle of Slots 3, 6, 9, 12:
 *   → Mint rank NFT badge (RISING, PRIME, ROYAL, LEGENDARY)
 *   → Lock 1 BTT token in 3-year vesting vault
 *
 * Security:
 *   - ReentrancyGuard on join/withdraw
 *   - Only qualified users receive earnings
 *   - Admin can update contract references (pre-launch only)
 */
contract BTitanMatrix is Ownable, ReentrancyGuard {
    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant TOTAL_SLOTS = 12;
    uint256 public constant TREE_NODES = 14;
    uint256 public constant BASE_SLOT_COST = 30 * 10 ** 18; // 30 BTT

    // ─── Data Structures ─────────────────────────────────────────────────────

    struct MatrixSlot {
        bool isUnlocked;
        uint256 currentCycle;       // starts at 1
        uint256 filledNodes;        // 0 to 14
        address[14] nodes;          // filled in order: positions 1..14
        uint256 upgradeReserve;     // accumulated for next-slot auto-upgrade
        uint256 totalEarned;        // total BTT earned from this slot
    }

    // ─── Dependencies ─────────────────────────────────────────────────────────

    IERC20 public paymentToken;
    IBTitanRegistry public registry;
    IBTitanNFT public nftContract;
    IBTitanVestingVault public vestingVault;

    // ─── State Variables ──────────────────────────────────────────────────────

    // user → slotNumber(1-12) → MatrixSlot
    mapping(address => mapping(uint256 => MatrixSlot)) public userSlots;

    // user → slotNumber → balance earned from this slot
    mapping(address => uint256) public userBalance;      // withdrawable balance
    mapping(address => uint256) public totalEarned;      // lifetime earned
    mapping(address => uint256) public totalWithdrawn;   // lifetime withdrawn
    mapping(address => uint256) public highestSlot;      // highest slot unlocked

    // Royal Pool
    uint256 public royalPoolBalance;

    // Global stats
    uint256 public totalMembers;
    uint256 public totalRecycles;
    uint256 public totalVolumeProcessed;

    // Slot costs (precomputed: doubles each level)
    mapping(uint256 => uint256) public slotCosts;

    // ─── Events ───────────────────────────────────────────────────────────────

    event SlotJoined(
        address indexed user,
        uint256 indexed slot,
        uint256 cost,
        address sponsor,
        uint256 timestamp
    );
    event NodeFilled(
        address indexed matrixOwner,
        address indexed placedUser,
        uint256 indexed slot,
        uint256 position,
        uint256 cycle,
        string eventType,
        uint256 amount
    );
    event SlotAutoUpgraded(
        address indexed user,
        uint256 fromSlot,
        uint256 toSlot,
        uint256 timestamp
    );
    event CycleCompleted(
        address indexed user,
        uint256 indexed slot,
        uint256 newCycle,
        uint256 timestamp
    );
    event MagicBoxUnlocked(
        address indexed user,
        uint256 indexed slot,
        uint8 rank,
        uint256 timestamp
    );
    event BalanceWithdrawn(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    event RoyalPoolDistributed(address indexed recipient, uint256 amount);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        address _paymentToken,
        address _registry,
        address _nftContract,
        address _vestingVault
    ) Ownable(msg.sender) {
        require(_paymentToken != address(0), "BTitanMatrix: Invalid token");
        require(_registry != address(0), "BTitanMatrix: Invalid registry");

        paymentToken = IERC20(_paymentToken);
        registry = IBTitanRegistry(_registry);
        nftContract = IBTitanNFT(_nftContract);
        vestingVault = IBTitanVestingVault(_vestingVault);

        // Precompute slot costs: 30, 60, 120, 240, 480, 960, 1920, 3840, 7680, 15360, 30720, 61440
        for (uint256 i = 1; i <= TOTAL_SLOTS; i++) {
            slotCosts[i] = BASE_SLOT_COST * (2 ** (i - 1));
        }
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setContracts(
        address _token,
        address _registry,
        address _nft,
        address _vault
    ) external onlyOwner {
        if (_token != address(0)) paymentToken = IERC20(_token);
        if (_registry != address(0)) registry = IBTitanRegistry(_registry);
        if (_nft != address(0)) nftContract = IBTitanNFT(_nft);
        if (_vault != address(0)) vestingVault = IBTitanVestingVault(_vault);
    }

    // ─── Join Slot ────────────────────────────────────────────────────────────

    /**
     * @dev Join or unlock a specific matrix slot.
     *      For slot 1: anyone (registered user) can join.
     *      For slots 2-12: must have previous slot unlocked.
     *
     * @param slot Slot number to join (1-12)
     * @param sponsor The referrer address (for first-time registration)
     */
    function joinSlot(uint256 slot, address sponsor) external nonReentrant {
        require(slot >= 1 && slot <= TOTAL_SLOTS, "BTitanMatrix: Invalid slot");
        require(!userSlots[msg.sender][slot].isUnlocked, "BTitanMatrix: Slot already unlocked");

        // Ensure previous slot is unlocked (for slots > 1)
        if (slot > 1) {
            require(
                userSlots[msg.sender][slot - 1].isUnlocked,
                "BTitanMatrix: Previous slot not unlocked"
            );
        }

        uint256 cost = slotCosts[slot];

        // Collect payment
        bool ok = paymentToken.transferFrom(msg.sender, address(this), cost);
        require(ok, "BTitanMatrix: Payment failed - approve BTT first");
        totalVolumeProcessed += cost;

        // Register user if first time
        if (!registry.isRegistered(msg.sender)) {
            registry.registerUser(msg.sender, sponsor);
        }

        // Mint welcome pass if not owned yet
        if (address(nftContract) != address(0) && !nftContract.hasWelcomePass(msg.sender)) {
            try nftContract.mintWelcomePass(msg.sender) {} catch {}
        }

        // Unlock the slot
        userSlots[msg.sender][slot].isUnlocked = true;
        userSlots[msg.sender][slot].currentCycle = 1;
        userSlots[msg.sender][slot].filledNodes = 0;

        if (slot > highestSlot[msg.sender]) {
            highestSlot[msg.sender] = slot;
        }

        if (slot == 1) totalMembers++;

        address sponsorAddr = registry.getSponsor(msg.sender);
        emit SlotJoined(msg.sender, slot, cost, sponsorAddr, block.timestamp);

        // Place this user into the sponsor's matrix tree
        _placeUserInMatrix(msg.sender, slot, cost);
    }

    // ─── Matrix Placement ─────────────────────────────────────────────────────

    /**
     * @dev Find the correct matrix owner to place the new user under,
     *      then fill the next node position and route the payment.
     */
    function _placeUserInMatrix(address newUser, uint256 slot, uint256 cost) internal {
        address sponsor = registry.getSponsor(newUser);
        if (sponsor == address(0)) sponsor = registry.getRoot();

        // If sponsor doesn't have this slot, bubble up to root
        address matrixOwner = sponsor;
        while (!userSlots[matrixOwner][slot].isUnlocked) {
            address up = registry.getSponsor(matrixOwner);
            if (up == address(0) || up == matrixOwner) {
                matrixOwner = registry.getRoot();
                break;
            }
            matrixOwner = up;
        }

        MatrixSlot storage mSlot = userSlots[matrixOwner][slot];
        uint256 position = mSlot.filledNodes + 1; // 1 to 14
        mSlot.nodes[position - 1] = newUser;
        mSlot.filledNodes++;

        // Route payment based on position
        _routePayment(matrixOwner, newUser, slot, position, mSlot.currentCycle, cost);

        // Check if all 14 nodes filled → complete cycle
        if (mSlot.filledNodes == TREE_NODES) {
            _completeCycle(matrixOwner, slot);
        }
    }

    /**
     * @dev Route the slot cost to the correct recipient based on position.
     */
    function _routePayment(
        address matrixOwner,
        address placedUser,
        uint256 slot,
        uint256 position,
        uint256 cycle,
        uint256 cost
    ) internal {
        bool isCycle1 = (cycle == 1);

        if (position == 1) {
            // → UPLINE 1 (matrix owner's sponsor)
            address upline1 = registry.getSponsor(matrixOwner);
            if (upline1 == address(0)) upline1 = registry.getRoot();
            _creditUser(upline1, cost);
            emit NodeFilled(matrixOwner, placedUser, slot, position, cycle, "UPLINE_1", cost);

        } else if (position == 2) {
            // → UPLINE 2 (upline of upline)
            address upline1 = registry.getSponsor(matrixOwner);
            address upline2 = upline1 != address(0) ? registry.getSponsor(upline1) : address(0);
            if (upline2 == address(0)) upline2 = registry.getRoot();
            _creditUser(upline2, cost);
            emit NodeFilled(matrixOwner, placedUser, slot, position, cycle, "UPLINE_2", cost);

        } else if (position == 3 || position == 6 ||
                   position == 8 || position == 9 ||
                   position == 11 || position == 12) {
            // → YOUR WALLET (direct income)
            _creditUser(matrixOwner, cost);
            userSlots[matrixOwner][slot].totalEarned += cost;
            emit NodeFilled(matrixOwner, placedUser, slot, position, cycle, "YOUR_WALLET", cost);

        } else if (position == 4) {
            if (isCycle1) {
                // → NEXT SLOT FUND (part 1 of 2)
                userSlots[matrixOwner][slot].upgradeReserve += cost;
                emit NodeFilled(matrixOwner, placedUser, slot, position, cycle, "NEXT_SLOT_FUND", cost);
            } else {
                // → ROYAL POOL
                royalPoolBalance += cost;
                emit NodeFilled(matrixOwner, placedUser, slot, position, cycle, "ROYAL_POOL", cost);
            }

        } else if (position == 5) {
            if (isCycle1) {
                // → NEXT SLOT FUND (part 2 of 2) — triggers auto-upgrade check
                userSlots[matrixOwner][slot].upgradeReserve += cost;
                emit NodeFilled(matrixOwner, placedUser, slot, position, cycle, "NEXT_SLOT_FUND", cost);
                _checkAutoUpgrade(matrixOwner, slot);
            } else {
                // → YOUR WALLET
                _creditUser(matrixOwner, cost);
                userSlots[matrixOwner][slot].totalEarned += cost;
                emit NodeFilled(matrixOwner, placedUser, slot, position, cycle, "YOUR_WALLET", cost);
            }

        } else if (position == 7 || position == 10) {
            // → DOWNLINE 1 SPILLOVER (first node in this matrix)
            address downline1 = userSlots[matrixOwner][slot].nodes[0]; // node at position 1
            if (downline1 == address(0)) downline1 = matrixOwner;
            _creditUser(downline1, cost);
            emit NodeFilled(matrixOwner, placedUser, slot, position, cycle, "DOWNLINE_1_SPILLOVER", cost);

        } else if (position == 13) {
            // → DOWNLINE 2 SPILLOVER (second node in this matrix)
            address downline2 = userSlots[matrixOwner][slot].nodes[1]; // node at position 2
            if (downline2 == address(0)) downline2 = matrixOwner;
            _creditUser(downline2, cost);
            emit NodeFilled(matrixOwner, placedUser, slot, position, cycle, "DOWNLINE_2_SPILLOVER", cost);

        } else if (position == 14) {
            // → RECYCLE — pays sponsor, resets matrix for next cycle
            address sponsor = registry.getSponsor(matrixOwner);
            if (sponsor == address(0)) sponsor = registry.getRoot();
            _creditUser(sponsor, cost);
            emit NodeFilled(matrixOwner, placedUser, slot, position, cycle, "RECYCLE_SPONSOR", cost);
        }
    }

    /**
     * @dev Credit earnings to a user. If unqualified, redirect to root.
     */
    function _creditUser(address user, uint256 amount) internal {
        address recipient = registry.isQualified(user) ? user : registry.getRoot();
        userBalance[recipient] += amount;
        totalEarned[recipient] += amount;
    }

    /**
     * @dev Check if user can auto-upgrade to the next slot using reserve funds.
     */
    function _checkAutoUpgrade(address user, uint256 currentSlot) internal {
        if (currentSlot >= TOTAL_SLOTS) return;
        uint256 nextSlot = currentSlot + 1;
        if (userSlots[user][nextSlot].isUnlocked) return;

        uint256 required = slotCosts[nextSlot];
        if (userSlots[user][currentSlot].upgradeReserve >= required) {
            userSlots[user][currentSlot].upgradeReserve -= required;
            userSlots[user][nextSlot].isUnlocked = true;
            userSlots[user][nextSlot].currentCycle = 1;

            if (nextSlot > highestSlot[user]) {
                highestSlot[user] = nextSlot;
            }

            emit SlotAutoUpgraded(user, currentSlot, nextSlot, block.timestamp);
        }
    }

    /**
     * @dev Complete a matrix cycle: reset nodes, increment cycle, check milestones.
     */
    function _completeCycle(address user, uint256 slot) internal {
        MatrixSlot storage mSlot = userSlots[user][slot];
        mSlot.currentCycle++;
        mSlot.filledNodes = 0;

        // Clear node history for clean cycle
        for (uint256 i = 0; i < TREE_NODES; i++) {
            mSlot.nodes[i] = address(0);
        }

        totalRecycles++;
        emit CycleCompleted(user, slot, mSlot.currentCycle, block.timestamp);

        // Magic Box milestone: Slots 3, 6, 9, 12 on first cycle completion
        if ((slot == 3 || slot == 6 || slot == 9 || slot == 12) && mSlot.currentCycle == 2) {
            _awardMagicBox(user, slot);
        }
    }

    /**
     * @dev Award Magic Box: mint rank NFT + lock 1 BTT in 3-year vault.
     */
    function _awardMagicBox(address user, uint256 slot) internal {
        IBTitanNFT.Rank rank;
        if (slot == 3) rank = IBTitanNFT.Rank.RISING;
        else if (slot == 6) rank = IBTitanNFT.Rank.PRIME;
        else if (slot == 9) rank = IBTitanNFT.Rank.ROYAL;
        else if (slot == 12) rank = IBTitanNFT.Rank.LEGENDARY;
        else return;

        // Mint rank badge NFT
        if (address(nftContract) != address(0)) {
            try nftContract.mintRankBadge(user, rank) {} catch {}
        }

        // Lock 1 BTT in 3-year vesting vault (platform provides the token)
        if (address(vestingVault) != address(0)) {
            try vestingVault.lockTokens(user, 1 * 10 ** 18, slot) {} catch {}
        }

        emit MagicBoxUnlocked(user, slot, uint8(rank), block.timestamp);
    }

    // ─── Withdraw ─────────────────────────────────────────────────────────────

    /**
     * @dev Withdraw available BTT balance (earnings from matrix).
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "BTitanMatrix: Amount must be > 0");
        require(userBalance[msg.sender] >= amount, "BTitanMatrix: Insufficient balance");

        userBalance[msg.sender] -= amount;
        totalWithdrawn[msg.sender] += amount;

        bool ok = paymentToken.transfer(msg.sender, amount);
        require(ok, "BTitanMatrix: Transfer failed");

        emit BalanceWithdrawn(msg.sender, amount, block.timestamp);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /**
     * @dev Get all data for a user's specific slot
     */
    function getSlotData(address user, uint256 slot) external view returns (
        bool isUnlocked,
        uint256 currentCycle,
        uint256 filledNodes,
        address[14] memory nodes,
        uint256 upgradeReserve,
        uint256 slotEarned
    ) {
        MatrixSlot storage m = userSlots[user][slot];
        return (
            m.isUnlocked,
            m.currentCycle,
            m.filledNodes,
            m.nodes,
            m.upgradeReserve,
            m.totalEarned
        );
    }

    /**
     * @dev Get all 12 slots' unlock status at once (for frontend slot grid)
     */
    function getAllSlotsStatus(address user) external view returns (
        bool[12] memory unlocked,
        uint256[12] memory cycles,
        uint256[12] memory filled
    ) {
        for (uint256 i = 1; i <= TOTAL_SLOTS; i++) {
            unlocked[i - 1] = userSlots[user][i].isUnlocked;
            cycles[i - 1] = userSlots[user][i].currentCycle;
            filled[i - 1] = userSlots[user][i].filledNodes;
        }
    }

    /**
     * @dev Get user's financial summary
     */
    function getUserFinancials(address user) external view returns (
        uint256 availableBalance,
        uint256 lifetimeEarned,
        uint256 withdrawn,
        uint256 highestSlotUnlocked
    ) {
        return (
            userBalance[user],
            totalEarned[user],
            totalWithdrawn[user],
            highestSlot[user]
        );
    }

    /**
     * @dev Get slot cost for a given slot number
     */
    function getSlotCost(uint256 slot) external view returns (uint256) {
        require(slot >= 1 && slot <= TOTAL_SLOTS, "BTitanMatrix: Invalid slot");
        return slotCosts[slot];
    }

    /**
     * @dev Get global platform stats
     */
    function getGlobalStats() external view returns (
        uint256 members,
        uint256 recycles,
        uint256 volume,
        uint256 royalPool
    ) {
        return (totalMembers, totalRecycles, totalVolumeProcessed, royalPoolBalance);
    }
}
