// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IBTitanRegistry.sol";
import "../interfaces/IBTitanNFT.sol";

/**
 * @title BTitanDAO
 * @dev Phase 1: Genesis Founder DAO — 50-Person Queue with $300 Entry Fee
 *
 * Business Logic:
 *   - 50 total positions, each costs 300 BTT tokens (300 * 10^18)
 *   - When person N joins, their $300 is split EQUALLY among ALL N-1 previous members
 *   - Person #1 receives their own deposit (held until person #2 joins)
 *   - After DAO fills (50/50), participants can move to the Matrix phase
 *   - Every joiner receives a Welcome Pass NFT
 *
 * Distribution Example:
 *   P1 joins: P1 gets $300 (no one to distribute to yet)
 *   P2 joins: P1 gets $300
 *   P3 joins: P1 gets $150, P2 gets $150
 *   P4 joins: P1 gets $100, P2 gets $100, P3 gets $100
 *   ...
 *   P50 joins: 49 previous members each get $300/49 ≈ $6.12
 *
 * Security:
 *   - ReentrancyGuard on all state-changing functions
 *   - Only BTT token accepted (no native ETH/BNB)
 *   - Proper integer division remainder handling
 */
contract BTitanDAO is Ownable, ReentrancyGuard {
    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant ENTRY_FEE = 300 * 10 ** 18;     // 300 BTT
    uint256 public constant MAX_DAO_POSITIONS = 50;

    // ─── Dependencies ─────────────────────────────────────────────────────────

    IERC20 public paymentToken;
    IBTitanRegistry public registry;
    IBTitanNFT public nftContract;

    // ─── State Variables ──────────────────────────────────────────────────────

    address[] public daoMembers;
    mapping(address => bool) public isDaoMember;
    mapping(address => uint256) public memberPosition;  // 1-indexed
    mapping(address => uint256) public userBalance;
    mapping(address => uint256) public totalEarned;
    mapping(address => uint256) public totalWithdrawn;

    bool public daoCompleted;
    uint256 public totalDistributed;
    uint256 public totalCollected;

    // ─── Events ───────────────────────────────────────────────────────────────

    event DAOPositionJoined(
        address indexed user,
        uint256 indexed position,
        address indexed sponsor,
        uint256 timestamp
    );
    event DAODistributionExecuted(
        uint256 indexed incomingPosition,
        uint256 recipientCount,
        uint256 amountPerRecipient,
        uint256 remainder,
        uint256 timestamp
    );
    event DAOCompleted(uint256 totalMembers, uint256 timestamp);
    event BalanceWithdrawn(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    event ContractsSet(address indexed token, address indexed registry, address indexed nft);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        address _paymentToken,
        address _registry,
        address _nftContract
    ) Ownable(msg.sender) {
        require(_paymentToken != address(0), "BTitanDAO: Invalid token");
        require(_registry != address(0), "BTitanDAO: Invalid registry");

        paymentToken = IERC20(_paymentToken);
        registry = IBTitanRegistry(_registry);
        nftContract = IBTitanNFT(_nftContract);

        emit ContractsSet(_paymentToken, _registry, _nftContract);
    }

    // ─── Admin Functions ──────────────────────────────────────────────────────

    /**
     * @dev Update contract references (only before DAO starts)
     */
    function setContracts(
        address _paymentToken,
        address _registry,
        address _nftContract
    ) external onlyOwner {
        require(daoMembers.length == 0, "BTitanDAO: Cannot change after DAO started");
        paymentToken = IERC20(_paymentToken);
        registry = IBTitanRegistry(_registry);
        nftContract = IBTitanNFT(_nftContract);
        emit ContractsSet(_paymentToken, _registry, _nftContract);
    }

    // ─── Core Join Function ───────────────────────────────────────────────────

    /**
     * @dev Join the Genesis DAO as one of 50 founding members.
     *      Requirements:
     *        - Caller has approved ENTRY_FEE of BTT to this contract
     *        - DAO is not yet full (< 50 members)
     *        - Caller has not already joined
     *
     * @param sponsor The referring member's address (or address(0) for root)
     * @return position The 1-indexed slot number assigned (1 to 50)
     */
    function joinDAO(address sponsor) external nonReentrant returns (uint256 position) {
        require(!daoCompleted, "BTitanDAO: All 50 positions are filled");
        require(!isDaoMember[msg.sender], "BTitanDAO: Already a DAO member");
        require(daoMembers.length < MAX_DAO_POSITIONS, "BTitanDAO: Max capacity reached");

        // 1. Collect 300 BTT payment (caller must have called approve() first)
        bool success = paymentToken.transferFrom(msg.sender, address(this), ENTRY_FEE);
        require(success, "BTitanDAO: Payment failed - approve BTT first");
        totalCollected += ENTRY_FEE;

        // 2. Register user in the registry (if not already registered)
        if (!registry.isRegistered(msg.sender)) {
            registry.registerUser(msg.sender, sponsor);
        }

        // 3. Mint Welcome Pass NFT (if not already owned)
        if (address(nftContract) != address(0) && !nftContract.hasWelcomePass(msg.sender)) {
            try nftContract.mintWelcomePass(msg.sender) {} catch {}
        }

        // 4. Assign position
        position = daoMembers.length + 1; // 1 to 50
        daoMembers.push(msg.sender);
        isDaoMember[msg.sender] = true;
        memberPosition[msg.sender] = position;

        address sponsorAddr = registry.getSponsor(msg.sender);
        emit DAOPositionJoined(msg.sender, position, sponsorAddr, block.timestamp);

        // 5. Execute distribution to all previous members
        _distributeDaoEntry(position);

        // 6. Check if DAO is now complete
        if (daoMembers.length == MAX_DAO_POSITIONS) {
            daoCompleted = true;
            emit DAOCompleted(MAX_DAO_POSITIONS, block.timestamp);
        }

        return position;
    }

    // ─── Withdraw ─────────────────────────────────────────────────────────────

    /**
     * @dev Withdraw available BTT earnings.
     *      Users can call this any time they have a balance.
     * @param amount Amount of BTT to withdraw (in wei)
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "BTitanDAO: Amount must be > 0");
        require(userBalance[msg.sender] >= amount, "BTitanDAO: Insufficient balance");

        userBalance[msg.sender] -= amount;
        totalWithdrawn[msg.sender] += amount;

        bool success = paymentToken.transfer(msg.sender, amount);
        require(success, "BTitanDAO: Withdrawal transfer failed");

        emit BalanceWithdrawn(msg.sender, amount, block.timestamp);
    }

    // ─── Internal Distribution Logic ──────────────────────────────────────────

    /**
     * @dev Distribute the incoming member's ENTRY_FEE to all prior members equally.
     *      Any integer division remainder goes to the first member (position 0).
     *
     * @param incomingPosition The 1-indexed position of the incoming member (1-50)
     */
    function _distributeDaoEntry(uint256 incomingPosition) internal {
        if (incomingPosition == 1) {
            // First member: receives their own deposit as credit
            address firstMember = daoMembers[0];
            userBalance[firstMember] += ENTRY_FEE;
            totalEarned[firstMember] += ENTRY_FEE;
            totalDistributed += ENTRY_FEE;
            emit DAODistributionExecuted(1, 1, ENTRY_FEE, 0, block.timestamp);
            return;
        }

        // For positions 2-50: split equally among all previous N-1 members
        uint256 recipientCount = incomingPosition - 1;
        uint256 amountPerRecipient = ENTRY_FEE / recipientCount;
        uint256 remainder = ENTRY_FEE % recipientCount; // handle rounding

        for (uint256 i = 0; i < recipientCount; i++) {
            address recipient = daoMembers[i];
            userBalance[recipient] += amountPerRecipient;
            totalEarned[recipient] += amountPerRecipient;
            totalDistributed += amountPerRecipient;
        }

        // Send remainder to the first member (position 1) to avoid locking dust
        if (remainder > 0) {
            userBalance[daoMembers[0]] += remainder;
            totalEarned[daoMembers[0]] += remainder;
            totalDistributed += remainder;
        }

        emit DAODistributionExecuted(
            incomingPosition,
            recipientCount,
            amountPerRecipient,
            remainder,
            block.timestamp
        );
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /**
     * @dev Get all 50 DAO member addresses
     */
    function getDaoMembers() external view returns (address[] memory) {
        return daoMembers;
    }

    /**
     * @dev Get current filled count (0 to 50)
     */
    function getDaoMemberCount() external view returns (uint256) {
        return daoMembers.length;
    }

    /**
     * @dev Get how many positions remain open
     */
    function getRemainingPositions() external view returns (uint256) {
        return MAX_DAO_POSITIONS - daoMembers.length;
    }

    /**
     * @dev Get all financial details for a user
     */
    function getMemberDetails(address user) external view returns (
        bool isMember,
        uint256 position,
        uint256 availableBalance,
        uint256 earned,
        uint256 withdrawn
    ) {
        return (
            isDaoMember[user],
            memberPosition[user],
            userBalance[user],
            totalEarned[user],
            totalWithdrawn[user]
        );
    }

    /**
     * @dev Calculate how much the next member's deposit would distribute
     *      to each existing member (for frontend preview)
     */
    function previewNextDistribution() external view returns (
        uint256 recipientCount,
        uint256 amountPerRecipient
    ) {
        recipientCount = daoMembers.length;
        if (recipientCount == 0) return (0, ENTRY_FEE);
        amountPerRecipient = ENTRY_FEE / recipientCount;
    }

    /**
     * @dev Get global DAO stats
     */
    function getDAOStats() external view returns (
        uint256 memberCount,
        uint256 collected,
        uint256 distributed,
        bool completed
    ) {
        return (daoMembers.length, totalCollected, totalDistributed, daoCompleted);
    }
}
