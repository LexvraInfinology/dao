// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IBTitanRegistry.sol";

/**
 * @title BTitanRegistry
 * @dev Central user registry for B-TITAN platform.
 *      Manages:
 *      - User account creation and identity
 *      - Sponsor/referral genealogy tree
 *      - Direct referral counts for 2-referral qualification
 *      - Authorization for Matrix and DAO contracts to register users
 *
 * Security:
 *      - Only authorized contracts (Matrix, DAO) can register users
 *      - Root address is the platform genesis node (always qualified)
 *      - Sponsors are validated on registration; falls back to root if invalid
 */
contract BTitanRegistry is IBTitanRegistry, Ownable {
    // ─── Data Structures ─────────────────────────────────────────────────────

    struct User {
        bool isRegistered;
        address sponsor;
        uint256 registrationTimestamp;
        uint256 directReferralsCount;
        uint256 id;
    }

    // ─── State Variables ──────────────────────────────────────────────────────

    address public root;
    address public matrixContract;
    address public daoContract;

    mapping(address => User) private _users;
    mapping(address => address[]) private _directReferrals;

    address[] public userList;
    uint256 public totalUsers;

    // ─── Events ───────────────────────────────────────────────────────────────

    event UserRegistered(
        address indexed user,
        address indexed sponsor,
        uint256 indexed userId,
        uint256 timestamp
    );
    event ContractsAuthorized(address indexed matrix, address indexed dao);
    event RootUpdated(address indexed newRoot);

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || msg.sender == matrixContract || msg.sender == daoContract,
            "BTitanRegistry: Unauthorized caller"
        );
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param _root The genesis/root wallet address (platform owner's wallet)
     */
    constructor(address _root) Ownable(msg.sender) {
        require(_root != address(0), "BTitanRegistry: Invalid root address");
        root = _root;

        // Auto-register the root as user #1
        totalUsers++;
        _users[_root] = User({
            isRegistered: true,
            sponsor: address(0),
            registrationTimestamp: block.timestamp,
            directReferralsCount: 0,
            id: totalUsers
        });
        userList.push(_root);

        emit UserRegistered(_root, address(0), totalUsers, block.timestamp);
    }

    // ─── Admin Functions ──────────────────────────────────────────────────────

    /**
     * @dev Set which Matrix and DAO contracts can call registerUser()
     *      Must be called after deploying Matrix and DAO contracts.
     */
    function setAuthorizedContracts(
        address _matrixContract,
        address _daoContract
    ) external onlyOwner {
        require(_matrixContract != address(0) || _daoContract != address(0), "BTitanRegistry: Invalid addresses");
        matrixContract = _matrixContract;
        daoContract = _daoContract;
        emit ContractsAuthorized(_matrixContract, _daoContract);
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @dev Register a new user with a sponsor.
     *      Called by Matrix or DAO contract when a user joins.
     *      If sponsor is invalid or unregistered, defaults to root.
     * @param user Address to register
     * @param sponsor Referred-by address
     * @return bool Success
     */
    function registerUser(address user, address sponsor) external onlyAuthorized returns (bool) {
        require(user != address(0), "BTitanRegistry: Invalid user address");
        require(!_users[user].isRegistered, "BTitanRegistry: Already registered");

        // Validate sponsor — fall back to root if invalid
        address validSponsor = sponsor;
        if (
            validSponsor == address(0) ||
            validSponsor == user ||
            !_users[validSponsor].isRegistered
        ) {
            validSponsor = root;
        }

        totalUsers++;
        _users[user] = User({
            isRegistered: true,
            sponsor: validSponsor,
            registrationTimestamp: block.timestamp,
            directReferralsCount: 0,
            id: totalUsers
        });

        // Increment sponsor's referral count
        _users[validSponsor].directReferralsCount++;
        _directReferrals[validSponsor].push(user);
        userList.push(user);

        emit UserRegistered(user, validSponsor, totalUsers, block.timestamp);
        return true;
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
     * @dev Check if user is "qualified" — has at least 2 direct referrals.
     *      Root is always qualified.
     *      Unqualified users' earnings are redirected to root.
     */
    function isQualified(address user) external view override returns (bool) {
        if (user == root) return true;
        return _users[user].directReferralsCount >= 2;
    }

    function getRoot() external view override returns (address) {
        return root;
    }

    /**
     * @dev Get full user data struct
     */
    function getUser(address user) external view returns (User memory) {
        return _users[user];
    }

    /**
     * @dev Get user's unique ID
     */
    function getUserId(address user) external view returns (uint256) {
        return _users[user].id;
    }

    /**
     * @dev Get all registered users (caution: gas-heavy for large sets)
     */
    function getUserList() external view returns (address[] memory) {
        return userList;
    }

    /**
     * @dev Get paginated user list (for frontend/indexer use)
     * @param offset Starting index
     * @param limit Max items to return
     */
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
