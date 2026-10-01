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


// File contracts/core/EquoraVault.sol

// Original license: SPDX_License_Identifier: MIT



/**
 * @title EquoraVault
 * @dev Central deposit router for the Equora.Fi platform.
 *
 * === ROLE ====================================================================
 *   Every user deposit (registration + slot purchase) flows through this contract.
 *   It splits the incoming TROB into 4 buckets:
 *
 *     35%  → Ecosystem & DAO Pool  (EquoraDAO — distributed to 100 Genesis DAO Seat holders)
 *     40%  → Salary Pool           (EquoraSalaryPool — paid out on 11th of each month)
 *     10%  → Magic Blind Box       (EquoraMagicBox — quarterly shared lottery pool)
 *     15%  → Level Rewards         (EquoraRewardPool — instant one-time milestone payouts)
 *
 * === ADDITIONAL ROUTE ========================================================
 *   - routePoolDeposit(amount): Called by EquoraMatrix when P4/P5/P14 positions
 *     are filled. The matrix transfers TROB to vault, vault splits it to pools.
 *     This ensures 100% of P4+P5+P14 node fees go to the 4 protocol pools.
 *
 * === DESIGN PRINCIPLES =======================================================
 *   - Fully trustless: no owner pause/stop functions once deployed
 *   - 100% accounting: every wei is routed, nothing held in this contract
 *   - Reentrancy-protected on all state-changing paths
 */
contract EquoraVault is ReentrancyGuard {

    // ─── Constants ─────────────────────────────────────────────────────────────

    uint256 public constant TIER_STANDARD = 30  * 10 ** 18; // 30 TROB
    uint256 public constant TIER_DAO      = 300 * 10 ** 18; // 300 TROB (DAO tier per logics.xlsx)

    uint256 public constant DAO_BPS      = 3500;  // 35%
    uint256 public constant SALARY_BPS   = 4000;  // 40%
    uint256 public constant MAGICBOX_BPS = 1000;  // 10%
    uint256 public constant REWARDS_BPS  = 1500;  // 15%
    uint256 public constant BPS_BASE     = 10000;

    // ─── Interfaces ────────────────────────────────────────────────────────────

    IERC20          public immutable paymentToken;
    IEquoraRegistry public immutable registry;

    // Pool contract addresses (set once after deployment via initialize())
    address public daoPool;
    address public salaryPool;
    address public magicBoxPool;
    address public rewardsPool;
    bool    public initialized;

    // Authorized callers for routePoolDeposit (EquoraMatrix)
    address public matrixContract;

    // ─── Global Stats ──────────────────────────────────────────────────────────

    uint256 public totalRoutedFromMatrix; // total TROB forwarded by EquoraMatrix P4/P5/P14
    uint256 public totalRoutedFromUsers;  // total TROB from user registrations

    // ─── Events ────────────────────────────────────────────────────────────────

    event DepositRouted(
        address indexed user,
        uint256 totalAmount,
        uint256 daoAmount,
        uint256 salaryAmount,
        uint256 magicBoxAmount,
        uint256 rewardsAmount,
        uint256 timestamp
    );
    event PoolDepositRouted(
        uint256 totalAmount,
        uint256 daoAmount,
        uint256 salaryAmount,
        uint256 magicBoxAmount,
        uint256 rewardsAmount,
        uint256 timestamp
    );
    event UserRegistered(
        address indexed user,
        uint32  referralCode,
        uint8   tier,
        uint256 timestamp
    );
    event Initialized(
        address dao,
        address salary,
        address magicBox,
        address rewards
    );
    event MatrixContractSet(address indexed matrix);

    // ─── Errors ────────────────────────────────────────────────────────────────

    error AlreadyInitialized();
    error NotInitialized();
    error InvalidDepositAmount();
    error AlreadyRegistered();
    error Unauthorized();

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor(address _paymentToken, address _registry) {
        require(_paymentToken != address(0), "EquoraVault: Invalid token");
        require(_registry     != address(0), "EquoraVault: Invalid registry");
        paymentToken = IERC20(_paymentToken);
        registry     = IEquoraRegistry(_registry);
    }

    // ─── One-Time Initialization ───────────────────────────────────────────────

    /**
     * @dev Set the 4 pool contract addresses. Called ONCE after deploying all contracts.
     *      After this is called, the vault routing is locked in.
     */
    function initialize(
        address _daoPool,
        address _salaryPool,
        address _magicBoxPool,
        address _rewardsPool
    ) external {
        if (initialized) revert AlreadyInitialized();
        require(_daoPool      != address(0), "EquoraVault: Invalid dao");
        require(_salaryPool   != address(0), "EquoraVault: Invalid salary");
        require(_magicBoxPool != address(0), "EquoraVault: Invalid magicbox");
        require(_rewardsPool  != address(0), "EquoraVault: Invalid rewards");

        daoPool      = _daoPool;
        salaryPool   = _salaryPool;
        magicBoxPool = _magicBoxPool;
        rewardsPool  = _rewardsPool;
        initialized  = true;

        emit Initialized(_daoPool, _salaryPool, _magicBoxPool, _rewardsPool);
    }

    /**
     * @dev Set the EquoraMatrix contract address (authorized to call routePoolDeposit).
     *      Called once during deployment wiring.
     */
    function setMatrixContract(address _matrix) external {
        // Can only be set once (before it's set to address(0))
        require(matrixContract == address(0), "EquoraVault: matrix already set");
        require(_matrix != address(0), "EquoraVault: Invalid matrix");
        matrixContract = _matrix;
        emit MatrixContractSet(_matrix);
    }

    // ─── Primary Entry Point: User Registration ────────────────────────────────

    /**
     * @dev Register a new user and route their deposit to the 4 pools.
     *
     * @param sponsorCode  5-digit referral code of the sponsor (0 = none / use root)
     * @param amount       Must be TIER_STANDARD (30 TROB) or TIER_DAO (300 TROB)
     */
    function register(uint32 sponsorCode, uint256 amount) external nonReentrant {
        if (!initialized)                                    revert NotInitialized();
        if (amount != TIER_STANDARD && amount != TIER_DAO)  revert InvalidDepositAmount();
        if (registry.isRegistered(msg.sender))              revert AlreadyRegistered();

        // 1. Pull TROB from user
        bool ok = paymentToken.transferFrom(msg.sender, address(this), amount);
        require(ok, "EquoraVault: Transfer failed");

        // 2. Register user in EquoraRegistry (assigns 5-digit code, records sponsor)
        registry.registerUser(msg.sender, sponsorCode);

        // 3. Route deposit into 4 buckets
        _routeUser(msg.sender, amount);

        totalRoutedFromUsers += amount;

        uint8 tier = amount == TIER_DAO ? 2 : 1;
        emit UserRegistered(msg.sender, registry.getCodeByUser(msg.sender), tier, block.timestamp);
    }

    // ─── Matrix Pool Route (P4 / P5 / P14) ────────────────────────────────────

    /**
     * @dev Called by EquoraMatrix when P4, P5, or P14 positions are filled.
     *      The matrix contract must pre-approve and transfer TROB to this vault,
     *      then this function routes it to the 4 protocol pools.
     *
     *      Only callable by the authorized matrixContract address.
     *
     * @param amount  Amount of TROB already transferred to this vault by the matrix
     */
    function routePoolDeposit(uint256 amount) external nonReentrant {
        if (!initialized) revert NotInitialized();
        if (msg.sender != matrixContract) revert Unauthorized();
        require(amount > 0, "EquoraVault: Zero amount");

        // TROB is already in this contract (transferred by EquoraMatrix via transfer())
        _routeToAllPools(amount);

        totalRoutedFromMatrix += amount;

        // Notify MagicBox to add to shared pool
        try IEquoraMagicBox(magicBoxPool).addToPool((amount * MAGICBOX_BPS) / BPS_BASE) {} catch {}
        // Notify DAO of 35% pool share deposit
        uint256 sAmt = (amount * SALARY_BPS)   / BPS_BASE;
        uint256 mAmt = (amount * MAGICBOX_BPS) / BPS_BASE;
        uint256 rAmt = (amount * REWARDS_BPS)  / BPS_BASE;
        uint256 dAmt = amount - sAmt - mAmt - rAmt;
        try IEquoraDAO(daoPool).receivePoolDeposit(dAmt) {} catch {}
        try IEquoraRewardPool(rewardsPool).receiveDeposit(rAmt) {} catch {}
        try IEquoraSalaryPool(salaryPool).receivePoolDeposit(sAmt) {} catch {}

        emit PoolDepositRouted(
            amount,
            dAmt,
            sAmt,
            mAmt,
            rAmt,
            block.timestamp
        );
    }

    // ─── Internal Routing ──────────────────────────────────────────────────────

    /**
     * @dev Route user deposit into 4 buckets and notify pools.
     *      35% DAO | 40% Salary | 10% MagicBox | 15% Rewards
     *      DAO gets any rounding dust.
     */
    function _routeUser(address user, uint256 amount) internal {
        uint256 salaryAmount   = (amount * SALARY_BPS)   / BPS_BASE;
        uint256 magicBoxAmount = (amount * MAGICBOX_BPS) / BPS_BASE;
        uint256 rewardsAmount  = (amount * REWARDS_BPS)  / BPS_BASE;
        uint256 daoAmount      = amount - salaryAmount - magicBoxAmount - rewardsAmount;

        _sendToPool(daoPool,      daoAmount,      "EquoraVault: DAO transfer failed");
        _sendToPool(salaryPool,   salaryAmount,   "EquoraVault: Salary transfer failed");
        _sendToPool(magicBoxPool, magicBoxAmount, "EquoraVault: MagicBox transfer failed");
        _sendToPool(rewardsPool,  rewardsAmount,  "EquoraVault: Rewards transfer failed");

        // Notify DAO of 35% pool share deposit
        try IEquoraDAO(daoPool).receivePoolDeposit(daoAmount) {} catch {}
        // Notify RewardPool to sync pool balance
        try IEquoraRewardPool(rewardsPool).receiveDeposit(rewardsAmount) {} catch {}

        // Notify Salary pool to credit this user's contribution (for rank tracking)
        try IEquoraSalaryPool(salaryPool).creditUser(user, salaryAmount) {} catch {}
        // Notify MagicBox to register this user as eligible + add to pool
        try IEquoraMagicBox(magicBoxPool).addEligibleUser(user) {} catch {}
        try IEquoraMagicBox(magicBoxPool).addToPool(magicBoxAmount) {} catch {}

        emit DepositRouted(user, amount, daoAmount, salaryAmount, magicBoxAmount, rewardsAmount, block.timestamp);
    }

    /**
     * @dev Route pool deposit (from matrix P4/P5/P14) into 4 buckets.
     *      No user-specific notifications (salary credit, eligibility).
     */
    function _routeToAllPools(uint256 amount) internal {
        uint256 salaryAmount   = (amount * SALARY_BPS)   / BPS_BASE;
        uint256 magicBoxAmount = (amount * MAGICBOX_BPS) / BPS_BASE;
        uint256 rewardsAmount  = (amount * REWARDS_BPS)  / BPS_BASE;
        uint256 daoAmount      = amount - salaryAmount - magicBoxAmount - rewardsAmount;

        _sendToPool(daoPool,      daoAmount,      "EquoraVault: DAO transfer failed");
        _sendToPool(salaryPool,   salaryAmount,   "EquoraVault: Salary transfer failed");
        _sendToPool(magicBoxPool, magicBoxAmount, "EquoraVault: MagicBox transfer failed");
        _sendToPool(rewardsPool,  rewardsAmount,  "EquoraVault: Rewards transfer failed");
    }

    function _sendToPool(address pool, uint256 amount, string memory errMsg) internal {
        bool ok = paymentToken.transfer(pool, amount);
        require(ok, errMsg);
    }

    // ─── View Helpers ──────────────────────────────────────────────────────────

    /**
     * @dev Preview the 4-bucket split for a given deposit amount.
     */
    function previewSplit(uint256 amount)
        external
        pure
        returns (
            uint256 daoAmount,
            uint256 salaryAmount,
            uint256 magicBoxAmount,
            uint256 rewardsAmount
        )
    {
        salaryAmount   = (amount * SALARY_BPS)   / BPS_BASE;
        magicBoxAmount = (amount * MAGICBOX_BPS) / BPS_BASE;
        rewardsAmount  = (amount * REWARDS_BPS)  / BPS_BASE;
        daoAmount      = amount - salaryAmount - magicBoxAmount - rewardsAmount;
    }

    function getStats() external view returns (
        uint256 fromMatrix,
        uint256 fromUsers,
        uint256 total
    ) {
        return (totalRoutedFromMatrix, totalRoutedFromUsers, totalRoutedFromMatrix + totalRoutedFromUsers);
    }
}

// ─── Minimal Interfaces for Cross-Contract Calls ──────────────────────────────

interface IEquoraMagicBox {
    function addToPool(uint256 amount) external;
    function addEligibleUser(address user) external;
}

interface IEquoraSalaryPool {
    function creditUser(address user, uint256 salaryContribution) external;
    function receivePoolDeposit(uint256 amount) external;
}

interface IEquoraDAO {
    function receivePoolDeposit(uint256 amount) external;
}

interface IEquoraRewardPool {
    function receiveDeposit(uint256 amount) external;
}
