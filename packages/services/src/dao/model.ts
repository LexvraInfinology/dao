export interface PriceData {
  priceUsd: number;
  priceSource: "onchain" | "offchain-estimate" | "trobchain-api" | string;
  updatedAt: Date;
  isStale: boolean;
}

export interface DaoStatsDTO {
  memberCount: number;
  activeMembers: number;
  blankMembers: number;
  cappedMembers: number;
  capacity: number;
  remainingPositions: number;
  entryFeeBtt: number;
  earningsCapBtt: number;
  totalCollectedBTT: number;
  totalCollectedUSDEstimate: number;
  totalDistributedBTT: number;
  totalDistributedUSDEstimate: number;
  totalPoolReceivedBTT: number;
  totalPoolReceivedUSDEstimate: number;
  isClosed: boolean;
  distributionMode: string;
  bttPriceUsd: number;
  priceSource: string;
  priceUpdatedAt: Date;
}

export interface DaoMemberDTO {
  position: number;
  address: string;
  userId: number | null;
  nftTokenId: number;
  entryAmountBtt: number;
  entryAmountUsdEstimate: number;
  pushedAmountBtt: number;
  pushedAmountUsdEstimate: number;
  status: string;
  joinedAt: Date;
  txHash: string;
  hasFallbackClaims: boolean;
}

export interface DaoEventDTO {
  id: string;
  eventType: string;
  userAddress: string | null;
  incomingPosition: number | null;
  recipientCount: number | null;
  amountBtt: number;
  amountUsdEstimate: number;
  priceSource: string;
  reason: string | null;
  txHash: string;
  blockNumber: string;
  timestamp: Date;
}

export interface VaultDepositSplitDTO {
  id: string;
  userAddress: string;
  totalAmount: number;
  daoAmount: number;
  salaryAmount: number;
  magicBoxAmount: number;
  rewardsAmount: number;
  timestamp: Date;
  txHash: string;
  blockNumber: string;
}

export interface DaoProposalDTO {
  proposalId: number;
  proposer: string;
  title: string;
  description: string;
  status: string;
  startTime: Date;
  endTime: Date;
  votesFor: number;
  votesAgainst: number;
  votesCount: number;
  createdAt: Date;
}

export interface FallbackClaimDTO {
  id: string;
  round: number;
  amountBtt: number;
  claimed: boolean;
  txHash: string | null;
  claimedAt: Date | null;
  createdAt: Date;
}

export interface MemberDetailsDTO {
  isMember: boolean;
  position: number | null;
  userId: number | null;
  directReferralsCount: number;
  isQualified: boolean;
  nftTokenId: number | null;
  joinedAt?: Date;
  entryAmountBtt?: number;
  entryAmountUsdEstimate?: number;
  pushedAmountBtt: number;
  pushedAmountUsdEstimate: number;
  earningsCapBtt?: number;
  capProgressPct?: number;
  isCapped?: boolean;
  priceSource?: string;
  status?: string;
  txHash?: string;
  fallbackClaims?: FallbackClaimDTO[];
}

