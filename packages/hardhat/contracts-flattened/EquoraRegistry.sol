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


// File contracts/core/EquoraRegistry.sol

// Original license: SPDX_License_Identifier: MIT


/**
 * @title EquoraRegistry
 * @dev Central user registry for Equora.Fi platform.
 *
 * Key Features:
 *   - 5-digit unique referral code (10000–99999) auto-generated on registration
 *   - registerUser() accepts referral CODE (uint32) instead of sponsor address
 *   - Bi-directional mapping: code → address, address → code
 *   - 2-referral qualification for matrix earnings
 *   - Sponsor genealogy tree
 *   - Root fallback for invalid sponsors
 *   - Authorized-contract pattern (only Matrix/DAO can call registerUser)
 */
contract EquoraRegistry is IEquoraRegistry, Ownable {

    // ─── Data Structures ──────────────────────────────────────────────────────

    struct User {
        bool     isRegistered;
        address  sponsor;
        uint256  registrationTimestamp;
        uint256  directReferralsCount;
        uint256  id;
        uint32   referralCode;      // 5-digit code (10000–99999)
    }

    // ─── Constants ────────────────────────────────────────────────────────────

    uint32 public constant CODE_MIN = 10000;
    uint32 public constant CODE_MAX = 99999;

    // ─── State Variables ──────────────────────────────────────────────────────

    address public root;
    address public vaultContract;    // EquoraVault — primary authorized caller
    address public daoContract;      // EquoraDAO
    address public matrixContract;   // EquoraMatrix

    mapping(address => User)         private _users;
    mapping(address => address[])    private _directReferrals;
    mapping(uint32  => address)      public  codeToUser;          // 5-digit code → wallet
    mapping(address => uint32)       public  userToCode;          // wallet → 5-digit code

    address[]  public userList;
    uint256    public totalUsers;
    uint256    private _nonce;       // internal entropy for code generation

    // ─── Events ───────────────────────────────────────────────────────────────

    event UserRegistered(
        address indexed user,
        address indexed sponsor,
        uint256 indexed userId,
        uint32  referralCode,
        uint256 timestamp
    );
    event ContractsAuthorized(address indexed vault, address indexed dao, address indexed matrix);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error Unauthorized();
    error AlreadyRegistered();
    error InvalidUser();
    error InvalidCode();

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyAuthorized() {
        if (
            msg.sender != owner() &&
            msg.sender != vaultContract &&
            msg.sender != daoContract &&
            msg.sender != matrixContract
        ) revert Unauthorized();
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param _root The genesis/root wallet address (platform founder's wallet)
     */
    constructor(address _root) Ownable(msg.sender) {
        require(_root != address(0), "EquoraRegistry: Invalid root");
        root = _root;

        // Auto-register root as user #1 with a fixed code 10000
        totalUsers++;
        _nonce++;
        uint32 rootCode = CODE_MIN; // 10000 reserved for root
        _users[_root] = User({
            isRegistered:          true,
            sponsor:               address(0),
            registrationTimestamp: block.timestamp,
            directReferralsCount:  0,
            id:                    totalUsers,
            referralCode:          rootCode
        });
        codeToUser[rootCode] = _root;
        userToCode[_root]    = rootCode;
        userList.push(_root);

        emit UserRegistered(_root, address(0), totalUsers, rootCode, block.timestamp);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setAuthorizedContracts(
        address _vaultContract,
        address _daoContract,
        address _matrixContract
    ) external onlyOwner {
        if (_vaultContract != address(0)) vaultContract = _vaultContract;
        if (_daoContract   != address(0)) daoContract   = _daoContract;
        if (_matrixContract!= address(0)) matrixContract= _matrixContract;
        emit ContractsAuthorized(_vaultContract, _daoContract, _matrixContract);
    }

    // ─── Core Registration ────────────────────────────────────────────────────

    /**
     * @dev Register a new user with sponsor address. Called by Matrix or DAO.
     */
    function registerUser(address user, address sponsor) external onlyAuthorized returns (bool) {
        if (user == address(0)) revert InvalidUser();
        if (_users[user].isRegistered) revert AlreadyRegistered();

        address validSponsor = (sponsor != address(0) && _users[sponsor].isRegistered && sponsor != user) ? sponsor : root;
        uint32 newCode = _generateUniqueCode(user);

        totalUsers++;
        _users[user] = User({
            isRegistered:          true,
            sponsor:               validSponsor,
            registrationTimestamp: block.timestamp,
            directReferralsCount:  0,
            id:                    totalUsers,
            referralCode:          newCode
        });

        _users[validSponsor].directReferralsCount++;
        _directReferrals[validSponsor].push(user);
        codeToUser[newCode] = user;
        userToCode[user]    = newCode;
        userList.push(user);

        emit UserRegistered(user, validSponsor, totalUsers, newCode, block.timestamp);
        return true;
    }

    /**
     * @dev Register a new user with 5-digit code. Called by EquoraVault.
     */
    function registerUser(address user, uint32 sponsorCode) external onlyAuthorized returns (bool) {
        if (user == address(0)) revert InvalidUser();
        if (_users[user].isRegistered) revert AlreadyRegistered();

        // Resolve sponsor from code
        address sponsor = _resolveSponsor(sponsorCode, user);

        // Generate unique 5-digit code for this new user
        uint32 newCode = _generateUniqueCode(user);

        totalUsers++;
        _users[user] = User({
            isRegistered:          true,
            sponsor:               sponsor,
            registrationTimestamp: block.timestamp,
            directReferralsCount:  0,
            id:                    totalUsers,
            referralCode:          newCode
        });

        _users[sponsor].directReferralsCount++;
        _directReferrals[sponsor].push(user);
        codeToUser[newCode] = user;
        userToCode[user]    = newCode;
        userList.push(user);

        emit UserRegistered(user, sponsor, totalUsers, newCode, block.timestamp);
        return true;
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    /**
     * @dev Resolve a sponsor address from a 5-digit code.
     *      Falls back to root if code is 0, out of range, or unregistered.
     */
    function _resolveSponsor(uint32 code, address user) internal view returns (address) {
        if (code == 0 || code < CODE_MIN || code > CODE_MAX) return root;
        address candidate = codeToUser[code];
        if (candidate == address(0) || candidate == user || !_users[candidate].isRegistered) {
            return root;
        }
        return candidate;
    }

    /**
     * @dev Generate a unique 5-digit referral code for a new user.
     *      Uses keccak256 entropy with nonce to avoid collisions.
     *      Linear probing if collision occurs (extremely rare).
     */
    function _generateUniqueCode(address user) internal returns (uint32) {
        _nonce++;
        uint32 code;
        uint256 attempts = 0;
        do {
            bytes32 hash = keccak256(abi.encodePacked(user, block.timestamp, _nonce + attempts));
            // Map to range [10001, 99999] (10000 reserved for root)
            code = uint32(CODE_MIN + 1 + (uint256(hash) % (CODE_MAX - CODE_MIN)));
            attempts++;
            if (attempts > 100) revert("EquoraRegistry: Code space exhausted");
        } while (codeToUser[code] != address(0));

        return code;
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function isRegistered(address user) external view override returns (bool) {
        return _users[user].isRegistered;
    }

    function getSponsor(address user) external view override returns (address) {
        return _users[user].sponsor;
    }

    function getDirectReferrals(address user) external view override returns (address[] memory) {
        return _directReferrals[user];
    }

    function getDirectReferralsCount(address user) external view override returns (uint256) {
        return _users[user].directReferralsCount;
    }

    /**
     * @dev Qualification: user must have >= 2 direct referrals.
     *      Root is always qualified.
     */
    function isQualified(address user) external view override returns (bool) {
        if (user == root) return true;
        return _users[user].directReferralsCount >= 2;
    }

    function getRoot() external view override returns (address) {
        return root;
    }

    function getUserByCode(uint32 code) external view override returns (address) {
        return codeToUser[code];
    }

    function getCodeByUser(address user) external view override returns (uint32) {
        return userToCode[user];
    }

    function getUser(address user) external view returns (User memory) {
        return _users[user];
    }

    function getUserId(address user) external view returns (uint256) {
        return _users[user].id;
    }

    function getUserList() external view returns (address[] memory) {
        return userList;
    }

    function getUsersPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory result) {
        uint256 total = userList.length;
        if (offset >= total) return new address[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = userList[i];
        }
    }
}
