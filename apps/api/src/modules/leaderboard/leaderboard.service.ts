import prisma from "@btitan/database";

export class LeaderboardService {
  async getTopEarners(limit = 20) {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: {
        matrixSlots: {
          _count: "desc",
        },
      },
      include: {
        daoMembership: true,
        matrixSlots: true,
      },
    });

    const calculated = users.map((u) => {
      const matrixEarned = u.matrixSlots.reduce(
        (acc, s) => acc + Number(s.totalEarned),
        0
      );
      const daoEarned = Number(u.daoMembership?.pushedAmountBtt ?? 0);
      const totalEarned = matrixEarned + daoEarned;
      const highestSlot = Math.max(
        1,
        ...u.matrixSlots.filter((s) => s.isUnlocked).map((s) => s.slotNumber)
      );

      return {
        address: u.address,
        userId: u.userId,
        directCount: u.directReferralsCount,
        highestSlot,
        totalEarned,
      };
    });

    calculated.sort((a, b) => b.totalEarned - a.totalEarned);

    return calculated.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));
  }

  async getTopReferrers(limit = 20) {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: { directReferralsCount: "desc" },
      include: {
        matrixSlots: {
          where: { isUnlocked: true },
          orderBy: { slotNumber: "desc" },
          take: 1,
        },
      },
    });

    return users.map((u, index) => ({
      rank: index + 1,
      address: u.address,
      userId: u.userId,
      directReferralsCount: u.directReferralsCount,
      highestSlot: u.matrixSlots[0]?.slotNumber ?? 1,
      isQualified: u.isQualified,
    }));
  }
}

export const leaderboardService = new LeaderboardService();
