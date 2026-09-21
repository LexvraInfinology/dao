import prisma from "@equora/database";

const SLOT_COSTS: Record<number, number> = {
  1: 30,
  2: 60,
  3: 120,
  4: 240,
  5: 480,
  6: 960,
  7: 1920,
  8: 3840,
  9: 7680,
  10: 15360,
  11: 30720,
  12: 61440,
};

export class MatrixService {
  async getUserSlots(address: string) {
    const canonicalAddress = address.toLowerCase();
    const slots = await prisma.matrixSlot.findMany({
      where: { userAddress: canonicalAddress },
      orderBy: { slotNumber: "asc" },
    });

    const slotsMap = new Map(slots.map((s) => [s.slotNumber, s]));

    return Array.from({ length: 12 }, (_, i) => {
      const slotNumber = i + 1;
      const s = slotsMap.get(slotNumber);
      return {
        slotNumber,
        cost: SLOT_COSTS[slotNumber],
        isUnlocked: s?.isUnlocked ?? false,
        currentCycle: s?.currentCycle ?? 0,
        filledNodes: s?.filledNodes ?? 0,
        upgradeReserve: Number(s?.upgradeReserve ?? 0),
        totalEarned: Number(s?.totalEarned ?? 0),
        unlockedAt: s?.unlockedAt ?? null,
      };
    });
  }

  async getSlotDetails(address: string, slotNumber: number) {
    const canonicalAddress = address.toLowerCase();

    const slot = await prisma.matrixSlot.findUnique({
      where: {
        userAddress_slotNumber: {
          userAddress: canonicalAddress,
          slotNumber,
        },
      },
      include: {
        placements: {
          where: { slotNumber },
          orderBy: { position: "asc" },
          include: {
            placedUser: {
              select: {
                userId: true,
                address: true,
              },
            },
          },
        },
      },
    });

    const currentCycle = slot?.currentCycle ?? 1;
    const currentPlacements =
      slot?.placements.filter((p) => p.cycle === currentCycle) ?? [];

    const nodesArray = Array.from({ length: 14 }, (_, i) => {
      const pos = i + 1;
      const placement = currentPlacements.find((p) => p.position === pos);
      return placement
        ? {
            position: pos,
            filled: true,
            placedUser: placement.placedUserAddress,
            userId: placement.placedUser.userId,
            payoutType: placement.payoutType,
            recipientAddress: placement.recipientAddress,
            wasFallback: placement.wasFallback,
            amount: Number(placement.amount),
            timestamp: placement.timestamp,
          }
        : {
            position: pos,
            filled: false,
            placedUser: null,
            userId: null,
            payoutType: null,
            recipientAddress: null,
            wasFallback: false,
            amount: 0,
            timestamp: null,
          };
    });

    return {
      slotNumber,
      cost: SLOT_COSTS[slotNumber],
      isUnlocked: slot?.isUnlocked ?? false,
      currentCycle,
      filledNodes: slot?.filledNodes ?? 0,
      upgradeReserve: Number(slot?.upgradeReserve ?? 0),
      totalEarned: Number(slot?.totalEarned ?? 0),
      nodes: nodesArray,
    };
  }

  async getCycleHistory(address: string, slotNumber: number) {
    const canonicalAddress = address.toLowerCase();
    const cycleEvents = await prisma.matrixCycleEvent.findMany({
      where: {
        userAddress: canonicalAddress,
        slotNumber,
      },
      orderBy: { cycleNumber: "desc" },
    });

    return cycleEvents.map((c) => ({
      cycleNumber: c.cycleNumber,
      nodes: c.nodes,
      completedAt: c.completedAt,
      txHash: c.txHash,
    }));
  }

  async getPlacementHistory(address: string, page = 1, limit = 20) {
    const canonicalAddress = address.toLowerCase();
    const skip = (page - 1) * limit;

    const [total, placements] = await Promise.all([
      prisma.matrixPlacement.count({
        where: {
          OR: [
            { matrixOwnerAddress: canonicalAddress },
            { placedUserAddress: canonicalAddress },
            { recipientAddress: canonicalAddress },
          ],
        },
      }),
      prisma.matrixPlacement.findMany({
        where: {
          OR: [
            { matrixOwnerAddress: canonicalAddress },
            { placedUserAddress: canonicalAddress },
            { recipientAddress: canonicalAddress },
          ],
        },
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
          placedUser: { select: { userId: true, address: true } },
          matrixOwner: { select: { userId: true, address: true } },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      history: placements.map((p) => ({
        id: p.id,
        slotNumber: p.slotNumber,
        position: p.position,
        cycle: p.cycle,
        payoutType: p.payoutType,
        recipientAddress: p.recipientAddress,
        wasFallback: p.wasFallback,
        amount: Number(p.amount),
        isIncome: p.recipientAddress === canonicalAddress,
        matrixOwner: p.matrixOwnerAddress,
        placedUser: p.placedUserAddress,
        txHash: p.txHash,
        timestamp: p.timestamp,
      })),
    };
  }
}

export const matrixService = new MatrixService();

