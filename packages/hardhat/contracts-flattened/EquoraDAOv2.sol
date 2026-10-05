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


// File contracts/interfaces/IEquoraRegistry.sol

// Original license: SPDX_License_Identifier: MIT

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


// File contracts/core/EquoraDAOv2.sol

// Original license: SPDX_License_Identifier: MIT



/**
 * @title EquoraDAOv2
 * @dev Genesis DAO v2 — 100-seat founding council on the Equora.Fi platform.
 *
 * Patched & Hardened:
 *   1. Strict Floor Check: Reverts if msg.value < entryFee or < 4,500 TROB ($300 USD floor).
 *   2. Genuine Member Migration: Safely imports all 84 genuine members (1-84/active/capped) with their exact seats.
 *   3. Underfunded Quarantine: 8 underfunded wallets are quarantined from dividend distributions.
 *   4. Re-topup Credit: Underfunded members can call completeUnderfundedSeat() to pay the remaining
 *      delta (e.g. 5,357.14 - 1.5 TROB) to activate their seat and join the council.
 */
contract EquoraDAOv2 is ReentrancyGuard {

    // ─── Constants ─────────────────────────────────────────────────────────────

    uint256 public constant ENTRY_FEE_USD          = 300_000_000;   // $300 USD (6 decimals)
    uint256 public constant EARNINGS_CAP_USD       = 1_500_000_000; // $1,500 USD (6 decimals)
    uint256 public constant MIN_ENTRY_FEE_FLOOR    = 4500 * 10 ** 6; // 4,500 TROB minimum floor

    uint256 public constant MAX_MEMBERS            = 100;
    uint256 public constant SEAT_WINDOW            = 21 days;
    uint256 public constant RETOPUP_WINDOW         = 48 hours;

    string public constant OFFICIAL_SR_BASE58      = "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
    uint256 public constant MIN_WALLET_CREATION_DATE = 1790812800;
    uint256 public constant DAO_TARGET_FREE_TX_PER_DAY = 50;
    uint256 public constant MATRIX_TARGET_FREE_TX_PER_DAY = 5;

    // ─── Admin (Renounceable) ──────────────────────────────────────────────────

    address public admin;

    // ─── Dependencies ──────────────────────────────────────────────────────────

    IERC20              public immutable paymentToken;
    IEquoraRegistry     public immutable registry;
    address             public vaultContract;

    // ─── Dynamic Price State ───────────────────────────────────────────────────

    uint256 public entryFee                 = 5357140000; // ~5,357.14 TROB (at ~$0.056/TROB)
    uint256 public earningsCap              = 26785700000; // 5x entry fee
    uint256 public lastTrobPriceUsd6        = 56000;      // $0.056 (6 decimals)
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

    // Earnings tracking
    mapping(address => uint256) public lifetimeEarnings;
    mapping(address => uint256) public capHitTimestamp;
    mapping(address => bool)    public slotBlank;

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
    event Retopup(address indexed member, uint256 position, uint256 timestamp);
    event PoolDepositReceived(uint256 amount, uint256 accPerMember, uint256 timestamp);
    event PoolShareClaimed(address indexed member, uint256 amount, uint256 timestamp);
    event EntryFeeUpdated(uint256 newEntryFee, uint256 newEarningsCap, uint256 trobPriceUsd6, uint256 timestamp);
    event EligibilityAttested(address indexed account, bool eligible, uint256 timestamp);
    event EligibilityEnforcementUpdated(bool enforced, uint256 timestamp);
    event AdminRenounced(address indexed previousAdmin, uint256 timestamp);
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
        require(_paymentToken != address(0), "EquoraDAO: Invalid token");
        require(_registry     != address(0), "EquoraDAO: Invalid registry");

        admin        = msg.sender;
        paymentToken = IERC20(_paymentToken);
        registry     = IEquoraRegistry(_registry);

        daoLaunchTimestamp = block.timestamp;
        lastJoinTimestamp  = block.timestamp;
    }

    function setVaultContract(address _vault) external onlyAdmin {
        require(vaultContract == address(0), "EquoraDAO: vault already set");
        require(_vault != address(0), "EquoraDAO: invalid vault");
        vaultContract = _vault;
        emit VaultContractSet(_vault);
    }

    // ─── Migration Setup ───────────────────────────────────────────────────────

    /**
     * @dev Safely migrates genuine members in batches without pushing dividends.
     *      Assigns their exact seats and mints Soulbound Membership NFTs.
     *      Fills intervening gaps with address(0) to maintain exact 1-to-1 seat indexing.
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
            if (isDaoMember[m]) continue; // Skip if already migrated

            while (daoMembers.length < pos) {
                daoMembers.push(address(0));
            }

            daoMembers[pos - 1] = m;
            isDaoMember[m] = true;
            memberPosition[m] = pos;
            lifetimeEarnings[m] = earned;
            memberRewardDebt[m] = accPoolSharePerMember;

            _registerUserInRegistry(m);

            uint256 tokenId = pos;
            emit DAOPositionJoined(m, pos, tokenId, block.timestamp);

            if (earned >= earningsCap) {
                _markCapHit(m);
            }
        }
        lastJoinTimestamp = block.timestamp;
        emit GenuineMembersMigrated(_members.length, block.timestamp);
    }

    /**
     * @dev Configure underfunded reservations so their 1.5 or 5.0 TROB credits are permanently saved.
     *      Sets the 48-hour reservation deadline on-chain.
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

    // ─── Entry Fee Management ──────────────────────────────────────────────────

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

    receive() external payable {}

    // ─── Core Join Function (Patched with Hard Security Floor) ─────────────────

    function joinDAO() external payable nonReentrant returns (uint256 position) {
        if (isDaoMember[msg.sender]) revert AlreadyMember();
        if (eligibilityEnforced && !isEligibilityAttested[msg.sender]) revert NotQualified();

        // STRICT SECURITY FLOOR: Must pay full entry fee and at least MIN_ENTRY_FEE_FLOOR
        if (msg.value < entryFee || msg.value < MIN_ENTRY_FEE_FLOOR) {
            revert PaymentFailed();
        }

        // 1. Scan for any vacant slot (expired retopup member OR expired reservation where daoMembers[i] == address(0))
        uint256 vacantIndex = type(uint256).max;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (m == address(0)) {
                // If 48h reservation deadline has passed, this vacant slot is now open to anyone!
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
                isDaoMember[oldMember]      = false;
                slotBlank[oldMember]        = false;
                capHitTimestamp[oldMember]  = 0;
                memberPosition[oldMember]   = 0;
                lifetimeEarnings[oldMember] = 0;
                memberRewardDebt[oldMember] = 0;
            }

            daoMembers[vacantIndex]     = msg.sender;
            isDaoMember[msg.sender]     = true;
            memberPosition[msg.sender]  = position;
            memberRewardDebt[msg.sender] = accPoolSharePerMember;
            lastJoinTimestamp           = block.timestamp;

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
        isDaoMember[msg.sender]    = true;
        memberPosition[msg.sender] = position;

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

    /**
     * @dev Allows an underfunded wallet to pay their remaining deficit to claim their seat.
     *      Their previous deposit is credited towards the $300 entry fee.
     *      Upon payment, they are minted their NFT, assigned their seat, and join the council!
     */
    function completeUnderfundedSeat() external payable nonReentrant returns (uint256 position) {
        UnderfundedReservation memory res = underfundedReservations[msg.sender];
        if (!res.isReserved) revert InvalidReservation();
        if (isDaoMember[msg.sender]) revert AlreadyMember();

        uint256 requiredDelta = entryFee > res.previousDepositSun ? entryFee - res.previousDepositSun : 0;
        if (requiredDelta < (MIN_ENTRY_FEE_FLOOR > res.previousDepositSun ? MIN_ENTRY_FEE_FLOOR - res.previousDepositSun : 0)) {
            requiredDelta = MIN_ENTRY_FEE_FLOOR - res.previousDepositSun;
        }

        if (msg.value < requiredDelta) revert PaymentFailed();

        // Clear reservation
        underfundedReservations[msg.sender].isReserved = false;

        position = res.reservedSeat;
        uint256 memberIdx = position - 1;

        while (daoMembers.length < position) {
            daoMembers.push(address(0));
        }

        daoMembers[memberIdx]       = msg.sender;
        isDaoMember[msg.sender]     = true;
        memberPosition[msg.sender]  = position;
        unearnedDebt[msg.sender]    = res.unearnedDebtSun;
        lifetimeEarnings[msg.sender] = res.unearnedDebtSun;
        memberRewardDebt[msg.sender] = accPoolSharePerMember;
        totalCollected += (msg.value + res.previousDepositSun);

        _registerUserInRegistry(msg.sender);

        uint256 tokenId = position;
        emit DAOPositionJoined(msg.sender, position, tokenId, block.timestamp);
        emit UnderfundedSeatCompleted(msg.sender, position, msg.value, msg.value + res.previousDepositSun);

        // Distribute entry fee to all active genuine members
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

    // ─── Re-topup (5X Cap Reset) ───────────────────────────────────────────────

    function retopup() external payable nonReentrant {
        if (!isDaoMember[msg.sender]) revert NotMember();

        if (capHitTimestamp[msg.sender] > 0 && block.timestamp > capHitTimestamp[msg.sender] + RETOPUP_WINDOW) {
            if (!slotBlank[msg.sender]) {
                _updateMemberPoolReward(msg.sender);
                slotBlank[msg.sender] = true;
                emit SlotBlanked(msg.sender, block.timestamp);
            }
            revert RetopupWindowExpired();
        }

        if (capHitTimestamp[msg.sender] == 0 && !slotBlank[msg.sender]) {
            revert NotCapped();
        }

        if (msg.value < entryFee || msg.value < MIN_ENTRY_FEE_FLOOR) {
            revert PaymentFailed();
        }

        uint256 paidAmount = msg.value;
        totalCollected += paidAmount;

        _updateMemberPoolReward(msg.sender);

        lifetimeEarnings[msg.sender] = 0;
        capHitTimestamp[msg.sender]  = 0;
        slotBlank[msg.sender]        = false;

        emit Retopup(msg.sender, memberPosition[msg.sender], block.timestamp);
        emit SlotReactivated(msg.sender, block.timestamp);

        _distributeRetopup(msg.sender, paidAmount);
    }

    // ─── 35% Matrix Volume Pool ────────────────────────────────────────────────

    function receivePoolDeposit(uint256 amount) external nonReentrant {
        require(msg.sender == vaultContract, "Only vault");
        require(amount > 0, "Amount must be > 0");

        bool ok = paymentToken.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();

        uint256 activeCount = 0;
        for (uint256 i = 0; i < daoMembers.length; i++) {
            address m = daoMembers[i];
            if (isDaoMember[m] && !slotBlank[m]) activeCount++;
        }
        if (activeCount == 0) return;

        accPoolSharePerMember += (amount * 1e18) / activeCount;
        totalPoolReceived += amount;

        emit PoolDepositReceived(amount, accPoolSharePerMember, block.timestamp);
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

        bool ok = paymentToken.transfer(msg.sender, claimable);
        if (!ok) revert TransferFailed();

        emit PoolShareClaimed(msg.sender, claimable, block.timestamp);
    }

    // ─── Internal Distributions ────────────────────────────────────────────────

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
                uint256 headroom = earningsCap > lifetimeEarnings[recipient]
                    ? earningsCap - lifetimeEarnings[recipient]
                    : 0;

                if (amountPerRecipient <= headroom) {
                    _pushTransfer(recipient, amountPerRecipient, incomingPosition);
                    if (lifetimeEarnings[recipient] >= earningsCap) {
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
                uint256 headroom = earningsCap > lifetimeEarnings[recipient]
                    ? earningsCap - lifetimeEarnings[recipient]
                    : 0;

                if (amountPerRecipient <= headroom) {
                    _pushTransfer(recipient, amountPerRecipient, memberPosition[caller]);
                    if (lifetimeEarnings[recipient] >= earningsCap) {
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
                    uint256 headroom = earningsCap > lifetimeEarnings[recipient]
                        ? earningsCap - lifetimeEarnings[recipient]
                        : 0;

                    if (extraShare <= headroom) {
                        _pushTransfer(recipient, extraShare, fromPosition);
                        if (lifetimeEarnings[recipient] >= earningsCap) {
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
                totalDistributed += amount;
                totalDebtRecovered += amount;
                emit UnearnedDebtRecovered(recipient, amount, unearnedDebt[recipient]);
                return;
            } else {
                uint256 toDeduct = debt;
                unearnedDebt[recipient] = 0;
                amount -= toDeduct;
                lifetimeEarnings[recipient] += toDeduct;
                totalDistributed += toDeduct;
                totalDebtRecovered += toDeduct;
                emit UnearnedDebtRecovered(recipient, toDeduct, 0);
            }
        }

        bool ok = false;
        if (address(this).balance >= amount) {
            (bool sent, ) = payable(recipient).call{value: amount, gas: 10000}("");
            ok = sent;
        }

        if (ok) {
            lifetimeEarnings[recipient] += amount;
            totalDistributed            += amount;
            emit DAOPayoutPushed(recipient, amount, fromPosition, block.timestamp);
        } else {
            pullFallbackBalance[recipient] += amount;
            totalPullFallback              += amount;
            lifetimeEarnings[recipient]    += amount;
            totalDistributed               += amount;
            emit DAOPayoutFallback(recipient, amount, fromPosition, "Transfer fallback", block.timestamp);
        }
    }

    function _markCapHit(address member) internal {
        if (capHitTimestamp[member] == 0 && !slotBlank[member]) {
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
     * @dev Public function to blank expired cap slots.
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

    // ─── View Functions ────────────────────────────────────────────────────────

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

    function retopupTimeRemaining(address member) external view returns (uint256) {
        if (capHitTimestamp[member] == 0) return 0;
        uint256 deadline = capHitTimestamp[member] + RETOPUP_WINDOW;
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }
}
