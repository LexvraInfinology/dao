// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IEquoraRegistry.sol";

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
