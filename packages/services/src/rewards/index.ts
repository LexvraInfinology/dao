import prisma from "@equora/database";
import { UserRewardsDTO } from "./model";

export class RewardsService {
  async getUserRewards(address: string): Promise<UserRewardsDTO> {
    const canonicalAddress = address.toLowerCase();

    const [user, badges, locks, poolCards] = await Promise.all([
      prisma.user.findUnique({
        where: { address: canonicalAddress },
      }),
      prisma.nftBadge.findMany({
        where: { userAddress: canonicalAddress },
        orderBy: { rank: "asc" },
      }),
      prisma.vestingLock.findMany({
        where: { userAddress: canonicalAddress },
        orderBy: { milestoneSlot: "asc" },
      }),
      prisma.poolCard.findMany({
        where: { userAddress: canonicalAddress },
        orderBy: { tier: "asc" },
      }),
    ]);

    const hasWelcomePass = badges.some((b: any) => b.rank === 0);
    const highestRank = badges.length > 0 ? Math.max(...badges.map((b: any) => b.rank)) : 0;

    const totalLockedTokens = locks.reduce(
      (acc: number, l: any) => acc + Number(l.amount),
      0
    );
    const claimableTokens = locks
      .filter((l: any) => !l.isClaimed && new Date(l.unlockTimestamp) <= new Date())
      .reduce((acc: number, l: any) => acc + Number(l.amount), 0);

    return {
      address: canonicalAddress,
      hasWelcomePass,
      highestRank,
      poolCards: poolCards.map((p: any) => ({
        tier: p.tier,
        tierName: p.tierName,
        unlockedAt: p.unlockedAt,
        txHash: p.txHash,
      })),
      badges: badges.map((b: any) => ({
        tokenId: b.tokenId,
        rank: b.rank,
        mintedAt: b.mintedAt,
        txHash: b.txHash,
      })),
      vestingLocks: locks.map((l: any) => ({
        id: l.id,
        milestoneSlot: l.milestoneSlot,
        amount: Number(l.amount),
        lockedAt: l.lockedAt,
        unlockTimestamp: l.unlockTimestamp,
        isClaimed: l.isClaimed,
        claimedAt: l.claimedAt,
      })),
      totalLockedTokens,
      claimableTokens,
    };
  }
}

export const rewardsService = new RewardsService();
export * from "./model";
