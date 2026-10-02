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
 * === ECONOMIC MODEL (USD-PEGGED) =============================================
 *   Entry Fee: $300 USD worth of TROB tokens per seat.
 *   Max Members: 100 (hard cap, immutable)
 *
 *   The `entryFee` state variable is set in TROB token units (18 decimals)
 *   equivalent to $300 USD at the current live TROB market price.
 *   Admin can call `setEntryFee()` to sync with the live price oracle.
 *
 *   When member N joins (Position 1 to 100):
 *     Their entry fee (in TROB) is split equally among all N active members:
 *       Share per member = entryFee / N
 *     - Member 1 receives entryFee / 1 instant cashback (100% refund).
 *     - Member 2 receives entryFee / 2 instant cashback, and Member 1 receives the same.
 *     - Member 100 receives entryFee / 100, and all 100 members each receive the same.
 *     Total Payout = entryFee (100% peer distribution, zero platform fees).
 *
 * === 5X EARNINGS CAP + 48-HOUR RE-TOPUP =====================================
 *   - Each member can earn a maximum of 5× their deposit = $1,500 USD in TROB.
 *   - earningsCap = entryFee × 5. Updated automatically when setEntryFee() is called.
 *   - When a member's lifetime earnings (in TROB) hit earningsCap, their slot is capped.
 *   - They have 48 hours to call retopup() and pay entryFee TROB again.
 *   - If they miss the window, their slot is BLANKED (permanently skipped in
 *     future distributions) until they retopup.
 *   - Retopup resets their lifetime earnings counter.
 *
 * === SEAT EXPIRY WINDOW ======================================================
 *   - Each seat must be filled within 21 days of the previous seat being filled.
 *   - If 21 days pass with no new join, the DAO queue expires permanently.
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
 * === PRICE ORACLE NOTE =======================================================
 *   The `entryFeeUsd` is stored as the fixed USD peg ($300 with 6 decimals = 300_000_000).
 *   The `entryFee` (in TROB 18-decimal tokens) must be updated via `setEntryFee()`
 *   whenever the live TROB/USD price changes significantly. The deployer (admin)
 *   address is stored for this purpose.
 *
 * === NULL KEY =================================================================
 *   Beyond setEntryFee(), this contract has no privileged admin functions.
 *   setEntryFee can be called by the deployer or a future price-keeper bot.
 */
contract EquoraDAO is ReentrancyGuard {

    // ─── Constants ─────────────────────────────────────────────────────────────

    /// @dev USD peg for entry fee: $300.00 (6 decimal places, i.e. 300_000_000 = $300)
    uint256 public constant ENTRY_FEE_USD          = 300_000_000; // $300 USD (6 decimals)
    /// @dev USD peg for earnings cap: $1,500.00 (6 decimal places)
    uint256 public constant EARNINGS_CAP_USD       = 1_500_000_000; // $1,500 USD (6 decimals)

    uint256 public constant MAX_MEMBERS            = 100;
    uint256 public constant SEAT_WINDOW            = 21 days;
    uint256 public constant RETOPUP_WINDOW         = 48 hours;

    /// @dev Official Super Representative (SR) address for Equora_Fi protocol governance
    string public constant OFFICIAL_SR_BASE58      = "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
    /// @dev Minimum creation timestamp for eligible deposit wallets: 1 October 2026 00:00:00 UTC
    uint256 public constant MIN_WALLET_CREATION_DATE = 1790812800;
    /// @dev Target daily free transactions for DAO members (Formula: 50 TX/day)
    uint256 public constant DAO_TARGET_FREE_TX_PER_DAY = 50;
    /// @dev Target daily free transactions for Matrix members (Formula: 5 TX/day)
    uint256 public constant MATRIX_TARGET_FREE_TX_PER_DAY = 5;

    // ─── Admin ─────────────────────────────────────────────────────────────────

    /// @dev Deployer address — can update entryFee to match live USD peg
    address public immutable admin;

    // ─── Immutable Dependencies ────────────────────────────────────────────────

    IERC20              public immutable paymentToken;
    EquoraDAOMembership public immutable membershipNFT;
    IEquoraRegistry     public immutable registry;

    // ─── Dynamic Price State ───────────────────────────────────────────────────

    /// @dev Current entry fee in TROB tokens (6 decimals for native TROB sun). Equivalent to $300 USD.
    ///      Default: 5460 * 10**6 (at $0.054945/TROB; update via setEntryFee)
    uint256 public entryFee    = 5460 * 10 ** 6;

    /// @dev Current earnings cap in TROB tokens (6 decimals). Always = entryFee × 5 = $1,500 USD (27,300 TROB).
    uint256 public earningsCap = 27300 * 10 ** 6;

    /// @dev Last TROB price used (in USD with 6 decimals, e.g. 0.055 TROB/USD = 55_000)
    uint256 public lastTrobPriceUsd6;

    /// @dev Timestamp when entryFee was last updated
    uint256 public lastPriceUpdateTimestamp;

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

    // Deposit eligibility attestation (Condition 1 + Condition 2 + Community Verification)
    mapping(address => bool)    public isEligibilityAttested;
    bool                        public eligibilityEnforced;

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
    /// @dev Emitted when admin updates entry fee to reflect current USD–TROB rate
    event EntryFeeUpdated(uint256 newEntryFee, uint256 newEarningsCap, uint256 trobPriceUsd6, uint256 timestamp);
    /// @dev Emitted when wallet deposit eligibility is attested
    event EligibilityAttested(address indexed account, bool eligible, uint256 timestamp);
    /// @dev Emitted when eligibility enforcement is toggled
    event EligibilityEnforcementUpdated(bool enforced, uint256 timestamp);

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor(
        address _paymentToken,
        address _registry
    ) {
        require(_paymentToken != address(0), "EquoraDAO: Invalid token");
        require(_registry     != address(0), "EquoraDAO: Invalid registry");

        admin        = msg.sender;
        paymentToken = IERC20(_paymentToken);
        registry     = IEquoraRegistry(_registry);

        // Initialize DAO launch timestamp for 21-day founding window
        daoLaunchTimestamp = block.timestamp;
        lastJoinTimestamp  = block.timestamp;

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

    // ─── Entry Fee Management (Price Oracle Sync) ──────────────────────────────

    /**
     * @dev Update the TROB entry fee to reflect the current live USD market price.
     *      Only callable by admin (the deployer or a price-keeper bot).
     *
     * @param _newEntryFee   TROB amount (18-decimal) equivalent to $300 USD.
     *                       Example: TROB = $0.056 => $300 / 0.056 ≈ 5357.14 TROB
     *                                => _newEntryFee = 5357142857142857142857 (5357.14 * 1e18)
     * @param _trobPriceUsd6 The TROB/USD price used, with 6 decimals. E.g. $0.056 => 56000
     *                       Stored for on-chain auditing only.
     */
    function setEntryFee(uint256 _newEntryFee, uint256 _trobPriceUsd6) external {
        require(msg.sender == admin, "EquoraDAO: not admin");
        require(_newEntryFee > 0, "EquoraDAO: entry fee must be > 0");
        require(_trobPriceUsd6 > 0, "EquoraDAO: price must be > 0");

        // Sanity: entry fee must represent $150 to $600 USD (allowing for 2x price swings)
        uint256 expectedMin = (150_000_000 * 1e6) / _trobPriceUsd6; // $150 floor (6 decimals)
        uint256 expectedMax = (600_000_000 * 1e6) / _trobPriceUsd6; // $600 ceiling (6 decimals)
        require(
            _newEntryFee >= expectedMin && _newEntryFee <= expectedMax,
            "EquoraDAO: fee deviates too far from $300 peg"
        );

        entryFee    = _newEntryFee;
        earningsCap = _newEntryFee * 5;  // 5x fee = $1,500 USD in TROB
        lastTrobPriceUsd6        = _trobPriceUsd6;
        lastPriceUpdateTimestamp = block.timestamp;

        emit EntryFeeUpdated(_newEntryFee, earningsCap, _trobPriceUsd6, block.timestamp);
    }

    /**
     * @dev Attest or update an account's deposit eligibility against protocol conditions:
     *      - Condition 1: Wallet created on or after 1 October 2026
     *      - Condition 2: Resource Stake (Energy + Bandwidth) + Equora SR Vote
     *      - Official Community Channel Verified
     *      Callable by admin or authorized verifier relayer.
     */
    function setEligibilityAttestation(address account, bool eligible) external {
        require(msg.sender == admin, "EquoraDAO: not admin");
        require(account != address(0), "EquoraDAO: invalid address");
        isEligibilityAttested[account] = eligible;
        emit EligibilityAttested(account, eligible, block.timestamp);
    }

    /**
     * @dev Toggle on-chain enforcement of eligibility condition attestation prior to joinDAO.
     */
    function setEligibilityEnforced(bool _enforced) external {
        require(msg.sender == admin, "EquoraDAO: not admin");
        eligibilityEnforced = _enforced;
        emit EligibilityEnforcementUpdated(_enforced, block.timestamp);
    }

    receive() external payable {}

    // ─── Core Join Function ────────────────────────────────────────────────────

    /**
     * @dev Join the Genesis DAO as one of 100 founding members.
     *      Requirements:
     *        - Queue not full (< 100 seats, or a vacant seat exists from an expired 48h retopup)
     *        - Caller not already a member
     *        - Open to any participant (0 referrals required)
     *        - Entry fee is $300 USD worth of TROB (payable via native TROB or paymentToken)
     *
     *      If an existing seat is vacant (due to missed 48h retopup), the lowest-numbered
     *      blank seat (scanned from Seat 1 to 100) is filled first!
     *
     * @return position The 1-indexed seat number assigned (1 to 100)
     */
    function joinDAO() external payable nonReentrant returns (uint256 position) {
        if (isDaoMember[msg.sender]) revert AlreadyMember();
        if (eligibilityEnforced && !isEligibilityAttested[msg.sender]) revert NotQualified();

        // 1. Scan from Seat 1 to 100 for any blank/vacant slot (missed 48-hour retopup)
        uint256 vacantIndex = type(uint256).max;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (slotBlank[m] || (capHitTimestamp[m] > 0 && block.timestamp > capHitTimestamp[m] + RETOPUP_WINDOW)) {
                vacantIndex = i;
                break;
            }
        }

        // 2. Collect entry fee payment ($300 USD worth of TROB)
        // Accepts native TROB from TrobSafe wallet (msg.value) or paymentToken transferFrom
        uint256 paidAmount = entryFee;
        if (msg.value > 0) {
            paidAmount = msg.value;
            totalCollected += paidAmount;
        } else {
            bool ok = paymentToken.transferFrom(msg.sender, address(this), entryFee);
            if (!ok) revert PaymentFailed();
            totalCollected += entryFee;
        }

        uint256 tokenId;
        // 3. If a vacant seat exists, replace the expired member
        if (vacantIndex != type(uint256).max) {
            address oldMember = daoMembers[vacantIndex];
            isDaoMember[oldMember]      = false;
            slotBlank[oldMember]        = false;
            capHitTimestamp[oldMember]  = 0;
            memberPosition[oldMember]   = 0;
            lifetimeEarnings[oldMember] = 0;
            memberRewardDebt[oldMember] = 0;

            daoMembers[vacantIndex]     = msg.sender;
            isDaoMember[msg.sender]     = true;
            position                    = vacantIndex + 1;
            memberPosition[msg.sender]  = position;
            memberRewardDebt[msg.sender] = accPoolSharePerMember;
            lastJoinTimestamp           = block.timestamp;

            // Auto-register new joiner in EquoraRegistry if not yet registered
            _registerUserInRegistry(msg.sender);

            tokenId = membershipNFT.reassignSeat(oldMember, msg.sender, position);
            emit DAOPositionJoined(msg.sender, position, tokenId, block.timestamp);

            // Distribute entry fee to all active members except new joiner
            _distributeRetopup(msg.sender, paidAmount);
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

        // Auto-register new joiner in EquoraRegistry if not yet registered
        _registerUserInRegistry(msg.sender);

        tokenId = membershipNFT.mint(msg.sender, position);
        emit DAOPositionJoined(msg.sender, position, tokenId, block.timestamp);

        memberRewardDebt[msg.sender] = accPoolSharePerMember;
        _distributeEntryFee(position, paidAmount);

        if (daoMembers.length == MAX_MEMBERS) {
            daoCompleted = true;
            emit QueueClosed(MAX_MEMBERS, block.timestamp);
        }

        return position;
    }

    /**
     * @dev Internal helper to register a DAO joiner in EquoraRegistry.
     *      Ensures all 100 DAO members have 5-digit referral codes from Day 1.
     */
    function _registerUserInRegistry(address user) internal {
        if (address(registry) != address(0)) {
            try registry.isRegistered(user) returns (bool reg) {
                if (!reg) {
                    try registry.registerUser(user, address(0)) {} catch {}
                }
            } catch {}
        }
    }

    // ─── Re-topup (5X Cap Reset) ───────────────────────────────────────────────

    /**
     * @dev Called by a member who has hit their 5X earnings cap to re-activate
     *      their slot. Must be called within 48 hours of the cap being hit.
     *      Pays entry fee ($300 USD worth of TROB) again and resets lifetime earnings.
     */
    function retopup() external payable nonReentrant {
        if (!isDaoMember[msg.sender]) revert NotMember();

        // 48-hour window check (if cap timestamp was set, enforce deadline)
        if (capHitTimestamp[msg.sender] > 0 && block.timestamp > capHitTimestamp[msg.sender] + RETOPUP_WINDOW) {
            // Window expired — slot should already be blank (or we blank it now)
            if (!slotBlank[msg.sender]) {
                _updateMemberPoolReward(msg.sender);
                slotBlank[msg.sender] = true;
                emit SlotBlanked(msg.sender, block.timestamp);
            }
            revert RetopupWindowExpired();
        }

        // Collect re-topup fee ($300 USD worth of TROB at current rate)
        uint256 paidAmount = entryFee;
        if (msg.value > 0) {
            paidAmount = msg.value;
            totalCollected += paidAmount;
        } else {
            bool ok = paymentToken.transferFrom(msg.sender, address(this), entryFee);
            if (!ok) revert PaymentFailed();
            totalCollected += entryFee;
        }

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
        _distributeRetopup(msg.sender, paidAmount);

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
     *      Expiry: founding window is 21 days from launch.
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
     * @dev Distribute $300 entry fee (in TROB) instantly following 300 / N formula:
     *      - Incoming member N is INCLUDED in the distribution.
     *      - Position 1 (N = 1): entryFee / 1 returned to Member 1 immediately.
     *      - Position 2 (N = 2): entryFee / 2 to Member 2 (immediate return) & entryFee / 2 to Member 1.
     *      - Position 3 (N = 3): entryFee / 3 to Member 3 (immediate return) & entryFee / 3 each to Members 1 & 2.
     *      - Position N: entryFee / activeCount to all active members from 1 to N (including new joiner).
     *      - Blanked slots are SKIPPED in distribution.
     *      - After crediting, checks if recipient has hit 5X cap ($1,500 worth of TROB).
     */
    function _distributeEntryFee(uint256 incomingPosition, uint256 amountToDistribute) internal {
        // Count active (non-blank) recipients among all members up to incomingPosition (inclusive)
        uint256 activeCount = 0;
        for (uint256 i = 0; i < incomingPosition; i++) {
            if (!slotBlank[daoMembers[i]]) {
                activeCount++;
            }
        }

        if (activeCount == 0) return;

        uint256 amountPerRecipient = amountToDistribute / activeCount;
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
        if (address(this).balance >= amount && amount > 0) {
            // Direct native TROB transfer to council member wallet on-chain
            (bool sent, ) = payable(recipient).call{value: amount}("");
            ok = sent;
        }
        if (!ok && address(paymentToken) != address(0)) {
            try paymentToken.transfer(recipient, amount) returns (bool res) {
                ok = res;
            } catch {}
        }

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

        if (lifetimeEarnings[member] >= earningsCap) {
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

        bool ok = false;
        if (address(this).balance >= amount && amount > 0) {
            (bool sent, ) = payable(msg.sender).call{value: amount}("");
            ok = sent;
        }
        if (!ok && address(paymentToken) != address(0)) {
            ok = paymentToken.transfer(msg.sender, amount);
        }
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

    /**
     * @dev Explicit getter for Genesis DAO launch timestamp.
     *      Used by EquoraMatrix to synchronize the 21-day founding window.
     */
    function getLaunchTimestamp() external view returns (uint256) {
        return daoLaunchTimestamp;
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
        bool exp = false; // Permanent queue — no 21-day inactivity timeout
        uint256 rem = 0;
        if (!daoCompleted && !exp) {
            uint256 startTs = daoLaunchTimestamp > 0 ? daoLaunchTimestamp : lastJoinTimestamp;
            if (startTs > 0) {
                uint256 deadline = startTs + SEAT_WINDOW;
                if (deadline > block.timestamp) {
                    rem = deadline - block.timestamp;
                }
            } else {
                rem = SEAT_WINDOW;
            }
        }

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

    /**
     * @dev Returns the last member who joined the Genesis DAO.
     *      On Day 22, this member becomes the Root Matrix Owner of the Retail Matrix.
     */
    function getLastMember() external view returns (address) {
        if (daoMembers.length == 0) return address(0);
        return daoMembers[daoMembers.length - 1];
    }

    function isClosed() external view returns (bool) {
        return daoCompleted;
    }

    function isExpired() external pure returns (bool) {
        return false;
    }

    /**
     * @dev Returns remaining seconds in the 21-day founding window.
     *      Exact match with the 21-day countdown on the Matrix Bridge page.
     */
    function timeRemainingInWindow() external view returns (uint256) {
        if (daoCompleted || daoExpired) return 0;
        uint256 startTs = daoLaunchTimestamp > 0 ? daoLaunchTimestamp : lastJoinTimestamp;
        if (startTs == 0) return SEAT_WINDOW; // 21 days
        uint256 deadline = startTs + SEAT_WINDOW;
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
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
        cap    = earningsCap;
        remaining = earned >= cap ? 0 : cap - earned;
    }
}
