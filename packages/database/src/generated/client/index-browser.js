
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  address: 'address',
  userId: 'userId',
  sponsorAddress: 'sponsorAddress',
  directReferralsCount: 'directReferralsCount',
  isQualified: 'isQualified',
  registrationTimestamp: 'registrationTimestamp',
  txHash: 'txHash',
  blockNumber: 'blockNumber',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuthNonceScalarFieldEnum = {
  id: 'id',
  address: 'address',
  nonce: 'nonce',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.DaoInstanceScalarFieldEnum = {
  id: 'id',
  capacity: 'capacity',
  isClosed: 'isClosed',
  closedAt: 'closedAt',
  totalDistributedBtt: 'totalDistributedBtt',
  distributionMode: 'distributionMode',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DaoMemberScalarFieldEnum = {
  id: 'id',
  address: 'address',
  position: 'position',
  nftTokenId: 'nftTokenId',
  entryAmountBtt: 'entryAmountBtt',
  entryAmountUsdAtJoin: 'entryAmountUsdAtJoin',
  priceSource: 'priceSource',
  pushedAmountBtt: 'pushedAmountBtt',
  retopupAmountBtt: 'retopupAmountBtt',
  retopupCount: 'retopupCount',
  lastRetopupAt: 'lastRetopupAt',
  retopupDeadline: 'retopupDeadline',
  totalDepositsCount: 'totalDepositsCount',
  totalDepositsUsd: 'totalDepositsUsd',
  deviceFingerprint: 'deviceFingerprint',
  joinedAt: 'joinedAt',
  status: 'status',
  txHash: 'txHash',
  blockNumber: 'blockNumber',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WhatsappVerificationScalarFieldEnum = {
  address: 'address',
  phone: 'phone',
  verified: 'verified',
  verified_at: 'verified_at'
};

exports.Prisma.DaoEventScalarFieldEnum = {
  id: 'id',
  eventType: 'eventType',
  userAddress: 'userAddress',
  incomingPosition: 'incomingPosition',
  recipientCount: 'recipientCount',
  amountBtt: 'amountBtt',
  amountUsdEst: 'amountUsdEst',
  priceSource: 'priceSource',
  reason: 'reason',
  txHash: 'txHash',
  blockNumber: 'blockNumber',
  timestamp: 'timestamp',
  createdAt: 'createdAt'
};

exports.Prisma.PullFallbackClaimScalarFieldEnum = {
  id: 'id',
  memberId: 'memberId',
  amountBtt: 'amountBtt',
  reason: 'reason',
  txHash: 'txHash',
  claimedAt: 'claimedAt'
};

exports.Prisma.MatrixSlotScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  slotNumber: 'slotNumber',
  currentCycle: 'currentCycle',
  recyclesCount: 'recyclesCount',
  filledNodes: 'filledNodes',
  isUnlocked: 'isUnlocked',
  upgradeReserve: 'upgradeReserve',
  totalEarned: 'totalEarned',
  unlockedAt: 'unlockedAt',
  txHash: 'txHash',
  blockNumber: 'blockNumber',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MatrixPlacementScalarFieldEnum = {
  id: 'id',
  matrixOwnerAddress: 'matrixOwnerAddress',
  placedUserAddress: 'placedUserAddress',
  slotNumber: 'slotNumber',
  position: 'position',
  cycle: 'cycle',
  payoutType: 'payoutType',
  recipientAddress: 'recipientAddress',
  wasFallback: 'wasFallback',
  amount: 'amount',
  txHash: 'txHash',
  blockNumber: 'blockNumber',
  timestamp: 'timestamp'
};

exports.Prisma.MatrixCycleEventScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  slotNumber: 'slotNumber',
  cycleNumber: 'cycleNumber',
  nodes: 'nodes',
  completedAt: 'completedAt',
  txHash: 'txHash',
  blockNumber: 'blockNumber'
};

exports.Prisma.MatrixProfileScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  username: 'username',
  avatarUrl: 'avatarUrl',
  bio: 'bio',
  telegram: 'telegram',
  twitter: 'twitter',
  totalEarnings: 'totalEarnings',
  directEarnings: 'directEarnings',
  matrixEarnings: 'matrixEarnings',
  poolEarnings: 'poolEarnings',
  availableBalance: 'availableBalance',
  withdrawnTotal: 'withdrawnTotal',
  recyclesCount: 'recyclesCount',
  teamCount: 'teamCount',
  rankTier: 'rankTier',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MatrixTransactionScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  type: 'type',
  slotNumber: 'slotNumber',
  cycle: 'cycle',
  position: 'position',
  amount: 'amount',
  amountUsd: 'amountUsd',
  token: 'token',
  fromAddress: 'fromAddress',
  toAddress: 'toAddress',
  txHash: 'txHash',
  status: 'status',
  description: 'description',
  timestamp: 'timestamp'
};

exports.Prisma.MatrixActivityScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  action: 'action',
  title: 'title',
  description: 'description',
  slotNumber: 'slotNumber',
  amount: 'amount',
  txHash: 'txHash',
  timestamp: 'timestamp'
};

exports.Prisma.MatrixSettingsScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  autoUpgrade: 'autoUpgrade',
  autoReinvest: 'autoReinvest',
  telegramNotifications: 'telegramNotifications',
  emailNotifications: 'emailNotifications',
  soundEffects: 'soundEffects',
  currency: 'currency',
  theme: 'theme',
  matrixDisplayMode: 'matrixDisplayMode',
  hideZeroBalances: 'hideZeroBalances',
  email: 'email',
  telegram: 'telegram',
  updatedAt: 'updatedAt',
  createdAt: 'createdAt'
};

exports.Prisma.MatrixRankPoolStateScalarFieldEnum = {
  tier: 'tier',
  tierName: 'tierName',
  poolBalance: 'poolBalance',
  totalDistributed: 'totalDistributed',
  qualifierCount: 'qualifierCount',
  nextDistributionAt: 'nextDistributionAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DaoPoolStateScalarFieldEnum = {
  id: 'id',
  accRewardPerShare: 'accRewardPerShare',
  totalShares: 'totalShares',
  totalDeposited: 'totalDeposited',
  totalClaimed: 'totalClaimed',
  updatedAt: 'updatedAt'
};

exports.Prisma.DaoPoolEventScalarFieldEnum = {
  id: 'id',
  eventType: 'eventType',
  walletAddress: 'walletAddress',
  amount: 'amount',
  accRewardPerShareAfter: 'accRewardPerShareAfter',
  txHash: 'txHash',
  blockNumber: 'blockNumber',
  createdAt: 'createdAt'
};

exports.Prisma.RankPoolEventScalarFieldEnum = {
  id: 'id',
  eventType: 'eventType',
  walletAddress: 'walletAddress',
  amount: 'amount',
  rankTier: 'rankTier',
  txHash: 'txHash',
  blockNumber: 'blockNumber',
  createdAt: 'createdAt'
};

exports.Prisma.NftBadgeScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  tokenId: 'tokenId',
  rank: 'rank',
  mintedAt: 'mintedAt',
  txHash: 'txHash'
};

exports.Prisma.PoolCardScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  tier: 'tier',
  tierName: 'tierName',
  unlockedAt: 'unlockedAt',
  txHash: 'txHash',
  blockNumber: 'blockNumber'
};

exports.Prisma.VaultDepositSplitScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  totalAmount: 'totalAmount',
  daoAmount: 'daoAmount',
  salaryAmount: 'salaryAmount',
  magicBoxAmount: 'magicBoxAmount',
  rewardsAmount: 'rewardsAmount',
  timestamp: 'timestamp',
  txHash: 'txHash',
  blockNumber: 'blockNumber'
};

exports.Prisma.DaoProposalScalarFieldEnum = {
  id: 'id',
  proposalId: 'proposalId',
  proposer: 'proposer',
  title: 'title',
  description: 'description',
  target: 'target',
  callData: 'callData',
  status: 'status',
  startTime: 'startTime',
  endTime: 'endTime',
  votesFor: 'votesFor',
  votesAgainst: 'votesAgainst',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DaoVoteScalarFieldEnum = {
  id: 'id',
  proposalId: 'proposalId',
  voter: 'voter',
  support: 'support',
  weight: 'weight',
  votedAt: 'votedAt',
  txHash: 'txHash'
};

exports.Prisma.VestingLockScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  amount: 'amount',
  milestoneSlot: 'milestoneSlot',
  lockedAt: 'lockedAt',
  unlockTimestamp: 'unlockTimestamp',
  isClaimed: 'isClaimed',
  claimedAt: 'claimedAt',
  txHash: 'txHash'
};

exports.Prisma.WithdrawalScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  source: 'source',
  amount: 'amount',
  txHash: 'txHash',
  blockNumber: 'blockNumber',
  timestamp: 'timestamp'
};

exports.Prisma.IndexerCursorScalarFieldEnum = {
  id: 'id',
  contractName: 'contractName',
  chainId: 'chainId',
  lastIndexedBlock: 'lastIndexedBlock',
  lastIndexedBlockHash: 'lastIndexedBlockHash',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaderboardSnapshotScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  totalEarned: 'totalEarned',
  directCount: 'directCount',
  highestSlot: 'highestSlot',
  rank: 'rank',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserSettingsScalarFieldEnum = {
  id: 'id',
  userAddress: 'userAddress',
  notifDaoActivity: 'notifDaoActivity',
  notifGovernance: 'notifGovernance',
  notifCouncilSeat: 'notifCouncilSeat',
  notifMatrixBridge: 'notifMatrixBridge',
  notifProtocolUpdates: 'notifProtocolUpdates',
  notifSecurityAlerts: 'notifSecurityAlerts',
  notifMarketingEvents: 'notifMarketingEvents',
  privDaoProfileVisible: 'privDaoProfileVisible',
  privWalletVisible: 'privWalletVisible',
  privSeatActivity: 'privSeatActivity',
  privGovernanceActivity: 'privGovernanceActivity',
  privEarningsVisible: 'privEarningsVisible',
  updatedAt: 'updatedAt',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  AuthNonce: 'AuthNonce',
  DaoInstance: 'DaoInstance',
  DaoMember: 'DaoMember',
  WhatsappVerification: 'WhatsappVerification',
  DaoEvent: 'DaoEvent',
  PullFallbackClaim: 'PullFallbackClaim',
  MatrixSlot: 'MatrixSlot',
  MatrixPlacement: 'MatrixPlacement',
  MatrixCycleEvent: 'MatrixCycleEvent',
  MatrixProfile: 'MatrixProfile',
  MatrixTransaction: 'MatrixTransaction',
  MatrixActivity: 'MatrixActivity',
  MatrixSettings: 'MatrixSettings',
  MatrixRankPoolState: 'MatrixRankPoolState',
  DaoPoolState: 'DaoPoolState',
  DaoPoolEvent: 'DaoPoolEvent',
  RankPoolEvent: 'RankPoolEvent',
  NftBadge: 'NftBadge',
  PoolCard: 'PoolCard',
  VaultDepositSplit: 'VaultDepositSplit',
  DaoProposal: 'DaoProposal',
  DaoVote: 'DaoVote',
  VestingLock: 'VestingLock',
  Withdrawal: 'Withdrawal',
  IndexerCursor: 'IndexerCursor',
  LeaderboardSnapshot: 'LeaderboardSnapshot',
  UserSettings: 'UserSettings'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
