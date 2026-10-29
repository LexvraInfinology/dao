export interface UserRewardsDTO {
  address: string;
  hasWelcomePass: boolean;
  highestRank: number;
  poolCards: {
    tier: number;
    tierName: string;
    unlockedAt: Date;
    txHash: string | null;
  }[];
  badges: {
    tokenId: number;
    rank: number;
    mintedAt: Date;
    txHash: string;
  }[];
  vestingLocks: {
    id: string;
    milestoneSlot: number;
    amount: number;
    lockedAt: Date;
    unlockTimestamp: Date;
    isClaimed: boolean;
    claimedAt: Date | null;
  }[];
  totalLockedTokens: number;
  claimableTokens: number;
}
