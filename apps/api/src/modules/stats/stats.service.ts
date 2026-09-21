import prisma from "@equora/database";

export class StatsService {
  async getGlobalProtocolStats() {
    const [totalUsers, daoMembersCount, totalPlacements, matrixSlots] =
      await Promise.all([
        prisma.user.count(),
        prisma.daoMember.count(),
        prisma.matrixPlacement.count(),
        prisma.matrixSlot.findMany({
          where: { isUnlocked: true },
          select: { totalEarned: true },
        }),
      ]);

    const matrixVolume = matrixSlots.reduce(
      (acc, s) => acc + Number(s.totalEarned),
      0
    );
    const daoVolume = daoMembersCount * 300;
    const totalVolume = matrixVolume + daoVolume;

    const totalRecycles = await prisma.matrixCycleEvent.count();

    return {
      totalMembers: totalUsers,
      daoMembersCount,
      daoCompleted: daoMembersCount >= 100,
      totalVolumeBTT: totalVolume,

      totalPlacements,
      totalRecycles,
    };
  }
}

export const statsService = new StatsService();
