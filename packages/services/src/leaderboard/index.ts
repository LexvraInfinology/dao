import prisma from "@equora/database";
import { LeaderboardEarnerDTO, LeaderboardReferrerDTO } from "./model";

export class LeaderboardService {
  async getTopEarners(limit = 20): Promise<LeaderboardEarnerDTO[]> {
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

    const calculated = users.map((u: any) => {
      const matrixEarned = u.matrixSlots.reduce(
        (acc: number, s: any) => acc + Number(s.totalEarned),
        0
      );
      const daoEarned = Number(u.daoMembership?.pushedAmountBtt ?? 0);
      const totalEarned = matrixEarned + daoEarned;
      const highestSlot = Math.max(
        1,
        ...u.matrixSlots.filter((s: any) => s.isUnlocked).map((s: any) => s.slotNumber)
      );

      return {
        address: u.address,
        userId: u.userId,
        directCount: u.directReferralsCount,
        highestSlot,
        totalEarned,
      };
    });

    calculated.sort((a: any, b: any) => b.totalEarned - a.totalEarned);

    return calculated.map((item: any, index: number) => ({
      rank: index + 1,
      ...item,
    }));
  }

  async getTopReferrers(limit = 20): Promise<LeaderboardReferrerDTO[]> {
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

    return users.map((u: any, index: number) => ({
      rank: index + 1,
      address: u.address,
      userId: u.userId,
      directCount: u.directReferralsCount,
      highestSlot: u.matrixSlots[0]?.slotNumber ?? 1,
    }));
  }
}

export const leaderboardService = new LeaderboardService();
export * from "./model";
