import { parseAbi } from "viem";

export const REGISTRY_ABI = parseAbi([
  "event UserRegistered(address indexed user, address indexed sponsor, uint256 indexed userId, uint256 timestamp)",
  "event ContractsAuthorized(address indexed matrix, address indexed dao)",
  "event RootUpdated(address indexed newRoot)",
]);

export const DAO_ABI = parseAbi([
  "event DAOPositionJoined(address indexed user, uint256 indexed position, uint256 tokenId, uint256 timestamp)",
  "event DAOPayoutPushed(address indexed recipient, uint256 amount, uint256 fromPosition, uint256 timestamp)",
  "event DAOPayoutFallback(address indexed recipient, uint256 amount, uint256 fromPosition, string reason, uint256 timestamp)",
  "event FallbackClaimed(address indexed user, uint256 amount, uint256 timestamp)",
  "event QueueClosed(uint256 totalMembers, uint256 timestamp)",
  "event EarningsCapHit(address indexed member, uint256 lifetimeEarnings, uint256 retopupDeadline)",
  "event SlotBlanked(address indexed member, uint256 timestamp)",
  "event SlotReactivated(address indexed member, uint256 timestamp)",
  "event Retopup(address indexed member, uint256 position, uint256 timestamp)",
  "event PoolDepositReceived(uint256 amount, uint256 accPerMember, uint256 timestamp)",
  "event PoolShareClaimed(address indexed member, uint256 amount, uint256 timestamp)",
]);

export const MATRIX_ABI = parseAbi([
  // Core slot/join events
  "event SlotJoined(address indexed user, uint256 indexed slot, uint256 cost, address sponsor, uint256 timestamp)",
  // V2: PositionFilled replaces NodeFilled (typed, no eventType string)
  "event PositionFilled(address indexed matrixOwner, uint8 indexed slot, uint256 indexed cycle, uint8 position, address participant, uint256 amount)",
  // V2: typed distribution audit — one per money movement
  "event DistributionExecuted(address indexed recipient, uint256 amount, uint8 payoutType, uint8 slot, uint256 cycle, uint8 position)",
  // V2: spillover resolution
  "event SpilloverResolved(address indexed matrixOwner, address indexed recipient, uint8 position, bool wasOwnerFallback)",
  // V2: upgrade reserve funded
  "event UpgradeReserveFunded(address indexed user, uint8 slot, uint256 amount, uint256 totalReserve)",
  // V2: auto-upgrade fired
  "event SlotAutoUpgraded(address indexed user, uint8 fromSlot, uint8 toSlot, uint256 timestamp)",
  // Cycle lifecycle
  "event CycleCompleted(address indexed user, uint8 indexed slot, uint256 cycleNumber, uint256 timestamp)",
  "event MatrixRecycled(address indexed user, uint8 indexed slot, uint256 newCycle, uint256 timestamp)",
  // V2: DAO pool accumulator
  "event DaoPoolFunded(uint256 amount, uint256 newAccRewardPerShare)",
  "event DaoRewardClaimed(address indexed member, uint256 amount)",
  // V2: Rank pool
  "event RankPoolFunded(uint256 amount)",
  // Milestone
  "event MagicBoxUnlocked(address indexed user, uint8 indexed slot, uint8 rank, uint256 timestamp)",
  // Financial
  "event BalanceWithdrawn(address indexed user, uint256 amount, uint256 timestamp)",
]);


export const NFT_ABI = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event WelcomePassMinted(address indexed to, uint256 indexed tokenId)",
  "event RankBadgeMinted(address indexed to, uint8 indexed rank, uint256 indexed tokenId)",
]);

export const VESTING_ABI = parseAbi([
  "event TokensLocked(address indexed beneficiary, uint256 amount, uint256 milestoneSlot, uint256 unlockTimestamp)",
  "event TokensClaimed(address indexed beneficiary, uint256 amount, uint256 milestoneSlot)",
]);

export const VAULT_ABI = parseAbi([
  "event DepositRouted(address indexed user, uint256 totalAmount, uint256 daoAmount, uint256 salaryAmount, uint256 magicBoxAmount, uint256 rewardsAmount, uint256 timestamp)",
  "event UserRegistered(address indexed user, uint32 referralCode, uint8 tier, uint256 timestamp)",
  "event Initialized(address dao, address salary, address magicBox, address rewards)",
]);
