// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IEquoraRegistry.sol";

/**
 * @title EquoraDAOv3
 * @dev Genesis DAO v3 — Sovereign 100-Seat Founding Council on Equora.Fi
 *
 * Core Upgrades in V3:
 *   1. Per-Member Locked 5X Earnings Cap:
 *      Each member's 5X cap is locked to 5× their actual paid deposit at their entry/retopup
 *      live rate (e.g. 5,357.14 TROB paid -> 26,785.71 TROB cap = $1,500 USD). Subsequent
 *      global oracle changes never distort existing members' caps or cause premature capping.
 *   2. Strict 48-Hour Window Isolation:
 *      The 48-hour retopup countdown strictly applies ONLY to members whose current cycle
 *      earnings have actually reached their 5X cap (capHitTimestamp > 0). Uncapped members
 *      have capHitTimestamp == 0 and are never subject to any countdown, timer, or blanking.
 *   3. Cycle 2 & Re-topup Historical Parity:
 *      Supports genuine Cycle 2 members (such as Seat #1) who already paid their $300
 *      re-topup on-chain. Starts their Cycle 2 with their verified backup balance
 *      (1,021.72 TROB / ~$42 USD), retopupCount = 1, capHitTimestamp = 0, fully active and
 *      receiving 100% of eligible 300/N entry payouts and 35% Matrix Volume Pool distributions.
 *   4. Direct 35% Matrix Protocol Pool Push:
 *      Splits incoming protocol deposits equally and pushes directly to active uncapped members
 *      with zero lockup. Permissionless flushAndDistributeAccumulatedPool() allows flushing any
 *      accumulated contract balance directly to members.
 *   5. Security Floor & Anti-Drain:
 *      Minimum entry fee floor of 4,500 TROB with live USD oracle bounds.
 *      Quarantined reservations and unearned debt recovery preserved.
 */
contract EquoraDAOv3 is ReentrancyGuard {

    // ─── Constants ─────────────────────────────────────────────────────────────

    uint256 public constant ENTRY_FEE_USD            = 300_000_000;   // $300 USD (6 decimals)
    uint256 public constant EARNINGS_CAP_USD         = 1_500_000_000; // $1,500 USD (6 decimals)
    uint256 public constant MIN_ENTRY_FEE_FLOOR      = 4500 * 10 ** 6; // 4,500 TROB minimum floor

    uint256 public constant MAX_MEMBERS              = 100;
    uint256 public constant SEAT_WINDOW              = 21 days;
    uint256 public constant RETOPUP_WINDOW           = 48 hours;

    string public constant OFFICIAL_SR_BASE58        = "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
    uint256 public constant MIN_WALLET_CREATION_DATE = 1790812800;
    uint256 public constant DAO_TARGET_FREE_TX_PER_DAY = 50;
    uint256 public constant MATRIX_TARGET_FREE_TX_PER_DAY = 5;

    // ─── Admin (Renounceable) ──────────────────────────────────────────────────

    address public admin;

    // ─── Dependencies ──────────────────────────────────────────────────────────

    IERC20              public immutable paymentToken;
    IEquoraRegistry     public immutable registry;
    address             public vaultContract;
    address             public priceOracle;

    // ─── Dynamic Price State ───────────────────────────────────────────────────

    uint256 public entryFee                   = 5357140000; // ~5,357.14 TROB (at ~$0.056/TROB)
    uint256 public earningsCap                = 26785700000; // 5x default fallback cap (26,785.70 TROB)
    uint256 public lastTrobPriceUsd6          = 56000;       // $0.056 (6 decimals)
    uint256 public lastPriceUpdateTimestamp;

    // ─── DAO Core State ────────────────────────────────────────────────────────

    address[] public daoMembers;
    mapping(address => bool)    public isDaoMember;
    mapping(address => uint256) public memberPosition;
    mapping(address => uint256) public pullFallbackBalance;

    // DAO Plan Share Benefit (35% Matrix Volume Pool)
    uint256 public accPoolSharePerMember;
    uint256 public totalPoolReceived;
    uint256 public totalPoolDistributed;
    mapping(address => uint256) public memberRewardDebt;
    mapping(address => uint256) public pendingPoolShare;

    // Earnings tracking & Per-Member Dynamic 5X Cap
    mapping(address => uint256) public lifetimeEarnings;    // Current cycle earnings towards 5X cap
    mapping(address => uint256) public memberEarningsCap;   // Locked 5X cap for this member (paidAmount * 5)
    mapping(address => uint256) public memberRetopupCount;  // Cycle counter (0 = Cycle 1, 1 = Cycle 2, ...)
    mapping(address => uint256) public historicalTotalEarned; // All-time cumulative earnings across all cycles
    mapping(address => uint256) public capHitTimestamp;     // Set ONLY when current cycle hits 5X cap (0 = uncapped)
    mapping(address => bool)    public slotBlank;           // True only if member defaulted beyond 48h window

    // Deposit eligibility attestation
    mapping(address => bool)    public isEligibilityAttested;
    bool                        public eligibilityEnforced;

    bool    public daoCompleted;
    bool    public daoExpired;
    uint256 public totalCollected;
    uint256 public totalDistributed;
    uint256 public lastJoinTimestamp;
    uint256 public daoLaunchTimestamp;

    // ─── Migration & Underfunded Reservations ──────────────────────────────────

    bool public migrationFinalized;
    uint256 public reservationDeadline;
    uint256 public totalPullFallback;
    uint256 public totalDebtRecovered;

    struct UnderfundedReservation {
        uint256 reservedSeat;
        uint256 previousDepositSun;
        uint256 unearnedDebtSun;
        bool isReserved;
    }
    mapping(address => UnderfundedReservation) public underfundedReservations;
    mapping(address => uint256) public unearnedDebt;

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
    error MigrationClosed();
    error InvalidReservation();

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
    event EarningsCapSurplusRedistributed(uint256 surplusAmount, uint256 recipientCount, uint256 timestamp);
    event SlotBlanked(address indexed member, uint256 timestamp);
    event SlotReactivated(address indexed member, uint256 timestamp);
    event Retopup(address indexed member, uint256 position, uint256 newCap, uint256 retopupCount, uint256 timestamp);
    event PoolDepositReceived(uint256 amount, uint256 accPerMember, uint256 timestamp);
    event PoolShareClaimed(address indexed member, uint256 amount, uint256 timestamp);
    event EntryFeeUpdated(uint256 newEntryFee, uint256 newEarningsCap, uint256 trobPriceUsd6, uint256 timestamp);
    event EligibilityAttested(address indexed account, bool eligible, uint256 timestamp);
    event EligibilityEnforcementUpdated(bool enforced, uint256 timestamp);
    event AdminRenounced(address indexed previousAdmin, uint256 timestamp);
    event PriceOracleSet(address indexed oracle);
    event GenuineMembersMigrated(uint256 count, uint256 timestamp);
    event UnderfundedReservationSet(address indexed wallet, uint256 indexed seat, uint256 previousDepositSun, uint256 unearnedDebtSun);
    event UnderfundedSeatCompleted(address indexed wallet, uint256 indexed seat, uint256 paidAmount, uint256 totalCost);
    event UnearnedDebtRecovered(address indexed member, uint256 amountDeducted, uint256 remainingDebt);
    event RecoveredSurplusWithdrawn(address indexed to, uint256 amount, uint256 timestamp);

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor(
        address _paymentToken,
        address _registry
    ) {
        require(_registry != address(0), "EquoraDAO: Invalid registry");

        admin        = msg.sender;
        if (_paymentToken != address(0)) {
            paymentToken = IERC20(_paymentToken);
        }
        registry     = IEquoraRegistry(_registry);

        daoLaunchTimestamp = block.timestamp;
        lastJoinTimestamp  = block.timestamp;
    }

    function setVaultContract(address _vault) public onlyAdmin {
        require(vaultContract == address(0), "EquoraDAO: vault already set");
        require(_vault != address(0), "EquoraDAO: invalid vault");
        vaultContract = _vault;
        emit VaultContractSet(_vault);
    }

    function setTreasuryVault(address _vault) external onlyAdmin {
        setVaultContract(_vault);
    }

    // ─── Migration Setup ───────────────────────────────────────────────────────

    /**
     * @dev Migrates genuine council members in batches with their exact seats and cycle state.
     *      - Sets per-member dynamic 5X cap based on their entry fee.
     *      - Correctly supports Cycle 2 members (e.g. Seat #1 with retopupCount = 1 and backup balance).
     *      - For members under their 5X cap, capHitTimestamp remains 0 (active, unblocked).
     */
    function migrateGenuineMembersWithCycles(
        address[] calldata _members,
        uint256[] calldata _positions,
        uint256[] calldata _cycleEarnings,
        uint256[] calldata _retopupCounts,
        uint256[] calldata _historicalTotals
    ) external onlyAdmin {
        if (migrationFinalized) revert MigrationClosed();
        require(
            _members.length == _positions.length &&
            _members.length == _cycleEarnings.length &&
            _members.length == _retopupCounts.length &&
            _members.length == _historicalTotals.length,
            "Mismatched lengths"
        );

        for (uint256 i = 0; i < _members.length; i++) {
            address m = _members[i];
            uint256 pos = _positions[i];
            uint256 earned = _cycleEarnings[i];
            uint256 retopups = _retopupCounts[i];
            uint256 allTime = _historicalTotals[i];

            require(m != address(0), "Invalid address");
            require(pos >= 1 && pos <= MAX_MEMBERS, "Invalid position");
            if (isDaoMember[m]) continue; // Skip if already migrated

            while (daoMembers.length < pos) {
                daoMembers.push(address(0));
            }

            daoMembers[pos - 1] = m;
            isDaoMember[m] = true;
            memberPosition[m] = pos;
            lifetimeEarnings[m] = earned;
            historicalTotalEarned[m] = allTime > 0 ? allTime : (retopups * earningsCap + earned);
            memberRetopupCount[m] = retopups;
            memberEarningsCap[m] = earningsCap;
            memberRewardDebt[m] = accPoolSharePerMember;

            _registerUserInRegistry(m);

            uint256 tokenId = pos;
            emit DAOPositionJoined(m, pos, tokenId, block.timestamp);

            // Strictly check if current cycle has hit the 5X cap
            if (earned >= earningsCap) {
                _markCapHit(m);
            } else {
                capHitTimestamp[m] = 0;
            }
        }
        lastJoinTimestamp = block.timestamp;
        emit GenuineMembersMigrated(_members.length, block.timestamp);
    }

    /**
     * @dev Backward-compatible batch migration function.
     */
    function migrateGenuineMembers(
        address[] calldata _members,
        uint256[] calldata _positions,
        uint256[] calldata _lifetimeEarnings
    ) external onlyAdmin {
        if (migrationFinalized) revert MigrationClosed();
        require(_members.length == _positions.length && _members.length == _lifetimeEarnings.length, "Mismatched lengths");

        for (uint256 i = 0; i < _members.length; i++) {
            address m = _members[i];
            uint256 pos = _positions[i];
            uint256 earned = _lifetimeEarnings[i];

            require(m != address(0), "Invalid address");
            require(pos >= 1 && pos <= MAX_MEMBERS, "Invalid position");
            if (isDaoMember[m]) continue;

            while (daoMembers.length < pos) {
                daoMembers.push(address(0));
            }

            daoMembers[pos - 1] = m;
            isDaoMember[m] = true;
            memberPosition[m] = pos;
            lifetimeEarnings[m] = earned;
            historicalTotalEarned[m] = earned;
            memberEarningsCap[m] = earningsCap;
            memberRewardDebt[m] = accPoolSharePerMember;

            _registerUserInRegistry(m);

            uint256 tokenId = pos;
            emit DAOPositionJoined(m, pos, tokenId, block.timestamp);

            if (earned >= earningsCap) {
                _markCapHit(m);
            } else {
                capHitTimestamp[m] = 0;
            }
        }
        lastJoinTimestamp = block.timestamp;
        emit GenuineMembersMigrated(_members.length, block.timestamp);
    }

    /**
     * @dev Configure underfunded reservations so their deposit credits are preserved.
     */
    function setUnderfundedReservations(
        address[] calldata _wallets,
        uint256[] calldata _seats,
        uint256[] calldata _previousDeposits,
        uint256[] calldata _unearnedDebts
    ) external onlyAdmin {
        if (migrationFinalized) revert MigrationClosed();
        require(
            _wallets.length == _seats.length &&
            _wallets.length == _previousDeposits.length &&
            _wallets.length == _unearnedDebts.length,
            "Mismatched lengths"
        );

        if (reservationDeadline == 0) {
            reservationDeadline = block.timestamp + RETOPUP_WINDOW;
        }

        for (uint256 i = 0; i < _wallets.length; i++) {
            uint256 seat = _seats[i];
            while (daoMembers.length < seat) {
                daoMembers.push(address(0));
            }
            underfundedReservations[_wallets[i]] = UnderfundedReservation({
                reservedSeat: seat,
                previousDepositSun: _previousDeposits[i],
                unearnedDebtSun: _unearnedDebts[i],
                isReserved: true
            });
            emit UnderfundedReservationSet(_wallets[i], seat, _previousDeposits[i], _unearnedDebts[i]);
        }
    }

    /**
     * @dev Locks migration functions permanently.
     */
    function finalizeMigration() external onlyAdmin {
        if (migrationFinalized) revert MigrationClosed();
        migrationFinalized = true;
    }

    // ─── Entry Fee & Price Oracle Management ──────────────────────────────────

    function setPriceOracle(address _oracle) external onlyAdmin {
        priceOracle = _oracle;
        emit PriceOracleSet(_oracle);
    }

    /**
     * @dev Updates the live TROB market price and recalculates default entry fee ($300 USD peg).
     *      Callable by admin or authorized priceOracle.
     */
    function setTrobPrice(uint256 _trobPriceUsd6) external {
        require(msg.sender == admin || (priceOracle != address(0) && msg.sender == priceOracle), "Unauthorized");
        require(_trobPriceUsd6 > 0, "Price must be > 0");

        lastTrobPriceUsd6 = _trobPriceUsd6;
        lastPriceUpdateTimestamp = block.timestamp;

        uint256 newEntry = (ENTRY_FEE_USD * 1e6) / _trobPriceUsd6;
        if (newEntry < MIN_ENTRY_FEE_FLOOR) newEntry = MIN_ENTRY_FEE_FLOOR;

        entryFee    = newEntry;
        earningsCap = newEntry * 5;

        emit EntryFeeUpdated(entryFee, earningsCap, _trobPriceUsd6, block.timestamp);
    }

    function setEntryFee(uint256 _newEntryFee, uint256 _trobPriceUsd6) external onlyAdmin {
        require(_newEntryFee >= MIN_ENTRY_FEE_FLOOR, "Fee below minimum floor");
        require(_trobPriceUsd6 > 0, "Price must be > 0");

        uint256 expectedMin = (150_000_000 * 1e6) / _trobPriceUsd6;
        uint256 expectedMax = (600_000_000 * 1e6) / _trobPriceUsd6;
        require(_newEntryFee >= expectedMin && _newEntryFee <= expectedMax, "Fee deviates too far from $300 peg");

        entryFee    = _newEntryFee;
        earningsCap = _newEntryFee * 5;
        lastTrobPriceUsd6 = _trobPriceUsd6;
        lastPriceUpdateTimestamp = block.timestamp;

        emit EntryFeeUpdated(_newEntryFee, earningsCap, _trobPriceUsd6, block.timestamp);
    }

    function getRequiredTrobForSeat() external view returns (uint256) {
        uint256 req = (ENTRY_FEE_USD * 1e6) / lastTrobPriceUsd6;
        return req < MIN_ENTRY_FEE_FLOOR ? MIN_ENTRY_FEE_FLOOR : req;
    }

    function setEligibilityAttestation(address account, bool eligible) external onlyAdmin {
        require(account != address(0), "Invalid address");
        isEligibilityAttested[account] = eligible;
        emit EligibilityAttested(account, eligible, block.timestamp);
    }

    function setEligibilityEnforced(bool _enforced) external onlyAdmin {
        eligibilityEnforced = _enforced;
        emit EligibilityEnforcementUpdated(_enforced, block.timestamp);
    }

    function renounceAdmin() external onlyAdmin {
        address previousAdmin = admin;
        admin = address(0);
        emit AdminRenounced(previousAdmin, block.timestamp);
    }

    // ─── Automatic Push on Direct TROB Transfer ───────────────────────────────

    receive() external payable {
        if (msg.value > 0) {
            _distributeIncomingPoolDeposit(msg.value);
        }
    }

    fallback() external payable {
        if (msg.value > 0) {
            _distributeIncomingPoolDeposit(msg.value);
        }
    }

    // ─── Core Join Function (Pegged Entry & Per-Member Dynamic Cap) ────────────

    function joinDAO() external payable nonReentrant returns (uint256 position) {
        if (isDaoMember[msg.sender]) revert AlreadyMember();
        if (eligibilityEnforced && !isEligibilityAttested[msg.sender]) revert NotQualified();

        // STRICT SECURITY FLOOR: Pegged to live market price (with 10% buffer) and minimum floor
        uint256 dynamicFee = (ENTRY_FEE_USD * 1e6) / lastTrobPriceUsd6;
        if (dynamicFee < MIN_ENTRY_FEE_FLOOR) dynamicFee = MIN_ENTRY_FEE_FLOOR;
        uint256 minAllowed = (dynamicFee * 90) / 100;
        if (minAllowed < MIN_ENTRY_FEE_FLOOR) minAllowed = MIN_ENTRY_FEE_FLOOR;

        if (msg.value < minAllowed) {
            revert PaymentFailed();
        }

        // 1. Scan for any vacant slot (expired 48h retopup member OR expired underfunded reservation)
        uint256 vacantIndex = type(uint256).max;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (m == address(0)) {
                if (reservationDeadline > 0 && block.timestamp > reservationDeadline) {
                    vacantIndex = i;
                    break;
                }
            } else if (slotBlank[m] || (capHitTimestamp[m] > 0 && block.timestamp > capHitTimestamp[m] + RETOPUP_WINDOW)) {
                vacantIndex = i;
                break;
            }
        }

        uint256 paidAmount = msg.value;
        totalCollected += paidAmount;
        uint256 tokenId;

        // 2. If a vacant seat exists, claim or replace the expired member
        if (vacantIndex != type(uint256).max) {
            address oldMember = daoMembers[vacantIndex];
            position = vacantIndex + 1;

            if (oldMember != address(0)) {
                isDaoMember[oldMember]           = false;
                slotBlank[oldMember]             = false;
                capHitTimestamp[oldMember]       = 0;
                memberPosition[oldMember]        = 0;
                lifetimeEarnings[oldMember]      = 0;
                memberRewardDebt[oldMember]      = 0;
                memberEarningsCap[oldMember]     = 0;
                memberRetopupCount[oldMember]    = 0;
            }

            daoMembers[vacantIndex]          = msg.sender;
            isDaoMember[msg.sender]          = true;
            memberPosition[msg.sender]       = position;
            memberRewardDebt[msg.sender]     = accPoolSharePerMember;
            memberEarningsCap[msg.sender]    = paidAmount * 5; // Lock this member's 5X cap to entry rate
            memberRetopupCount[msg.sender]   = 0;
            capHitTimestamp[msg.sender]      = 0;
            slotBlank[msg.sender]            = false;
            lastJoinTimestamp                = block.timestamp;

            _registerUserInRegistry(msg.sender);

            tokenId = position;
            emit DAOPositionJoined(msg.sender, position, tokenId, block.timestamp);

            _distributeRetopup(msg.sender, paidAmount);
            return position;
        }

        // 3. No vacant seat — standard join up to MAX_MEMBERS
        if (daoMembers.length >= MAX_MEMBERS) revert QueueFull();

        daoMembers.push(msg.sender);
        position = daoMembers.length;
        isDaoMember[msg.sender]          = true;
        memberPosition[msg.sender]       = position;
        memberEarningsCap[msg.sender]    = paidAmount * 5; // Lock this member's 5X cap to entry rate
        memberRetopupCount[msg.sender]   = 0;
        capHitTimestamp[msg.sender]      = 0;
        slotBlank[msg.sender]            = false;

        if (position == 1) daoLaunchTimestamp = block.timestamp;
        lastJoinTimestamp = block.timestamp;

        _registerUserInRegistry(msg.sender);

        tokenId = position;
        emit DAOPositionJoined(msg.sender, position, tokenId, block.timestamp);

        memberRewardDebt[msg.sender] = accPoolSharePerMember;
        _distributeEntryFee(position, paidAmount);

        if (daoMembers.length == MAX_MEMBERS) {
            bool allFilled = true;
            for (uint256 i = 0; i < MAX_MEMBERS; i++) {
                if (daoMembers[i] == address(0)) {
                    allFilled = false;
                    break;
                }
            }
            if (allFilled) {
                daoCompleted = true;
                emit QueueClosed(MAX_MEMBERS, block.timestamp);
            }
        }

        return position;
    }

    // ─── Underfunded Seat Completion ───────────────────────────────────────────

    function completeUnderfundedSeat() external payable nonReentrant returns (uint256 position) {
        UnderfundedReservation memory res = underfundedReservations[msg.sender];
        if (!res.isReserved) revert InvalidReservation();
        if (isDaoMember[msg.sender]) revert AlreadyMember();

        uint256 requiredDelta = entryFee > res.previousDepositSun ? entryFee - res.previousDepositSun : 0;
        if (requiredDelta < (MIN_ENTRY_FEE_FLOOR > res.previousDepositSun ? MIN_ENTRY_FEE_FLOOR - res.previousDepositSun : 0)) {
            requiredDelta = MIN_ENTRY_FEE_FLOOR - res.previousDepositSun;
        }

        if (msg.value < requiredDelta) revert PaymentFailed();

        underfundedReservations[msg.sender].isReserved = false;

        position = res.reservedSeat;
        uint256 memberIdx = position - 1;

        while (daoMembers.length < position) {
            daoMembers.push(address(0));
        }

        daoMembers[memberIdx]            = msg.sender;
        isDaoMember[msg.sender]          = true;
        memberPosition[msg.sender]       = position;
        unearnedDebt[msg.sender]         = res.unearnedDebtSun;
        lifetimeEarnings[msg.sender]     = res.unearnedDebtSun;
        historicalTotalEarned[msg.sender]= res.unearnedDebtSun;
        memberEarningsCap[msg.sender]    = (msg.value + res.previousDepositSun) * 5;
        memberRetopupCount[msg.sender]   = 0;
        capHitTimestamp[msg.sender]      = 0;
        slotBlank[msg.sender]            = false;
        memberRewardDebt[msg.sender]     = accPoolSharePerMember;
        totalCollected += (msg.value + res.previousDepositSun);

        _registerUserInRegistry(msg.sender);

        uint256 tokenId = position;
        emit DAOPositionJoined(msg.sender, position, tokenId, block.timestamp);
        emit UnderfundedSeatCompleted(msg.sender, position, msg.value, msg.value + res.previousDepositSun);

        _distributeEntryFee(position, msg.value);

        if (daoMembers.length == MAX_MEMBERS) {
            bool allFilled = true;
            for (uint256 i = 0; i < MAX_MEMBERS; i++) {
                if (daoMembers[i] == address(0)) {
                    allFilled = false;
                    break;
                }
            }
            if (allFilled) {
                daoCompleted = true;
                emit QueueClosed(MAX_MEMBERS, block.timestamp);
            }
        }

        return position;
    }

    // ─── Registry Helper ───────────────────────────────────────────────────────

    function _registerUserInRegistry(address user) internal {
        if (address(registry) != address(0)) {
            try registry.isRegistered(user) returns (bool reg) {
                if (!reg) {
                    try registry.registerUser(user, address(0)) {} catch {}
                }
            } catch {}
        }
    }

    // ─── Re-topup (Cycle Reset & 5X Cap Renewal) ───────────────────────────────

    /**
     * @dev Allows a capped member to re-topup and begin a new 5X earning cycle.
     *      - Resets cycle lifetime earnings to 0.
     *      - Closes 48-hour retopup window (capHitTimestamp = 0).
     *      - Increments memberRetopupCount (Cycle 2, 3, etc.).
     *      - Sets new locked 5X cap pegged to the live rate at time of retopup.
     *      - Re-topup payment is distributed to all active genuine council members.
     */
    function retopup() external payable nonReentrant {
        if (!isDaoMember[msg.sender]) revert NotMember();

        // Check if 48h retopup window has passed
        if (capHitTimestamp[msg.sender] > 0 && block.timestamp > capHitTimestamp[msg.sender] + RETOPUP_WINDOW) {
            if (!slotBlank[msg.sender]) {
                _updateMemberPoolReward(msg.sender);
                slotBlank[msg.sender] = true;
                emit SlotBlanked(msg.sender, block.timestamp);
            }
            revert RetopupWindowExpired();
        }

        // Only members who have actually hit their 5X cap (or are blanked) can retopup
        if (capHitTimestamp[msg.sender] == 0 && !slotBlank[msg.sender]) {
            revert NotCapped();
        }

        if (msg.value < entryFee || msg.value < MIN_ENTRY_FEE_FLOOR) {
            revert PaymentFailed();
        }

        uint256 paidAmount = msg.value;
        totalCollected += paidAmount;

        _updateMemberPoolReward(msg.sender);

        // Reset for fresh cycle
        lifetimeEarnings[msg.sender]   = 0;
        capHitTimestamp[msg.sender]    = 0;
        slotBlank[msg.sender]          = false;
        memberRetopupCount[msg.sender] += 1;
        memberEarningsCap[msg.sender]  = paidAmount * 5; // Lock new 5X cap for the new cycle

        emit Retopup(
            msg.sender,
            memberPosition[msg.sender],
            memberEarningsCap[msg.sender],
            memberRetopupCount[msg.sender],
            block.timestamp
        );
        emit SlotReactivated(msg.sender, block.timestamp);

        _distributeRetopup(msg.sender, paidAmount);
    }

    // ─── 35% Matrix Volume Pool ────────────────────────────────────────────────

    /**
     * @dev Called by EquoraVault when routing the 35% Matrix volume pool share, or direct deposit.
     *      Instantly splits and pushes equal shares directly to active uncapped DAO members' wallets.
     */
    function receivePoolDeposit(uint256 amount) external payable nonReentrant {
        uint256 toDistribute = msg.value > 0 ? msg.value : amount;
        if (toDistribute == 0) return;

        if (msg.value == 0) {
            uint256 avail = address(this).balance > totalPullFallback ? address(this).balance - totalPullFallback : 0;
            if (toDistribute > avail) toDistribute = avail;
        }

        _distributeIncomingPoolDeposit(toDistribute);
    }

    function _distributeIncomingPoolDeposit(uint256 amount) internal {
        if (amount == 0) return;

        uint256 activeCount = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (m != address(0) && isDaoMember[m] && !slotBlank[m] && capHitTimestamp[m] == 0) {
                activeCount++;
            }
        }
        if (activeCount == 0) return;

        accPoolSharePerMember += (amount * 1e18) / activeCount;
        totalPoolReceived     += amount;

        uint256 sharePerMember = amount / activeCount;
        if (sharePerMember == 0) return;

        uint256 totalSurplus = 0;

        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (m != address(0) && isDaoMember[m] && !slotBlank[m] && capHitTimestamp[m] == 0) {
                uint256 cap = memberEarningsCap[m] > 0 ? memberEarningsCap[m] : earningsCap;
                uint256 headroom = cap > lifetimeEarnings[m] ? cap - lifetimeEarnings[m] : 0;

                if (sharePerMember <= headroom) {
                    _pushTransfer(m, sharePerMember, 0);
                    if (lifetimeEarnings[m] >= cap) {
                        _markCapHit(m);
                    }
                } else {
                    if (headroom > 0) {
                        _pushTransfer(m, headroom, 0);
                    }
                    _markCapHit(m);
                    totalSurplus += (sharePerMember - headroom);
                }
            }
        }

        if (totalSurplus > 0) {
            _redistributeSurplusToPool(daoMembers.length, address(0), totalSurplus, 0);
        }

        emit PoolDepositReceived(amount, accPoolSharePerMember, block.timestamp);
    }

    /**
     * @dev Permissionless flush function: Instantly distributes any accumulated native TROB
     *      balance in this contract equally to all active genuine Genesis DAO members' wallets.
     */
    function flushAndDistributeAccumulatedPool() external nonReentrant returns (uint256 totalDistributedToCouncil) {
        uint256 availableBal = address(this).balance > totalPullFallback ? address(this).balance - totalPullFallback : 0;
        if (availableBal == 0) return 0;

        uint256 activeCount = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (m != address(0) && isDaoMember[m] && !slotBlank[m] && capHitTimestamp[m] == 0) {
                activeCount++;
            }
        }
        if (activeCount == 0) return 0;

        uint256 sharePerMember = availableBal / activeCount;
        if (sharePerMember == 0) return 0;

        uint256 totalSurplus = 0;
        uint256 actuallyPushed = 0;

        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (m != address(0) && isDaoMember[m] && !slotBlank[m] && capHitTimestamp[m] == 0) {
                uint256 cap = memberEarningsCap[m] > 0 ? memberEarningsCap[m] : earningsCap;
                uint256 headroom = cap > lifetimeEarnings[m] ? cap - lifetimeEarnings[m] : 0;

                if (sharePerMember <= headroom) {
                    _pushTransfer(m, sharePerMember, 0);
                    actuallyPushed += sharePerMember;
                    if (lifetimeEarnings[m] >= cap) {
                        _markCapHit(m);
                    }
                } else {
                    if (headroom > 0) {
                        _pushTransfer(m, headroom, 0);
                        actuallyPushed += headroom;
                    }
                    _markCapHit(m);
                    totalSurplus += (sharePerMember - headroom);
                }
            }
        }

        if (totalSurplus > 0) {
            _redistributeSurplusToPool(daoMembers.length, address(0), totalSurplus, 0);
        }

        totalPoolDistributed += (actuallyPushed + totalSurplus);
        return (actuallyPushed + totalSurplus);
    }

    function _updateMemberPoolReward(address member) internal {
        if (!isDaoMember[member] || slotBlank[member]) return;

        uint256 accumulated = accPoolSharePerMember - memberRewardDebt[member];
        if (accumulated > 0) {
            pendingPoolShare[member] += accumulated / 1e18;
        }
        memberRewardDebt[member] = accPoolSharePerMember;
    }

    function getPendingPoolShare(address member) public view returns (uint256) {
        if (!isDaoMember[member] || slotBlank[member]) return pendingPoolShare[member];
        uint256 accumulated = accPoolSharePerMember - memberRewardDebt[member];
        return pendingPoolShare[member] + (accumulated / 1e18);
    }

    function claimPoolShare() external nonReentrant {
        if (!isDaoMember[msg.sender]) revert NotMember();
        _updateMemberPoolReward(msg.sender);

        uint256 claimable = pendingPoolShare[msg.sender];
        if (claimable == 0) revert NothingToClaim();

        pendingPoolShare[msg.sender] = 0;
        totalPoolDistributed += claimable;

        bool ok = false;
        if (address(this).balance >= claimable) {
            (bool sent, ) = payable(msg.sender).call{value: claimable}("");
            ok = sent;
        }
        if (!ok && address(paymentToken) != address(0)) {
            try paymentToken.transfer(msg.sender, claimable) returns (bool res) {
                ok = res;
            } catch {}
        }
        if (!ok) revert TransferFailed();

        emit PoolShareClaimed(msg.sender, claimable, block.timestamp);
    }

    // ─── Internal Distributions (300 / N Deterministic Model) ──────────────────

    function _distributeEntryFee(uint256 incomingPosition, uint256 amountToDistribute) internal {
        uint256 eligibleCount = 0;
        for (uint256 i = 0; i < incomingPosition; i++) {
            if (i >= daoMembers.length) break;
            address m = daoMembers[i];
            if (m != address(0) && !slotBlank[m] && capHitTimestamp[m] == 0) {
                eligibleCount++;
            }
        }

        if (eligibleCount == 0 || amountToDistribute == 0) return;

        uint256 amountPerRecipient = amountToDistribute / eligibleCount;
        if (amountPerRecipient == 0) return;

        uint256 totalSurplus = 0;

        for (uint256 i = 0; i < incomingPosition; i++) {
            if (i >= daoMembers.length) break;
            address recipient = daoMembers[i];
            if (recipient != address(0) && !slotBlank[recipient] && capHitTimestamp[recipient] == 0) {
                uint256 cap = memberEarningsCap[recipient] > 0 ? memberEarningsCap[recipient] : earningsCap;
                uint256 headroom = cap > lifetimeEarnings[recipient]
                    ? cap - lifetimeEarnings[recipient]
                    : 0;

                if (amountPerRecipient <= headroom) {
                    _pushTransfer(recipient, amountPerRecipient, incomingPosition);
                    if (lifetimeEarnings[recipient] >= cap) {
                        _markCapHit(recipient);
                    }
                } else {
                    if (headroom > 0) {
                        _pushTransfer(recipient, headroom, incomingPosition);
                    }
                    _markCapHit(recipient);
                    totalSurplus += (amountPerRecipient - headroom);
                }
            }
        }

        if (totalSurplus > 0) {
            _redistributeSurplusToPool(incomingPosition, address(0), totalSurplus, incomingPosition);
        }
    }

    function _distributeRetopup(address caller, uint256 amount) internal {
        uint256 eligibleCount = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (m != address(0) && !slotBlank[m] && capHitTimestamp[m] == 0) {
                eligibleCount++;
            }
        }

        if (eligibleCount == 0 || amount == 0) return;

        uint256 amountPerRecipient = amount / eligibleCount;
        if (amountPerRecipient == 0) return;

        uint256 totalSurplus = 0;

        for (uint256 i = 0; i < daoMembers.length; i++) {
            address recipient = daoMembers[i];
            if (recipient != address(0) && !slotBlank[recipient] && capHitTimestamp[recipient] == 0) {
                uint256 cap = memberEarningsCap[recipient] > 0 ? memberEarningsCap[recipient] : earningsCap;
                uint256 headroom = cap > lifetimeEarnings[recipient]
                    ? cap - lifetimeEarnings[recipient]
                    : 0;

                if (amountPerRecipient <= headroom) {
                    _pushTransfer(recipient, amountPerRecipient, memberPosition[caller]);
                    if (lifetimeEarnings[recipient] >= cap) {
                        _markCapHit(recipient);
                    }
                } else {
                    if (headroom > 0) {
                        _pushTransfer(recipient, headroom, memberPosition[caller]);
                    }
                    _markCapHit(recipient);
                    totalSurplus += (amountPerRecipient - headroom);
                }
            }
        }

        if (totalSurplus > 0) {
            _redistributeSurplusToPool(daoMembers.length, address(0), totalSurplus, memberPosition[caller]);
        }
    }

    function _redistributeSurplusToPool(
        uint256 maxCount,
        address excludeAddr,
        uint256 surplus,
        uint256 fromPosition
    ) internal {
        uint256 surplusRemaining = surplus;

        for (uint256 round = 0; round < 5 && surplusRemaining > 0; round++) {
            uint256 uncappedCount = 0;
            for (uint256 i = 0; i < maxCount; i++) {
                if (i >= daoMembers.length) break;
                address m = daoMembers[i];
                if (m != address(0) && m != excludeAddr && !slotBlank[m] && capHitTimestamp[m] == 0) {
                    uncappedCount++;
                }
            }

            if (uncappedCount == 0) break;

            uint256 extraShare = surplusRemaining / uncappedCount;
            if (extraShare == 0) break;

            uint256 nextSurplus = surplusRemaining % uncappedCount;

            for (uint256 i = 0; i < maxCount; i++) {
                if (i >= daoMembers.length) break;
                address recipient = daoMembers[i];
                if (recipient != address(0) && recipient != excludeAddr && !slotBlank[recipient] && capHitTimestamp[recipient] == 0) {
                    uint256 cap = memberEarningsCap[recipient] > 0 ? memberEarningsCap[recipient] : earningsCap;
                    uint256 headroom = cap > lifetimeEarnings[recipient]
                        ? cap - lifetimeEarnings[recipient]
                        : 0;

                    if (extraShare <= headroom) {
                        _pushTransfer(recipient, extraShare, fromPosition);
                        if (lifetimeEarnings[recipient] >= cap) {
                            _markCapHit(recipient);
                        }
                    } else {
                        if (headroom > 0) {
                            _pushTransfer(recipient, headroom, fromPosition);
                        }
                        _markCapHit(recipient);
                        nextSurplus += (extraShare - headroom);
                    }
                }
            }

            surplusRemaining = nextSurplus;
        }
    }

    function _pushTransfer(address recipient, uint256 amount, uint256 fromPosition) internal {
        if (amount == 0 || recipient == address(0)) return;

        uint256 debt = unearnedDebt[recipient];
        if (debt > 0) {
            if (amount <= debt) {
                unearnedDebt[recipient] = debt - amount;
                lifetimeEarnings[recipient] += amount;
                historicalTotalEarned[recipient] += amount;
                totalDistributed += amount;
                totalDebtRecovered += amount;
                emit UnearnedDebtRecovered(recipient, amount, unearnedDebt[recipient]);
                return;
            } else {
                uint256 toDeduct = debt;
                unearnedDebt[recipient] = 0;
                amount -= toDeduct;
                lifetimeEarnings[recipient] += toDeduct;
                historicalTotalEarned[recipient] += toDeduct;
                totalDistributed += toDeduct;
                totalDebtRecovered += toDeduct;
                emit UnearnedDebtRecovered(recipient, toDeduct, 0);
            }
        }

        bool ok = false;
        if (address(this).balance >= amount) {
            (bool sent, ) = payable(recipient).call{value: amount, gas: 50000}("");
            ok = sent;
        }

        if (ok) {
            lifetimeEarnings[recipient]      += amount;
            historicalTotalEarned[recipient] += amount;
            totalDistributed                 += amount;
            emit DAOPayoutPushed(recipient, amount, fromPosition, block.timestamp);
        } else {
            pullFallbackBalance[recipient]   += amount;
            totalPullFallback                += amount;
            lifetimeEarnings[recipient]      += amount;
            historicalTotalEarned[recipient] += amount;
            totalDistributed                 += amount;
            emit DAOPayoutFallback(recipient, amount, fromPosition, "Transfer fallback", block.timestamp);
        }
    }

    // ─── 48-Hour Timer Isolation & Cap Hit ────────────────────────────────────

    /**
     * @dev Strictly isolated cap-hit trigger:
     *      Guarantees that capHitTimestamp is ONLY set if member's current cycle earnings
     *      have genuinely reached or exceeded their locked 5X cap.
     *      Uncapped members NEVER have a timestamp set and are 100% immune to timers or blanking.
     */
    function _markCapHit(address member) internal {
        if (member == address(0) || slotBlank[member]) return;

        uint256 cap = memberEarningsCap[member] > 0 ? memberEarningsCap[member] : earningsCap;
        // Strict Isolation Guard: Under-cap members are strictly rejected
        if (lifetimeEarnings[member] < cap) return;

        if (capHitTimestamp[member] == 0) {
            capHitTimestamp[member] = block.timestamp;
            uint256 deadline = block.timestamp + RETOPUP_WINDOW;
            emit EarningsCapHit(member, lifetimeEarnings[member], deadline);
        }
    }

    function claimFallback() external nonReentrant {
        if (!isDaoMember[msg.sender]) revert NotMember();
        uint256 amount = pullFallbackBalance[msg.sender];
        if (amount == 0) revert NothingToClaim();

        pullFallbackBalance[msg.sender] = 0;
        totalPullFallback -= amount;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        if (!sent) revert TransferFailed();

        emit FallbackClaimed(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Public function to blank slots of members who exceeded the 48-hour retopup window.
     */
    function enforceCapExpirations() external {
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address member = daoMembers[i];
            if (
                member != address(0) &&
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

    /**
     * @dev Allows admin to sweep recovered unearned debt and protocol surplus.
     *      User fallback balances are strictly protected by totalPullFallback.
     */
    function withdrawRecoveredSurplus(address payable to, uint256 amount) external onlyAdmin {
        require(to != address(0), "Invalid recipient");
        uint256 available = address(this).balance > totalPullFallback
            ? address(this).balance - totalPullFallback
            : 0;
        require(amount <= available, "Amount exceeds available surplus");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Withdraw failed");
        emit RecoveredSurplusWithdrawn(to, amount, block.timestamp);
    }

    // ─── View Functions (100% Backward-Compatible) ─────────────────────────────

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
     * @dev Extended view for V3 providing cycle and locked per-member 5X cap details.
     */
    function getMemberExtendedDetails(address user)
        external view
        returns (
            bool    isMember,
            uint256 position,
            uint256 currentCycleEarned,
            uint256 specificEarningsCap,
            uint256 retopupCount,
            uint256 cumulativeAllTimeEarned,
            bool    isCapped,
            uint256 retopupDeadline,
            bool    isBlank
        )
    {
        isMember               = isDaoMember[user];
        position               = memberPosition[user];
        currentCycleEarned     = lifetimeEarnings[user];
        specificEarningsCap    = memberEarningsCap[user] > 0 ? memberEarningsCap[user] : earningsCap;
        retopupCount           = memberRetopupCount[user];
        cumulativeAllTimeEarned= historicalTotalEarned[user];
        isCapped               = capHitTimestamp[user] > 0;
        retopupDeadline        = capHitTimestamp[user] > 0 ? capHitTimestamp[user] + RETOPUP_WINDOW : 0;
        isBlank                = slotBlank[user];
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
        uint256 blanks = 0;
        uint256 active = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (m == address(0) || slotBlank[m]) {
                blanks++;
            } else {
                active++;
            }
        }

        return (
            active,
            totalCollected,
            totalDistributed,
            daoCompleted,
            false,
            SEAT_WINDOW,
            active,
            blanks,
            totalPoolReceived,
            totalPoolDistributed
        );
    }

    function getRemainingPositions() external view returns (uint256) {
        if (daoCompleted) return 0;
        uint256 occupied = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            if (daoMembers[i] != address(0) && !slotBlank[daoMembers[i]]) {
                occupied++;
            }
        }
        if (occupied >= MAX_MEMBERS) return 0;
        return MAX_MEMBERS - occupied;
    }

    function getAllMembers() external view returns (address[] memory) {
        return daoMembers;
    }

    function isClosed() external view returns (bool) {
        return daoCompleted;
    }

    function getLaunchTimestamp() external view returns (uint256) {
        return daoLaunchTimestamp;
    }

    /**
     * @dev 48-Hour Timer Isolation:
     *      Returns remaining seconds in the 48-hour retopup window.
     *      Strictly returns 0 for any member who has NOT hit their 5X cap (capHitTimestamp == 0).
     */
    function retopupTimeRemaining(address member) external view returns (uint256) {
        if (capHitTimestamp[member] == 0) return 0;
        uint256 deadline = capHitTimestamp[member] + RETOPUP_WINDOW;
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }

    /**
     * @dev 48-Hour Timer Isolation:
     *      Returns true ONLY if member's 48-hour retopup window is currently open and ticking.
     *      Returns FALSE for all active uncapped members.
     */
    function isRetopupWindowActive(address member) external view returns (bool) {
        if (capHitTimestamp[member] == 0 || slotBlank[member]) return false;
        return block.timestamp <= capHitTimestamp[member] + RETOPUP_WINDOW;
    }

    /**
     * @dev 48-Hour Timer Isolation:
     *      Returns true ONLY if member has reached their 5X cap and exceeded the 48-hour window without retopup.
     *      Returns FALSE for all active uncapped members.
     */
    function isRetopupWindowExpired(address member) external view returns (bool) {
        if (capHitTimestamp[member] == 0) return false;
        return block.timestamp > capHitTimestamp[member] + RETOPUP_WINDOW;
    }
}

