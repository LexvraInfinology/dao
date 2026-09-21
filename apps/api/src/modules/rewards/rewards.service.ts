import prisma from "@equora/database";

export class RewardsService {
  async getUserRewards(address: string) {
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

    const hasWelcomePass = badges.some((b) => b.rank === 0);
    const highestRank = badges.length > 0 ? Math.max(...badges.map((b) => b.rank)) : 0;

    const totalLockedTokens = locks.reduce(
      (acc, l) => acc + Number(l.amount),
      0
    );
    const claimableTokens = locks
      .filter((l) => !l.isClaimed && new Date(l.unlockTimestamp) <= new Date())
      .reduce((acc, l) => acc + Number(l.amount), 0);

    return {
      address: canonicalAddress,
      hasWelcomePass,
      highestRank,
      poolCards: poolCards.map((p) => ({
        tier: p.tier,
        tierName: p.tierName,
        unlockedAt: p.unlockedAt,
        txHash: p.txHash,
      })),
      badges: badges.map((b) => ({
        tokenId: b.tokenId,
        rank: b.rank,
        mintedAt: b.mintedAt,
        txHash: b.txHash,
      })),
      vestingLocks: locks.map((l) => ({
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
      equityEntitlementBps: 250, // 2.5% platform equity
    };
  }
}

export const rewardsService = new RewardsService();
