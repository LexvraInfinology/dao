import prisma from "@equora/database";
import { UserProfileDTO, DirectReferralsResultDTO, ReferralTreeDTO } from "./model";

export class UsersService {
  async getUserByAddress(address: string): Promise<UserProfileDTO | null> {
    const canonicalAddress = address.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { address: canonicalAddress },
      include: {
        daoMembership: true,
        nftBadges: true,
        vestingLocks: true,
        matrixSlots: {
          orderBy: { slotNumber: "asc" },
        },
      },
    });

    if (!user) return null;

    return {
      address: user.address,
      userId: user.userId,
      sponsorAddress: user.sponsorAddress,
      directReferralsCount: user.directReferralsCount,
      isQualified: user.isQualified,
      registeredAt: user.registrationTimestamp,
      daoPosition: user.daoMembership?.position ?? null,
      highestSlotUnlocked: Math.max(
        1,
        ...user.matrixSlots.filter((s: any) => s.isUnlocked).map((s: any) => s.slotNumber)
      ),
      totalEarned: user.matrixSlots.reduce(
        (acc: number, s: any) => acc + Number(s.totalEarned),
        Number(user.daoMembership?.pushedAmountBtt ?? 0)
      ),
      totalWithdrawn: 0,
    };
  }

  async getDirectReferrals(
    address: string,
    page = 1,
    limit = 20
  ): Promise<DirectReferralsResultDTO> {
    const canonicalAddress = address.toLowerCase();
    const skip = (page - 1) * limit;

    const [total, referrals] = await Promise.all([
      prisma.user.count({
        where: { sponsorAddress: canonicalAddress },
      }),
      prisma.user.findMany({
        where: { sponsorAddress: canonicalAddress },
        skip,
        take: limit,
        orderBy: { registrationTimestamp: "desc" },
        include: {
          daoMembership: true,
          matrixSlots: {
            where: { isUnlocked: true },
            orderBy: { slotNumber: "desc" },
            take: 1,
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      referrals: referrals.map((r: any) => ({
        address: r.address,
        userId: r.userId,
        registeredAt: r.registrationTimestamp,
        isQualified: r.isQualified,
        directCount: r.directReferralsCount,
        isDaoMember: !!r.daoMembership,
        highestSlot: r.matrixSlots[0]?.slotNumber ?? 1,
      })),
    };
  }

  async getReferralTree(address: string, maxDepth = 2): Promise<ReferralTreeDTO | null> {
    const canonicalAddress = address.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { address: canonicalAddress },
      include: {
        referrals: {
          include: {
            referrals: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      address: user.address,
      userId: user.userId,
      directCount: user.directReferralsCount,
      level1: user.referrals.map((l1: any) => ({
        address: l1.address,
        userId: l1.userId,
        directCount: l1.directReferralsCount,
        isQualified: l1.isQualified,
        level2:
          maxDepth >= 2
            ? l1.referrals.map((l2: any) => ({
                address: l2.address,
                userId: l2.userId,
                directCount: l2.directReferralsCount,
                isQualified: l2.isQualified,
              }))
            : [],
      })),
    };
  }
}

export const usersService = new UsersService();
export * from "./model";
