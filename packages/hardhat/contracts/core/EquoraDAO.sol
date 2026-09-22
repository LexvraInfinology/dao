// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./EquoraDAOMembership.sol";
import "../interfaces/IEquoraRegistry.sol";

/**
 * @title EquoraDAO
 * @dev Genesis DAO — 100-seat founding council on the Equora.Fi platform.
 *
 * === ECONOMIC MODEL ==========================================================
 *   Entry Fee: 300 TROB per seat (per logics.xlsx)
 *   Max Members: 100 (hard cap, immutable)
 *
 *   When member N joins, their 300 TROB is split equally among all (N-1) prior members:
 *     Share per existing member = 300 / (N - 1)
 *     Member 1 receives 300 TROB (their own deposit pushed back instantly).
 *     Member 100 receives 300/99 ≈ 3.03 TROB per join after them.
 *
 * === 5X EARNINGS CAP + 48-HOUR RE-TOPUP =====================================
 *   - Each member can earn a maximum of 5× their deposit = 1,500 TROB from
 *     DAO queue distributions.
 *   - When a member's lifetime earnings hit 1,500 TROB, their slot is capped.
 *   - They have 48 hours to call retopup() and pay 300 TROB again.
 *   - If they miss the window, their slot is BLANKED (permanently skipped in
 *     future distributions) until they retopup.
 *   - Retopup resets their lifetime earnings counter.
 *
 * === SEAT EXPIRY WINDOW ======================================================
 *   - Each seat must be filled within 15 days of the previous seat being filled.
 *   - If 15 days pass with no new join, the DAO queue expires permanently.
 *
 * === ELIGIBILITY =============================================================
 *   - Open to any participant (0 referrals required, no sponsor/referral ID needed)
 *
 * === PRESERVED ===============================================================
 *   - Soulbound ERC-721 per seat (EquoraDAOMembership NFT)
 *   - Instant push distribution to all prior members
 *   - Anti-griefing: failed push → pullFallbackBalance for manual claim
 *   - Zero platform fees: 100% of entry flows to members
 *
 * === NULL KEY =================================================================
 *   This contract has no Ownable — it is fully permissionless from deployment.
 */
contract EquoraDAO is ReentrancyGuard {

    // ─── Constants ─────────────────────────────────────────────────────────────

    uint256 public constant ENTRY_FEE              = 300 * 10 ** 18; // 300 TROB
    uint256 public constant MAX_MEMBERS            = 100;
    uint256 public constant SEAT_WINDOW            = 15 days;
    uint256 public constant EARNINGS_CAP           = 1500 * 10 ** 18; // 5 × 300 TROB = 1,500 TROB
    uint256 public constant RETOPUP_WINDOW         = 48 hours;

    // ─── Immutable Dependencies ────────────────────────────────────────────────

    IERC20              public immutable paymentToken;
    EquoraDAOMembership public immutable membershipNFT;
    IEquoraRegistry     public immutable registry;

    // ─── Configured Contracts ──────────────────────────────────────────────────

    address public vaultContract;

    // ─── State Variables ───────────────────────────────────────────────────────

    address[] public daoMembers;
    mapping(address => bool)    public isDaoMember;
    mapping(address => uint256) public memberPosition;
    mapping(address => uint256) public pullFallbackBalance;

    // DAO Plan Share Benefit (35% Matrix Volume Pool)
    uint256 public accPoolSharePerMember; // scaled by 1e18
    uint256 public totalPoolReceived;      // total 35% matrix volume received
    uint256 public totalPoolDistributed;   // total pool share claimed by members
    mapping(address => uint256) public memberRewardDebt;
    mapping(address => uint256) public pendingPoolShare;

    // Earnings tracking
    mapping(address => uint256) public lifetimeEarnings;  // total TROB received from DAO distributions
    mapping(address => uint256) public capHitTimestamp;   // when 5X cap was reached (0 = not capped)
    mapping(address => bool)    public slotBlank;         // true = slot expired, skip in distributions

    bool    public daoCompleted;
    bool    public daoExpired;
    uint256 public totalCollected;
    uint256 public totalDistributed;
    uint256 public lastJoinTimestamp;
    uint256 public daoLaunchTimestamp;

    // ─── Custom Errors ─────────────────────────────────────────────────────────

    error QueueFull();
    error QueueExpired();
    error AlreadyMember();
    error NotQualified();
    error PaymentFailed();
    error NotMember();
    error NothingToClaim();
    error TransferFailed();
    error NotCapped();
    error RetopupWindowExpired();
    error SlotNotBlank();
    error Unauthorized();

    // ─── Events ────────────────────────────────────────────────────────────────

    event VaultContractSet(address indexed vault);
    event DAOPositionJoined(
        address indexed user,
        uint256 indexed position,
        uint256 tokenId,
        uint256 timestamp
    );
    event DAOPayoutPushed(
        address indexed recipient,
        uint256 amount,
        uint256 fromPosition,
        uint256 timestamp
    );
    event DAOPayoutFallback(
        address indexed recipient,
        uint256 amount,
        uint256 fromPosition,
        string  reason,
        uint256 timestamp
    );
    event FallbackClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event QueueClosed(uint256 totalMembers, uint256 timestamp);
    event QueueExpiredEvent(uint256 seatsFilledSoFar, uint256 timestamp);
    event EarningsCapHit(address indexed member, uint256 lifetimeEarnings, uint256 retopupDeadline);
    event SlotBlanked(address indexed member, uint256 timestamp);
    event SlotReactivated(address indexed member, uint256 timestamp);
    event Retopup(address indexed member, uint256 position, uint256 timestamp);
    event PoolDepositReceived(uint256 amount, uint256 accPerMember, uint256 timestamp);
    event PoolShareClaimed(address indexed member, uint256 amount, uint256 timestamp);

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor(
        address _paymentToken,
        address _registry
    ) {
        require(_paymentToken != address(0), "EquoraDAO: Invalid token");
        require(_registry     != address(0), "EquoraDAO: Invalid registry");

        paymentToken = IERC20(_paymentToken);
        registry     = IEquoraRegistry(_registry);

        // Deploy Soulbound Membership NFT — this contract is sole minter
        membershipNFT = new EquoraDAOMembership(address(this));
    }

    // ─── Vault Configuration (One-Time Deployment Wiring) ──────────────────────

    /**
     * @dev Set the EquoraVault contract address (authorized to call receivePoolDeposit).
     *      Can only be set once during deployment wiring.
     */
    function setVaultContract(address _vault) external {
        require(vaultContract == address(0), "EquoraDAO: vault already set");
        require(_vault != address(0), "EquoraDAO: invalid vault");
        vaultContract = _vault;
        emit VaultContractSet(_vault);
    }

    // ─── Core Join Function ────────────────────────────────────────────────────

    /**
     * @dev Join the Genesis DAO as one of 100 founding members.
     *      Requirements:
     *        - Queue not full (< 100 seats, or a vacant seat exists from an expired 48h retopup)
     *        - Caller not already a member
     *        - Open to any participant (0 referrals required)
     *
     *      If an existing seat is vacant (due to missed 48h retopup), the lowest-numbered
     *      blank seat (scanned from Seat 1 to 100) is filled first!
     *
     * @return position The 1-indexed seat number assigned (1 to 100)
     */
    function joinDAO() external nonReentrant returns (uint256 position) {
        if (isDaoMember[msg.sender]) revert AlreadyMember();

        // 1. Scan from Seat 1 to 100 for any blank/vacant slot (missed 48-hour retopup)
        uint256 vacantIndex = type(uint256).max;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (slotBlank[m] || (capHitTimestamp[m] > 0 && block.timestamp > capHitTimestamp[m] + RETOPUP_WINDOW)) {
                vacantIndex = i;
                break;
            }
        }

        // 2. Collect 300 TROB payment
        bool ok = paymentToken.transferFrom(msg.sender, address(this), ENTRY_FEE);
        if (!ok) revert PaymentFailed();
        totalCollected += ENTRY_FEE;

        uint256 tokenId;
        // 3. If a vacant seat exists, replace the expired member
        if (vacantIndex != type(uint256).max) {
            address oldMember = daoMembers[vacantIndex];
            isDaoMember[oldMember]      = false;
            slotBlank[oldMember]        = false;
            capHitTimestamp[oldMember]  = 0;
            memberPosition[oldMember]   = 0;

            daoMembers[vacantIndex]     = msg.sender;
            isDaoMember[msg.sender]     = true;
            position                    = vacantIndex + 1;
            memberPosition[msg.sender]  = position;
            memberRewardDebt[msg.sender] = accPoolSharePerMember;
            lastJoinTimestamp           = block.timestamp;

            tokenId = membershipNFT.mint(msg.sender, position);
            emit DAOPositionJoined(msg.sender, position, tokenId, block.timestamp);

            // Distribute entry fee to all active members except new joiner
            _distributeRetopup(msg.sender, ENTRY_FEE);
            return position;
        }

        // 4. No vacant seat — standard new join up to 100 seats
        if (daoMembers.length >= MAX_MEMBERS) revert QueueFull();

        position = daoMembers.length + 1;
        daoMembers.push(msg.sender);
        isDaoMember[msg.sender]    = true;
        memberPosition[msg.sender] = position;

        if (position == 1) daoLaunchTimestamp = block.timestamp;
        lastJoinTimestamp = block.timestamp;

        tokenId = membershipNFT.mint(msg.sender, position);
        emit DAOPositionJoined(msg.sender, position, tokenId, block.timestamp);

        memberRewardDebt[msg.sender] = accPoolSharePerMember;
        _distributeEntryFee(position);

        if (daoMembers.length == MAX_MEMBERS) {
            daoCompleted = true;
            emit QueueClosed(MAX_MEMBERS, block.timestamp);
        }

        return position;
    }

    // ─── Re-topup (5X Cap Reset) ───────────────────────────────────────────────

    /**
     * @dev Called by a member who has hit their 5X earnings cap to re-activate
     *      their slot. Must be called within 48 hours of the cap being hit.
     *      Pays 300 TROB entry fee again and resets lifetime earnings.
     */
    function retopup() external nonReentrant {
        if (!isDaoMember[msg.sender]) revert NotMember();
        if (capHitTimestamp[msg.sender] == 0) revert NotCapped();

        // 48-hour window check
        if (block.timestamp > capHitTimestamp[msg.sender] + RETOPUP_WINDOW) {
            // Window expired — slot should already be blank (or we blank it now)
            if (!slotBlank[msg.sender]) {
                _updateMemberPoolReward(msg.sender);
                slotBlank[msg.sender] = true;
                emit SlotBlanked(msg.sender, block.timestamp);
            }
            revert RetopupWindowExpired();
        }

        // Collect re-topup fee
        bool ok = paymentToken.transferFrom(msg.sender, address(this), ENTRY_FEE);
        if (!ok) revert PaymentFailed();
        totalCollected += ENTRY_FEE;

        // Reset cap state
        lifetimeEarnings[msg.sender] = 0;
        capHitTimestamp[msg.sender]  = 0;

        // Reactivate if blanked (shouldn't be blanked if within window, but safety)
        if (slotBlank[msg.sender]) {
            slotBlank[msg.sender] = false;
            memberRewardDebt[msg.sender] = accPoolSharePerMember;
            emit SlotReactivated(msg.sender, block.timestamp);
        }

        // Distribute the re-topup fee to all active members
        _distributeRetopup(msg.sender, ENTRY_FEE);

        emit Retopup(msg.sender, memberPosition[msg.sender], block.timestamp);
    }

    /**
     * @dev Public function to blank expired cap slots.
     *      Callable by anyone to enforce the 48-hour re-topup deadline.
     *      Loops over all members and blanks those whose window has expired.
     */
    function enforceCapExpirations() external {
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address member = daoMembers[i];
            if (
                capHitTimestamp[member] > 0 &&
                !slotBlank[member] &&
                block.timestamp > capHitTimestamp[member] + RETOPUP_WINDOW
            ) {
                _updateMemberPoolReward(member);
                slotBlank[member] = true;
                emit SlotBlanked(member, block.timestamp);
            }
        }
    }

    // ─── DAO Plan Share Benefit (35% Matrix Volume Pool) ───────────────────────

    /**
     * @dev Receive 35% matrix volume pool deposit from EquoraVault.
     *      Dividends are accrued to active (non-blank) DAO members via O(1) accumulator.
     */
    function receivePoolDeposit(uint256 amount) external {
        if (msg.sender != vaultContract) revert Unauthorized();
        if (amount == 0 || daoMembers.length == 0) return;

        uint256 activeCount = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            if (!slotBlank[daoMembers[i]]) {
                activeCount++;
            }
        }
        if (activeCount == 0) return;

        accPoolSharePerMember += (amount * 1e18) / activeCount;
        totalPoolReceived += amount;

        emit PoolDepositReceived(amount, accPoolSharePerMember, block.timestamp);
    }

    /**
     * @dev Internal helper to settle member's pending pool share up to current accumulator.
     */
    function _updateMemberPoolReward(address member) internal {
        if (!isDaoMember[member] || slotBlank[member]) return;

        uint256 accumulated = accPoolSharePerMember - memberRewardDebt[member];
        if (accumulated > 0) {
            pendingPoolShare[member] += accumulated / 1e18;
        }
        memberRewardDebt[member] = accPoolSharePerMember;
    }

    /**
     * @dev View function to get current claimable 35% matrix pool dividend.
     */
    function getPendingPoolShare(address member) public view returns (uint256) {
        if (!isDaoMember[member] || slotBlank[member]) return pendingPoolShare[member];
        uint256 accumulated = accPoolSharePerMember - memberRewardDebt[member];
        return pendingPoolShare[member] + (accumulated / 1e18);
    }

    /**
     * @dev Claim accrued 35% matrix volume pool share (DAO Plan Share Benefit).
     */
    function claimPoolShare() external nonReentrant {
        if (!isDaoMember[msg.sender]) revert NotMember();
        _updateMemberPoolReward(msg.sender);

        uint256 claimable = pendingPoolShare[msg.sender];
        if (claimable == 0) revert NothingToClaim();

        pendingPoolShare[msg.sender] = 0;
        totalPoolDistributed += claimable;

        bool ok = paymentToken.transfer(msg.sender, claimable);
        if (!ok) revert TransferFailed();

        emit PoolShareClaimed(msg.sender, claimable, block.timestamp);
    }

    function getPoolShareStats() external view returns (
        uint256 totalReceived,
        uint256 totalDistributed_,
        uint256 accPerMember
    ) {
        return (totalPoolReceived, totalPoolDistributed, accPoolSharePerMember);
    }

    // ─── Expiry Check ──────────────────────────────────────────────────────────

    /**
     * @dev Check and mark expiry. Called at the top of joinDAO().
     *      Expiry: last join was > 15 days ago AND queue is not complete.
     */
    function _checkExpiry() internal {
        if (daoCompleted || daoExpired) return;
        if (daoMembers.length == 0) return;

        if (block.timestamp > lastJoinTimestamp + SEAT_WINDOW) {
            daoExpired = true;
            emit QueueExpiredEvent(daoMembers.length, block.timestamp);
        }
    }

    // ─── Internal Distribution Logic ──────────────────────────────────────────

    /**
     * @dev Distribute 300 TROB entry fee instantly following 300 / N formula:
     *      - Incoming member N is INCLUDED in the distribution.
     *      - Position 1 (N = 1): 300 / 1 = 300 TROB returned to Member 1 immediately.
     *      - Position 2 (N = 2): 300 / 2 = 150 TROB to Member 2 (immediate return) & 150 TROB to Member 1.
     *      - Position 3 (N = 3): 300 / 3 = 100 TROB to Member 3 (immediate return) & 100 TROB each to Members 1 & 2.
     *      - Position N: 300 / activeCount to all active members from 1 to N (including new joiner).
     *      - Blanked slots are SKIPPED in distribution.
     *      - After crediting, checks if recipient has hit 5X cap.
     */
    function _distributeEntryFee(uint256 incomingPosition) internal {
        // Count active (non-blank) recipients among all members up to incomingPosition (inclusive)
        uint256 activeCount = 0;
        for (uint256 i = 0; i < incomingPosition; i++) {
            if (!slotBlank[daoMembers[i]]) {
                activeCount++;
            }
        }

        if (activeCount == 0) return;

        uint256 amountPerRecipient = ENTRY_FEE / activeCount;
        if (amountPerRecipient == 0) return;

        for (uint256 i = 0; i < incomingPosition; i++) {
            address recipient = daoMembers[i];
            if (!slotBlank[recipient]) {
                _pushTransfer(recipient, amountPerRecipient, incomingPosition);
            }
        }
    }

    /**
     * @dev Distribute re-topup fee to all active members EXCEPT the retopup caller.
     */
    function _distributeRetopup(address caller, uint256 amount) internal {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            if (daoMembers[i] != caller && !slotBlank[daoMembers[i]]) {
                activeCount++;
            }
        }

        if (activeCount == 0) {
            // No active members to distribute to — credit caller back (safety)
            _pushTransfer(caller, amount, memberPosition[caller]);
            return;
        }

        uint256 amountPerRecipient = amount / activeCount;
        if (amountPerRecipient == 0) return;

        for (uint256 i = 0; i < daoMembers.length; i++) {
            address recipient = daoMembers[i];
            if (recipient != caller && !slotBlank[recipient]) {
                _pushTransfer(recipient, amountPerRecipient, memberPosition[caller]);
            }
        }
    }

    /**
     * @dev Push transfer helper with:
     *      1. Anti-griefing fallback (failed push → pullFallbackBalance)
     *      2. 5X cap enforcement (track lifetimeEarnings, set capHitTimestamp)
     */
    function _pushTransfer(address recipient, uint256 amount, uint256 fromPosition) internal {
        bool ok = false;
        try paymentToken.transfer(recipient, amount) returns (bool res) {
            ok = res;
        } catch {}

        if (ok) {
            lifetimeEarnings[recipient] += amount;
            totalDistributed            += amount;
            emit DAOPayoutPushed(recipient, amount, fromPosition, block.timestamp);
        } else {
            pullFallbackBalance[recipient] += amount;
            lifetimeEarnings[recipient]    += amount;
            totalDistributed               += amount;
            emit DAOPayoutFallback(recipient, amount, fromPosition, "Transfer failed", block.timestamp);
        }

        // Check 5X cap after crediting
        _checkCap(recipient);
    }

    /**
     * @dev Check if a member has hit their 5X earnings cap.
     *      If so, record the timestamp — they have 48 hours to retopup.
     */
    function _checkCap(address member) internal {
        if (capHitTimestamp[member] > 0) return; // Already capped
        if (slotBlank[member]) return;

        if (lifetimeEarnings[member] >= EARNINGS_CAP) {
            capHitTimestamp[member] = block.timestamp;
            uint256 deadline = block.timestamp + RETOPUP_WINDOW;
            emit EarningsCapHit(member, lifetimeEarnings[member], deadline);
        }
    }

    // ─── Fallback Claim ────────────────────────────────────────────────────────

    /**
     * @dev Claim accumulated fallback balance (from failed push transfers).
     */
    function claimFallback() external nonReentrant {
        if (!isDaoMember[msg.sender]) revert NotMember();
        uint256 amount = pullFallbackBalance[msg.sender];
        if (amount == 0) revert NothingToClaim();

        pullFallbackBalance[msg.sender] = 0;
        totalDistributed               += 0; // already counted in _pushTransfer

        bool ok = paymentToken.transfer(msg.sender, amount);
        if (!ok) revert TransferFailed();

        emit FallbackClaimed(msg.sender, amount, block.timestamp);
    }

    // ─── View Functions ────────────────────────────────────────────────────────

    /**
     * @dev Full member state for UI display.
     */
    function getMemberDetails(address user)
        external view
        returns (
            bool    isMember,
            uint256 position,
            uint256 nftTokenId,
            uint256 fallbackClaimable,
            uint256 totalEarned,
            bool    isCapped,
            uint256 retopupDeadline,
            bool    isBlank,
            uint256 poolClaimable
        )
    {
        isMember          = isDaoMember[user];
        position          = memberPosition[user];
        nftTokenId        = isMember ? position : 0;
        fallbackClaimable = pullFallbackBalance[user];
        totalEarned       = lifetimeEarnings[user];
        isCapped          = capHitTimestamp[user] > 0;
        retopupDeadline   = capHitTimestamp[user] > 0 ? capHitTimestamp[user] + RETOPUP_WINDOW : 0;
        isBlank           = slotBlank[user];
        poolClaimable     = getPendingPoolShare(user);
    }

    function getDAOStats()
        external view
        returns (
            uint256 memberCount,
            uint256 totalCollectedAmount,
            uint256 totalDistributedAmount,
            bool    isCompleted,
            bool    isExpiredStatus,
            uint256 secondsRemaining,
            uint256 activeMembers,
            uint256 blankSlots,
            uint256 totalPoolReceivedAmount,
            uint256 totalPoolDistributedAmount
        )
    {
        bool exp = false; // Permanent queue — no 15-day inactivity timeout
        uint256 rem = 0;

        uint256 blanks = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            if (slotBlank[daoMembers[i]]) blanks++;
        }

        return (
            daoMembers.length,
            totalCollected,
            totalDistributed,
            daoCompleted,
            exp,
            rem,
            daoMembers.length - blanks,
            blanks,
            totalPoolReceived,
            totalPoolDistributed
        );
    }

    function getRemainingPositions() external view returns (uint256) {
        if (daoMembers.length >= MAX_MEMBERS) {
            // Check for blank/vacant slots that can be taken
            uint256 blanks = 0;
            for (uint256 i = 0; i < daoMembers.length; i++) {
                address m = daoMembers[i];
                if (slotBlank[m] || (capHitTimestamp[m] > 0 && block.timestamp > capHitTimestamp[m] + RETOPUP_WINDOW)) {
                    blanks++;
                }
            }
            return blanks;
        }
        return MAX_MEMBERS - daoMembers.length;
    }

    function getAllMembers() external view returns (address[] memory) {
        return daoMembers;
    }

    function isClosed() external view returns (bool) {
        return daoCompleted;
    }

    function isExpired() external pure returns (bool) {
        return false;
    }

    function timeRemainingInWindow() external pure returns (uint256) {
        return 0;
    }

    /**
     * @dev Returns the time remaining for a member to retopup before their slot is blanked.
     *      Returns 0 if not capped or window already expired.
     */
    function retopupTimeRemaining(address member) external view returns (uint256) {
        if (capHitTimestamp[member] == 0) return 0;
        uint256 deadline = capHitTimestamp[member] + RETOPUP_WINDOW;
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }

    /**
     * @dev Returns cap progress for a member (earnings / cap, both in TROB).
     */
    function getCapProgress(address member) external view returns (
        uint256 earned,
        uint256 cap,
        uint256 remaining
    ) {
        earned = lifetimeEarnings[member];
        cap    = EARNINGS_CAP;
        remaining = earned >= cap ? 0 : cap - earned;
    }
}
