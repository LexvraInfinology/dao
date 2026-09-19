// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IEquoraRegistry.sol";

/**
 * @title EquoraRegistry
 * @dev Central user registry for Equora.Fi platform.
 *
 * Key Additions vs B-Titan:
 *   - 5-digit unique referral code (10000–99999) auto-generated on registration
 *   - registerUser() accepts referral CODE (uint32) instead of sponsor address
 *   - Bi-directional mapping: code → address, address → code
 *
 * Unchanged from BTitanRegistry:
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
    address public matrixContract;   // BTitanMatrix

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
