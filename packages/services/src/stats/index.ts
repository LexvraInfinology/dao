import prisma from "@equora/database";
import { GlobalProtocolStatsDTO } from "./model";

export class StatsService {
  async getGlobalProtocolStats(): Promise<GlobalProtocolStatsDTO> {
    const [totalUsers, daoMembersCount, totalPlacements, matrixSlots, totalRecycles] =
      await Promise.all([
        prisma.user.count(),
        prisma.daoMember.count(),
        prisma.matrixPlacement.count(),
        prisma.matrixSlot.findMany({
          where: { isUnlocked: true },
          select: { totalEarned: true },
        }),
        prisma.matrixCycleEvent.count(),
      ]);

    const matrixVolume = matrixSlots.reduce(
      (acc: number, s: any) => acc + Number(s.totalEarned),
      0
    );
    const daoVolume = daoMembersCount * 300;
    const totalVolume = matrixVolume + daoVolume;

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
export * from "./model";
