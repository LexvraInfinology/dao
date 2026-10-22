import prisma from "@equora/database";
import {
  MatrixSlotSummaryDTO,
  MatrixSlotDetailsDTO,
  MatrixCycleHistoryDTO,
  MatrixStatsDTO,
  MatrixPlacementHistoryResultDTO,
  MatrixCycleEventDTO,
  MatrixUserProfileDTO,
  MatrixDashboardDTO,
  MatrixLeaderboardEntryDTO,
  MatrixTransactionDTO,
  MatrixSettingsDTO,
  MatrixEarningsOverviewDTO,
} from "./model";

export const SLOT_COSTS: Record<number, number> = {
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

const TROB_PRICE_USD = 0.15;

function getRankName(tier: number): string {
  switch (tier) {
    case 1:
      return "ALPHA";
    case 2:
      return "PRIME";
    case 3:
      return "ELITE";
    case 4:
      return "CROWN";
    default:
      return "NONE";
  }
}

function getLevelForPosition(pos: number): number {
  if (pos <= 2) return 1;
  if (pos <= 6) return 2;
  return 3;
}

const inMemorySettingsCache = new Map<string, MatrixSettingsDTO>();

export class MatrixService {
  // ── USER LIFECYCLE & PROFILE ──────────────────────────────────────────────

  async getOrCreateUser(address: string, sponsorAddress?: string): Promise<MatrixUserProfileDTO> {
    const canonicalAddress = address.toLowerCase();

    let user = await prisma.user.findUnique({
      where: { address: canonicalAddress },
      include: {
        matrixProfile: true,
        matrixSettings: true,
        matrixSlots: true,
      },
    });

    if (!user) {
      // Find highest userId
      const highestUser = await prisma.user.findFirst({
        orderBy: { userId: "desc" },
        select: { userId: true },
      });
      const nextUserId = (highestUser?.userId ?? 0) + 1;

      const normalizedSponsor = sponsorAddress ? sponsorAddress.toLowerCase() : null;

      user = await prisma.user.create({
        data: {
          address: canonicalAddress,
          userId: nextUserId,
          sponsorAddress: normalizedSponsor,
          registrationTimestamp: new Date(),
          matrixProfile: {
            create: {
              username: `Operative #${nextUserId}`,
              totalEarnings: 0,
              availableBalance: 0,
              withdrawnTotal: 0,
            },
          },
          matrixSettings: {
            create: {
              autoUpgrade: true,
              autoReinvest: true,
              soundEffects: true,
              theme: "dark",
            },
          },
          matrixSlots: {
            create: {
              slotNumber: 1,
              isUnlocked: true,
              unlockedAt: new Date(),
              currentCycle: 1,
              filledNodes: 0,
            },
          },
        },
        include: {
          matrixProfile: true,
          matrixSettings: true,
          matrixSlots: true,
        },
      });

      // Update sponsor direct referrals count if applicable
      if (normalizedSponsor) {
        const count = await prisma.user.count({ where: { sponsorAddress: normalizedSponsor } });
        await prisma.user.update({
          where: { address: normalizedSponsor },
          data: {
            directReferralsCount: count,
            isQualified: count >= 2,
          },
        }).catch(() => {});
      }

      // Record welcome activity
      await prisma.matrixActivity.create({
        data: {
          userAddress: canonicalAddress,
          action: "MEMBER_JOINED",
          title: "Account Activated",
          description: `Joined EQUORA Matrix Network as Operative #${nextUserId}`,
          slotNumber: 1,
        },
      }).catch(() => {});
    } else if (!user.matrixProfile) {
      await prisma.matrixProfile.create({
        data: {
          userAddress: canonicalAddress,
          username: `Operative #${user.userId}`,
        },
      }).catch(() => {});
      user = await prisma.user.findUnique({
        where: { address: canonicalAddress },
        include: { matrixProfile: true, matrixSettings: true, matrixSlots: true },
      }) as any;
    }

    return this.getUserProfile(canonicalAddress);
  }

  async getUserProfile(address: string, sponsorAddress?: string): Promise<MatrixUserProfileDTO> {
    const canonicalAddress = address.toLowerCase();

    let user = await prisma.user.findUnique({
      where: { address: canonicalAddress },
      include: {
        matrixProfile: true,
        sponsor: { select: { address: true, userId: true } },
        matrixSlots: { where: { isUnlocked: true }, orderBy: { slotNumber: "desc" } },
      },
    });

    if (!user) {
      return this.getOrCreateUser(canonicalAddress, sponsorAddress);
    }

    const profile = user.matrixProfile;
    const highestSlot = user.matrixSlots[0]?.slotNumber ?? 1;

    // Team count calculation: recursive or 3-tier count
    const directTeamCount = await prisma.user.count({
      where: { sponsorAddress: canonicalAddress },
    });

    return {
      address: canonicalAddress,
      userId: user.userId,
      username: profile?.username || `Operative #${user.userId}`,
      avatarUrl: profile?.avatarUrl || null,
      bio: profile?.bio || null,
      telegram: profile?.telegram || null,
      twitter: profile?.twitter || null,
      sponsorAddress: user.sponsorAddress,
      sponsorUserId: user.sponsor?.userId || null,
      directReferralsCount: user.directReferralsCount,
      teamCount: directTeamCount,
      rankTier: profile?.rankTier || 0,
      rankName: getRankName(profile?.rankTier || 0),
      totalEarnings: Number(profile?.totalEarnings || 0),
      directEarnings: Number(profile?.directEarnings || 0),
      matrixEarnings: Number(profile?.matrixEarnings || 0),
      poolEarnings: Number(profile?.poolEarnings || 0),
      availableBalance: Number(profile?.availableBalance || 0),
      withdrawnTotal: Number(profile?.withdrawnTotal || 0),
      recyclesCount: profile?.recyclesCount || 0,
      highestUnlockedSlot: highestSlot,
      joinedAt: user.registrationTimestamp,
    };
  }

  async updateUserProfile(
    address: string,
    data: {
      username?: string;
      avatarUrl?: string;
      bio?: string;
      telegram?: string;
      twitter?: string;
    }
  ): Promise<MatrixUserProfileDTO> {
    const canonicalAddress = address.toLowerCase();

    await prisma.matrixProfile.upsert({
      where: { userAddress: canonicalAddress },
      update: {
        ...(data.username !== undefined ? { username: data.username.trim() } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.telegram !== undefined ? { telegram: data.telegram } : {}),
        ...(data.twitter !== undefined ? { twitter: data.twitter } : {}),
      },
      create: {
        userAddress: canonicalAddress,
        username: data.username?.trim() || "Operative",
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        telegram: data.telegram,
        twitter: data.twitter,
      },
    });

    return this.getUserProfile(canonicalAddress);
  }

  // ── SLOTS & MATRIX NAVIGATION ─────────────────────────────────────────────

  async getUserSlots(address: string): Promise<MatrixSlotSummaryDTO[]> {
    const canonicalAddress = address.toLowerCase();
    const slots = await prisma.matrixSlot.findMany({
      where: { userAddress: canonicalAddress },
      orderBy: { slotNumber: "asc" },
    });

    const slotsMap = new Map<number, any>(slots.map((s: any) => [s.slotNumber, s]));

    return Array.from({ length: 12 }, (_, i) => {
      const slotNumber = i + 1;
      const s = slotsMap.get(slotNumber);
      return {
        slotNumber,
        cost: SLOT_COSTS[slotNumber] || 0,
        isUnlocked: s?.isUnlocked ?? (slotNumber === 1),
        currentCycle: s?.currentCycle ?? 1,
        recyclesCount: s?.recyclesCount ?? 0,
        filledNodes: s?.filledNodes ?? 0,
        upgradeReserve: Number(s?.upgradeReserve ?? 0),
        totalEarned: Number(s?.totalEarned ?? 0),
        unlockedAt: s?.unlockedAt ?? null,
      };
    });
  }

  async getSlotDetails(
    address: string,
    slotNumber: number,
    cycle?: number
  ): Promise<MatrixSlotDetailsDTO | null> {
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

    const targetCycle = cycle || slot?.currentCycle || 1;
    const currentPlacements: any[] =
      slot?.placements.filter((p: any) => p.cycle === targetCycle) ?? [];

    const directReferrals = await prisma.user.findMany({
      where: { sponsorAddress: canonicalAddress },
      select: { address: true },
    });
    const directSet = new Set(directReferrals.map((r: any) => r.address.toLowerCase()));

    const nodesArray = Array.from({ length: 14 }, (_, i) => {
      const pos = i + 1;
      const level = getLevelForPosition(pos);
      const placement = currentPlacements.find((p: any) => p.position === pos);
      if (placement) {
        const isDirect = directSet.has(placement.placedUserAddress.toLowerCase());
        return {
          position: pos,
          level,
          filled: true,
          placedUser: placement.placedUserAddress,
          userId: placement.placedUser?.userId ?? null,
          payoutType: placement.payoutType,
          recipientAddress: placement.recipientAddress,
          wasFallback: placement.wasFallback,
          amount: Number(placement.amount),
          timestamp: placement.timestamp,
          isDirect,
          isSpillover: !isDirect,
        };
      }
      return {
        position: pos,
        level,
        filled: false,
        placedUser: null,
        userId: null,
        payoutType: null,
        recipientAddress: null,
        wasFallback: false,
        amount: 0,
        timestamp: null,
        isDirect: false,
        isSpillover: false,
      };
    });

    return {
      slotNumber,
      cost: SLOT_COSTS[slotNumber] || 0,
      isUnlocked: slot?.isUnlocked ?? (slotNumber === 1),
      currentCycle: targetCycle,
      recyclesCount: slot?.recyclesCount ?? 0,
      filledNodes: slot?.filledNodes ?? 0,
      upgradeReserve: Number(slot?.upgradeReserve ?? 0),
      totalEarned: Number(slot?.totalEarned ?? 0),
      nodes: nodesArray,
    };
  }

  // ── MATRIX BUY & PLACEMENT LOGIC ──────────────────────────────────────────

  async buySlot(
    userAddress: string,
    slotNumber: number,
    txHash?: string
  ): Promise<{ success: boolean; slot: MatrixSlotSummaryDTO; message: string }> {
    const canonicalAddress = userAddress.toLowerCase();

    if (slotNumber < 1 || slotNumber > 12) {
      throw new Error("Invalid slot number (must be 1-12)");
    }

    // Ensure user exists
    await this.getOrCreateUser(canonicalAddress);

    // If slot > 1, check prior slot is unlocked
    if (slotNumber > 1) {
      const priorSlot = await prisma.matrixSlot.findUnique({
        where: {
          userAddress_slotNumber: {
            userAddress: canonicalAddress,
            slotNumber: slotNumber - 1,
          },
        },
      });
      if (!priorSlot || !priorSlot.isUnlocked) {
        throw new Error(`You must unlock Slot #${slotNumber - 1} before unlocking Slot #${slotNumber}`);
      }
    }

    const slotCost = SLOT_COSTS[slotNumber] || 0;

    // Check or upsert slot
    const slot = await prisma.matrixSlot.upsert({
      where: {
        userAddress_slotNumber: {
          userAddress: canonicalAddress,
          slotNumber,
        },
      },
      update: {
        isUnlocked: true,
        unlockedAt: new Date(),
      },
      create: {
        userAddress: canonicalAddress,
        slotNumber,
        isUnlocked: true,
        unlockedAt: new Date(),
        currentCycle: 1,
        filledNodes: 0,
        upgradeReserve: 0,
        totalEarned: 0,
      },
    });

    // Determine upline sponsor for matrix placement
    const currentUser = await prisma.user.findUnique({
      where: { address: canonicalAddress },
    });
    const uplineAddress = currentUser?.sponsorAddress || null;

    if (uplineAddress) {
      // Find upline's slot
      const uplineSlot = await prisma.matrixSlot.findUnique({
        where: {
          userAddress_slotNumber: {
            userAddress: uplineAddress,
            slotNumber,
          },
        },
      });

      if (uplineSlot && uplineSlot.isUnlocked) {
        const nextPos = (uplineSlot.filledNodes % 14) + 1;
        const currentUplineCycle = uplineSlot.currentCycle;

        // Determine payout type based on position
        let payoutType = "OWNER_DIRECT";
        let recipient = uplineAddress;
        let amount = slotCost;

        if (nextPos <= 2) {
          payoutType = "UPLINE_1";
        } else if (nextPos <= 6) {
          payoutType = "UPLINE_2";
        } else if (nextPos >= 7 && nextPos <= 10) {
          payoutType = "OWNER_DIRECT";
        } else if (nextPos === 11 || nextPos === 12) {
          payoutType = "AUTO_UPGRADE";
        } else if (nextPos === 13) {
          payoutType = "DAO_POOL";
        } else if (nextPos === 14) {
          payoutType = "RECYCLE_SPONSOR";
        }

        // Record placement
        const genTxHash = txHash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

        await prisma.matrixPlacement.create({
          data: {
            matrixOwnerAddress: uplineAddress,
            placedUserAddress: canonicalAddress,
            slotNumber,
            position: nextPos,
            cycle: currentUplineCycle,
            payoutType,
            recipientAddress: recipient,
            wasFallback: false,
            amount,
            txHash: genTxHash,
            blockNumber: BigInt(1000000),
            timestamp: new Date(),
          },
        });

        // Update upline slot counters
        const newFilled = uplineSlot.filledNodes + 1;
        if (newFilled >= 14) {
          // Complete cycle & recycle
          await prisma.matrixCycleEvent.create({
            data: {
              userAddress: uplineAddress,
              slotNumber,
              cycleNumber: currentUplineCycle,
              nodes: [],
              completedAt: new Date(),
              txHash: genTxHash,
              blockNumber: BigInt(1000000),
            },
          });

          await prisma.matrixSlot.update({
            where: { id: uplineSlot.id },
            data: {
              currentCycle: currentUplineCycle + 1,
              recyclesCount: uplineSlot.recyclesCount + 1,
              filledNodes: 0,
              totalEarned: { increment: amount },
            },
          });

          await prisma.matrixProfile.update({
            where: { userAddress: uplineAddress },
            data: {
              recyclesCount: { increment: 1 },
              totalEarnings: { increment: amount },
              availableBalance: { increment: amount },
            },
          }).catch(() => {});
        } else {
          await prisma.matrixSlot.update({
            where: { id: uplineSlot.id },
            data: {
              filledNodes: newFilled,
              totalEarned: { increment: amount },
              ...(payoutType === "AUTO_UPGRADE" ? { upgradeReserve: { increment: amount } } : {}),
            },
          });

          await prisma.matrixProfile.update({
            where: { userAddress: uplineAddress },
            data: {
              totalEarnings: { increment: amount },
              availableBalance: { increment: amount },
            },
          }).catch(() => {});
        }
      }
    }

    // Record buyer transaction
    const buyTxHash = txHash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    await prisma.matrixTransaction.create({
      data: {
        userAddress: canonicalAddress,
        type: "SLOT_PURCHASE",
        slotNumber,
        cycle: 1,
        amount: slotCost,
        amountUsd: slotCost * TROB_PRICE_USD,
        token: "TROB",
        txHash: buyTxHash,
        status: "COMPLETED",
        description: `Unlocked Matrix Slot #${slotNumber} for ${slotCost} TROB`,
      },
    });

    // Record activity
    await prisma.matrixActivity.create({
      data: {
        userAddress: canonicalAddress,
        action: "SLOT_ACTIVATED",
        title: `Slot #${slotNumber} Activated`,
        description: `Successfully unlocked Slot #${slotNumber} for ${slotCost} TROB`,
        slotNumber,
        amount: slotCost,
        txHash: buyTxHash,
      },
    });

    const summary: MatrixSlotSummaryDTO = {
      slotNumber,
      cost: slotCost,
      isUnlocked: true,
      currentCycle: slot.currentCycle,
      recyclesCount: slot.recyclesCount,
      filledNodes: slot.filledNodes,
      upgradeReserve: Number(slot.upgradeReserve),
      totalEarned: Number(slot.totalEarned),
      unlockedAt: slot.unlockedAt,
    };

    return {
      success: true,
      slot: summary,
      message: `Successfully unlocked Slot #${slotNumber}!`,
    };
  }

  // ── DASHBOARD AGGREGATE ───────────────────────────────────────────────────

  async getDashboardOverview(address: string): Promise<MatrixDashboardDTO> {
    const canonicalAddress = address.toLowerCase();
    const user = await this.getOrCreateUser(canonicalAddress);

    const slots = await prisma.matrixSlot.findMany({
      where: { userAddress: canonicalAddress, isUnlocked: true },
      orderBy: { slotNumber: "desc" },
    });

    const highestSlot = slots[0]?.slotNumber || 1;
    const activeSlot = slots[0] || {
      slotNumber: 1,
      filledNodes: 0,
      currentCycle: 1,
      upgradeReserve: 0,
    };

    const filled = activeSlot.filledNodes;
    const l1 = Math.min(filled, 2);
    const l2 = Math.min(Math.max(filled - 2, 0), 4);
    const l3 = Math.min(Math.max(filled - 6, 0), 8);

    const nextPosNumber = (filled % 14) + 1;
    let nextPosTitle = `Position #${nextPosNumber}`;
    let nextPosDesc = "Direct matrix commission distribution";
    let nextReward = "Direct Distribution";

    if (nextPosNumber <= 2) {
      nextPosTitle = `Position #${nextPosNumber} - Direct Line 1`;
      nextPosDesc = "Distributed directly to level 1 direct upline";
      nextReward = "Pass-Up / Sponsor";
    } else if (nextPosNumber <= 6) {
      nextPosTitle = `Position #${nextPosNumber} - Level 2 Matrix`;
      nextPosDesc = "Distributed to level 2 upline structure";
      nextReward = "Direct Payout";
    } else if (nextPosNumber === 11 || nextPosNumber === 12) {
      nextPosTitle = `Position #${nextPosNumber} - Auto-Upgrade Reserve`;
      nextPosDesc = "Reserved for auto-advancing to the next tier slot";
      nextReward = "Auto-Upgrade";
    } else if (nextPosNumber === 13) {
      nextPosTitle = `Position #${nextPosNumber} - 4-Bucket Split`;
      nextPosDesc = "DAO 35%, Salary 40%, Magic Box 10%, Rewards 15%";
      nextReward = "Pool Accumulator";
    } else if (nextPosNumber === 14) {
      nextPosTitle = `Position #${nextPosNumber} - Matrix Recycle`;
      nextPosDesc = "Completes current cycle & re-opens slot under sponsor";
      nextReward = "Recycle Re-entry";
    }

    const activities = await prisma.matrixActivity.findMany({
      where: { userAddress: canonicalAddress },
      orderBy: { timestamp: "desc" },
      take: 8,
    });

    const recentActivity = activities.map((a: any) => ({
      id: a.id,
      action: a.action,
      title: a.title,
      description: a.description,
      slotNumber: a.slotNumber || undefined,
      amount: a.amount ? Number(a.amount) : undefined,
      timestamp: a.timestamp,
      status: "Success",
    }));

    return {
      currentSlot: highestSlot,
      totalEarnedTrob: user.totalEarnings,
      totalEarnedUsd: user.totalEarnings * TROB_PRICE_USD,
      availableWithdrawTrob: user.availableBalance,
      availableWithdrawUsd: user.availableBalance * TROB_PRICE_USD,
      recyclesCount: user.recyclesCount,
      trobPriceUsd: TROB_PRICE_USD,
      activeSlotProgress: {
        slotNumber: activeSlot.slotNumber,
        filledNodes: filled,
        totalNodes: 14,
        cycle: activeSlot.currentCycle,
        upgradeReserve: Number(activeSlot.upgradeReserve),
        level1Filled: l1,
        level2Filled: l2,
        level3Filled: l3,
      },
      nextPosition: {
        positionNumber: nextPosNumber,
        title: nextPosTitle,
        description: nextPosDesc,
        rewardType: nextReward,
      },
      recentActivity,
    };
  }

  // ── LEADERBOARD ───────────────────────────────────────────────────────────

  async getLeaderboard(
    period: "all" | "month" | "week" = "all",
    limit = 25
  ): Promise<MatrixLeaderboardEntryDTO[]> {
    const profiles = await prisma.matrixProfile.findMany({
      orderBy: { totalEarnings: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            address: true,
            userId: true,
            directReferralsCount: true,
            matrixSlots: {
              where: { isUnlocked: true },
              orderBy: { slotNumber: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    return profiles.map((p: any, idx: number) => {
      const highestSlot = p.user?.matrixSlots[0]?.slotNumber || 1;
      const totalEarned = Number(p.totalEarnings);
      return {
        rank: idx + 1,
        address: p.userAddress,
        userId: p.user?.userId || 0,
        username: p.username || `Operative #${p.user?.userId || idx + 1}`,
        avatarUrl: p.avatarUrl,
        totalEarned,
        totalEarnedUsd: totalEarned * TROB_PRICE_USD,
        directCount: p.user?.directReferralsCount || 0,
        highestSlot,
        rankTier: p.rankTier,
        rankName: getRankName(p.rankTier),
      };
    });
  }

  async getUserRank(address: string): Promise<{ rank: number; totalUsers: number }> {
    const canonicalAddress = address.toLowerCase();
    const userProfile = await prisma.matrixProfile.findUnique({
      where: { userAddress: canonicalAddress },
    });

    if (!userProfile) return { rank: 1, totalUsers: 1 };

    const higherCount = await prisma.matrixProfile.count({
      where: { totalEarnings: { gt: userProfile.totalEarnings } },
    });
    const totalUsers = await prisma.matrixProfile.count();

    return { rank: higherCount + 1, totalUsers: Math.max(totalUsers, 1) };
  }

  // ── TRANSACTIONS ──────────────────────────────────────────────────────────

  async getTransactions(
    address: string,
    options: { page?: number; limit?: number; type?: string } = {}
  ): Promise<{
    items: MatrixTransactionDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: {
      totalInflow: number;
      totalOutflow: number;
      pendingCount: number;
      netProfit: number;
    };
  }> {
    const canonicalAddress = address.toLowerCase();
    const page = options.page || 1;
    const limit = options.limit || 15;
    const skip = (page - 1) * limit;

    const where: any = { userAddress: canonicalAddress };
    if (options.type && options.type !== "ALL") {
      where.type = options.type;
    }

    const [total, txs, allUserTxs] = await Promise.all([
      prisma.matrixTransaction.count({ where }),
      prisma.matrixTransaction.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
      prisma.matrixTransaction.findMany({
        where: { userAddress: canonicalAddress },
        select: { type: true, amount: true, status: true },
      }),
    ]);

    let totalInflow = 0;
    let totalOutflow = 0;
    let pendingCount = 0;

    for (const t of allUserTxs) {
      const amt = Number(t.amount);
      if (t.type === "WITHDRAWAL" || t.type === "SLOT_PURCHASE") {
        totalOutflow += amt;
      } else {
        totalInflow += amt;
      }
      if (t.status === "PENDING") pendingCount++;
    }

    const items: MatrixTransactionDTO[] = txs.map((t: any) => ({
      id: t.id,
      type: t.type,
      slotNumber: t.slotNumber,
      cycle: t.cycle,
      position: t.position,
      amount: Number(t.amount),
      amountUsd: t.amountUsd ? Number(t.amountUsd) : Number(t.amount) * TROB_PRICE_USD,
      token: t.token,
      fromAddress: t.fromAddress,
      toAddress: t.toAddress,
      txHash: t.txHash,
      status: t.status,
      description: t.description,
      timestamp: t.timestamp,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      stats: {
        totalInflow,
        totalOutflow,
        pendingCount,
        netProfit: totalInflow - totalOutflow,
      },
    };
  }

  // ── EARNINGS & WITHDRAWALS ─────────────────────────────────────────────────

  async getEarningsOverview(address: string): Promise<MatrixEarningsOverviewDTO> {
    const canonicalAddress = address.toLowerCase();
    const user = await this.getUserProfile(canonicalAddress);

    const recentTxs = await prisma.matrixTransaction.findMany({
      where: {
        userAddress: canonicalAddress,
        type: { not: "SLOT_PURCHASE" },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    const recentPayouts: MatrixTransactionDTO[] = recentTxs.map((t: any) => ({
      id: t.id,
      type: t.type,
      slotNumber: t.slotNumber,
      cycle: t.cycle,
      position: t.position,
      amount: Number(t.amount),
      amountUsd: t.amountUsd ? Number(t.amountUsd) : Number(t.amount) * TROB_PRICE_USD,
      token: t.token,
      fromAddress: t.fromAddress,
      toAddress: t.toAddress,
      txHash: t.txHash,
      status: t.status,
      description: t.description,
      timestamp: t.timestamp,
    }));

    // Mock 7-day trend based on user earnings
    const total = user.totalEarnings;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const chartData = days.map((day, idx) => ({
      date: day,
      amount: Math.round((total / 7) * (0.6 + (idx * 0.12)) * 100) / 100,
    }));

    return {
      totalEarnings: user.totalEarnings,
      totalEarningsUsd: user.totalEarnings * TROB_PRICE_USD,
      availableBalance: user.availableBalance,
      availableBalanceUsd: user.availableBalance * TROB_PRICE_USD,
      withdrawnTotal: user.withdrawnTotal,
      withdrawnTotalUsd: user.withdrawnTotal * TROB_PRICE_USD,
      trobPriceUsd: TROB_PRICE_USD,
      breakdown: {
        directBonus: user.directEarnings || Math.round(total * 0.35 * 100) / 100,
        matrixPlacements: user.matrixEarnings || Math.round(total * 0.45 * 100) / 100,
        upgradeReserves: Math.round(total * 0.1 * 100) / 100,
        poolShares: user.poolEarnings || Math.round(total * 0.1 * 100) / 100,
      },
      chartData,
      recentPayouts,
    };
  }

  async requestWithdrawal(
    address: string,
    amount: number
  ): Promise<{ success: boolean; amountWithdrawn: number; txHash: string; remainingBalance: number }> {
    const canonicalAddress = address.toLowerCase();

    if (amount <= 0) throw new Error("Withdrawal amount must be greater than zero");

    const profile = await prisma.matrixProfile.findUnique({
      where: { userAddress: canonicalAddress },
    });

    if (!profile || Number(profile.availableBalance) < amount) {
      throw new Error(`Insufficient available balance. Available: ${Number(profile?.availableBalance || 0)} TROB`);
    }

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    // Execute atomic balance deduction
    const updated = await prisma.matrixProfile.update({
      where: { userAddress: canonicalAddress },
      data: {
        availableBalance: { decrement: amount },
        withdrawnTotal: { increment: amount },
      },
    });

    // Record ledger transaction
    await prisma.matrixTransaction.create({
      data: {
        userAddress: canonicalAddress,
        type: "WITHDRAWAL",
        amount,
        amountUsd: amount * TROB_PRICE_USD,
        token: "TROB",
        txHash,
        status: "COMPLETED",
        description: `Withdrew ${amount} TROB to wallet`,
      },
    });

    // Record withdrawal audit
    await prisma.withdrawal.create({
      data: {
        userAddress: canonicalAddress,
        source: "MATRIX",
        amount,
        txHash,
        blockNumber: BigInt(1000000),
        timestamp: new Date(),
      },
    });

    // Record activity
    await prisma.matrixActivity.create({
      data: {
        userAddress: canonicalAddress,
        action: "WITHDRAWAL_COMPLETED",
        title: "Withdrawal Completed",
        description: `Successfully processed withdrawal of ${amount} TROB`,
        amount,
        txHash,
      },
    });

    return {
      success: true,
      amountWithdrawn: amount,
      txHash,
      remainingBalance: Number(updated.availableBalance),
    };
  }

  // ── SETTINGS ──────────────────────────────────────────────────────────────

  async getUserSettings(address: string): Promise<MatrixSettingsDTO> {
    const canonicalAddress = address.toLowerCase();

    try {
      const user = await prisma.user.findUnique({
        where: { address: canonicalAddress },
      });

      if (!user) {
        const cached = inMemorySettingsCache.get(canonicalAddress);
        if (cached) return cached;
        return {
          autoUpgrade: true,
          autoReinvest: true,
          telegramNotifications: true,
          emailNotifications: false,
          soundEffects: true,
          currency: "USD",
          theme: "dark",
          matrixDisplayMode: "level",
          hideZeroBalances: false,
          email: null,
          telegram: null,
          notifications: {
            telegramNotifications: true,
            emailNotifications: false,
            soundEffects: true,
            matrixActivity: true,
            levelUpdates: true,
            referralJoined: true,
            cycleCompletion: true,
            earningsReward: true,
            leaderboardRank: true,
            announcements: false,
          },
        };
      }

      const settings = await prisma.matrixSettings.upsert({
        where: { userAddress: canonicalAddress },
        update: {},
        create: {
          userAddress: canonicalAddress,
          autoUpgrade: true,
          autoReinvest: true,
          telegramNotifications: true,
          emailNotifications: false,
          soundEffects: true,
          currency: "USD",
          theme: "dark",
          matrixDisplayMode: "level",
        },
      });

      const dto: MatrixSettingsDTO = {
        autoUpgrade: settings.autoUpgrade,
        autoReinvest: settings.autoReinvest,
        telegramNotifications: settings.telegramNotifications,
        emailNotifications: settings.emailNotifications,
        soundEffects: settings.soundEffects,
        currency: settings.currency,
        theme: settings.theme,
        matrixDisplayMode: settings.matrixDisplayMode,
        hideZeroBalances: settings.hideZeroBalances,
        email: settings.email,
        telegram: settings.telegram,
        notifications: {
          telegramNotifications: settings.telegramNotifications,
          emailNotifications: settings.emailNotifications,
          soundEffects: settings.soundEffects,
          matrixActivity: settings.telegramNotifications,
          levelUpdates: settings.telegramNotifications,
          referralJoined: settings.telegramNotifications,
          cycleCompletion: settings.telegramNotifications,
          earningsReward: settings.telegramNotifications,
          leaderboardRank: settings.telegramNotifications,
          announcements: settings.emailNotifications,
        },
      };

      inMemorySettingsCache.set(canonicalAddress, dto);
      return dto;
    } catch (err) {
      console.warn(`[MatrixService] DB unreachable, returning fallback settings for ${canonicalAddress}`);
      const cached = inMemorySettingsCache.get(canonicalAddress);
      if (cached) return cached;

      return {
        autoUpgrade: true,
        autoReinvest: true,
        telegramNotifications: true,
        emailNotifications: false,
        soundEffects: true,
        currency: "USD",
        theme: "dark",
        matrixDisplayMode: "level",
        hideZeroBalances: false,
        email: null,
        telegram: null,
        notifications: {
          telegramNotifications: true,
          emailNotifications: false,
          soundEffects: true,
          matrixActivity: true,
          levelUpdates: true,
          referralJoined: true,
          cycleCompletion: true,
          earningsReward: true,
          leaderboardRank: true,
          announcements: false,
        },
      };
    }
  }

  async updateUserSettings(
    address: string,
    data: Partial<MatrixSettingsDTO>
  ): Promise<MatrixSettingsDTO> {
    const canonicalAddress = address.toLowerCase();

    const notifs = data.notifications || {};
    const effectiveTelegram =
      data.telegramNotifications !== undefined
        ? data.telegramNotifications
        : notifs.telegramNotifications !== undefined
        ? notifs.telegramNotifications
        : notifs.matrixActivity !== undefined
        ? notifs.matrixActivity
        : undefined;

    const effectiveEmail =
      data.emailNotifications !== undefined
        ? data.emailNotifications
        : notifs.emailNotifications !== undefined
        ? notifs.emailNotifications
        : notifs.announcements !== undefined
        ? notifs.announcements
        : undefined;

    const effectiveSound =
      data.soundEffects !== undefined
        ? data.soundEffects
        : notifs.soundEffects !== undefined
        ? notifs.soundEffects
        : undefined;

    const effectiveAutoUpgrade =
      data.autoUpgrade !== undefined
        ? data.autoUpgrade
        : notifs.autoUpgrade !== undefined
        ? notifs.autoUpgrade
        : undefined;

    const effectiveAutoReinvest =
      data.autoReinvest !== undefined
        ? data.autoReinvest
        : notifs.autoReinvest !== undefined
        ? notifs.autoReinvest
        : undefined;

    try {
      const user = await prisma.user.findUnique({
        where: { address: canonicalAddress },
      });

      if (!user) {
        const existing = (await this.getUserSettings(canonicalAddress)) || ({} as any);
        const merged: MatrixSettingsDTO = {
          ...existing,
          ...data,
          notifications: {
            ...(existing.notifications || {}),
            ...(data.notifications || {}),
          },
        };
        inMemorySettingsCache.set(canonicalAddress, merged);
        return merged;
      }

      const updated = await prisma.matrixSettings.upsert({
        where: { userAddress: canonicalAddress },
        update: {
          ...(effectiveAutoUpgrade !== undefined ? { autoUpgrade: effectiveAutoUpgrade } : {}),
          ...(effectiveAutoReinvest !== undefined ? { autoReinvest: effectiveAutoReinvest } : {}),
          ...(effectiveTelegram !== undefined ? { telegramNotifications: effectiveTelegram } : {}),
          ...(effectiveEmail !== undefined ? { emailNotifications: effectiveEmail } : {}),
          ...(effectiveSound !== undefined ? { soundEffects: effectiveSound } : {}),
          ...(data.currency !== undefined ? { currency: data.currency } : {}),
          ...(data.theme !== undefined ? { theme: data.theme } : {}),
          ...(data.matrixDisplayMode !== undefined ? { matrixDisplayMode: data.matrixDisplayMode } : {}),
          ...(data.hideZeroBalances !== undefined ? { hideZeroBalances: data.hideZeroBalances } : {}),
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(data.telegram !== undefined ? { telegram: data.telegram } : {}),
        },
        create: {
          userAddress: canonicalAddress,
          autoUpgrade: effectiveAutoUpgrade ?? true,
          autoReinvest: effectiveAutoReinvest ?? true,
          telegramNotifications: effectiveTelegram ?? true,
          emailNotifications: effectiveEmail ?? false,
          soundEffects: effectiveSound ?? true,
          currency: data.currency ?? "USD",
          theme: data.theme ?? "dark",
          matrixDisplayMode: data.matrixDisplayMode ?? "level",
          hideZeroBalances: data.hideZeroBalances ?? false,
          email: data.email,
          telegram: data.telegram,
        },
      });

      const result: MatrixSettingsDTO = {
        autoUpgrade: updated.autoUpgrade,
        autoReinvest: updated.autoReinvest,
        telegramNotifications: updated.telegramNotifications,
        emailNotifications: updated.emailNotifications,
        soundEffects: updated.soundEffects,
        currency: updated.currency,
        theme: updated.theme,
        matrixDisplayMode: updated.matrixDisplayMode,
        hideZeroBalances: updated.hideZeroBalances,
        email: updated.email,
        telegram: updated.telegram,
        notifications: {
          telegramNotifications: updated.telegramNotifications,
          emailNotifications: updated.emailNotifications,
          soundEffects: updated.soundEffects,
          matrixActivity: updated.telegramNotifications,
          levelUpdates: updated.telegramNotifications,
          referralJoined: updated.telegramNotifications,
          cycleCompletion: updated.telegramNotifications,
          earningsReward: updated.telegramNotifications,
          leaderboardRank: updated.telegramNotifications,
          announcements: updated.emailNotifications,
        },
      };

      inMemorySettingsCache.set(canonicalAddress, result);
      return result;
    } catch (err) {
      console.warn(`[MatrixService] DB unreachable on updateUserSettings for ${canonicalAddress}, caching in-memory`);
      const existing = (await this.getUserSettings(canonicalAddress)) || ({} as any);
      const merged: MatrixSettingsDTO = {
        ...existing,
        ...data,
        notifications: {
          ...(existing.notifications || {}),
          ...(data.notifications || {}),
        },
      };
      inMemorySettingsCache.set(canonicalAddress, merged);
      return merged;
    }
  }

  // ── DIRECT MEMBERS ────────────────────────────────────────────────────────

  async getDirectMembers(address: string): Promise<Array<{
    address: string;
    userId: number;
    username: string;
    joinedAt: Date;
    activeSlots: number;
    totalContributed: number;
  }>> {
    const canonicalAddress = address.toLowerCase();
    const directs = await prisma.user.findMany({
      where: { sponsorAddress: canonicalAddress },
      include: {
        matrixProfile: true,
        matrixSlots: { where: { isUnlocked: true } },
      },
      orderBy: { registrationTimestamp: "desc" },
    });

    return directs.map((d: any) => ({
      address: d.address,
      userId: d.userId,
      username: d.matrixProfile?.username || `Operative #${d.userId}`,
      joinedAt: d.registrationTimestamp,
      activeSlots: d.matrixSlots.length,
      totalContributed: d.matrixSlots.reduce(
        (sum: number, s: any) => sum + (SLOT_COSTS[s.slotNumber] || 0),
        0
      ),
    }));
  }

  // ── SEEDING DEV DATA ──────────────────────────────────────────────────────

  async seedMatrixDevData(userAddress: string): Promise<void> {
    const canonical = userAddress.toLowerCase();
    await this.getOrCreateUser(canonical);

    // Unlock slots 1, 2, 3, 4
    for (let slot = 1; slot <= 4; slot++) {
      await prisma.matrixSlot.upsert({
        where: { userAddress_slotNumber: { userAddress: canonical, slotNumber: slot } },
        update: {
          isUnlocked: true,
          filledNodes: slot === 1 ? 11 : slot === 2 ? 6 : slot === 3 ? 2 : 0,
          currentCycle: 1,
          totalEarned: (SLOT_COSTS[slot] || 30) * 3,
        },
        create: {
          userAddress: canonical,
          slotNumber: slot,
          isUnlocked: true,
          filledNodes: slot === 1 ? 11 : slot === 2 ? 6 : slot === 3 ? 2 : 0,
          currentCycle: 1,
          totalEarned: (SLOT_COSTS[slot] || 30) * 3,
        },
      });
    }

    // Update profile earnings
    await prisma.matrixProfile.update({
      where: { userAddress: canonical },
      data: {
        totalEarnings: 142.50,
        directEarnings: 45.00,
        matrixEarnings: 75.00,
        poolEarnings: 22.50,
        availableBalance: 87.50,
        withdrawnTotal: 55.00,
        recyclesCount: 1,
      },
    }).catch(() => {});

    // Create 3 dummy direct members
    const dummyAddresses = [
      "0x3b1c8f94d0e28a57193c726b4859a01234567890",
      "0x7c4e12a95f82b3d64019e58273614950abcdef01",
      "0x9f2a4b6c8d0e1f3a5b7c9d1e3f5a7b9c0d2e4f6a",
    ];

    for (let i = 0; i < dummyAddresses.length; i++) {
      const addr = dummyAddresses[i];
      const existing = await prisma.user.findUnique({ where: { address: addr } });
      if (!existing) {
        const highestUser = await prisma.user.findFirst({
          orderBy: { userId: "desc" },
          select: { userId: true },
        });
        const nextId = (highestUser?.userId ?? 0) + 1;

        const dummyUser = await prisma.user.create({
          data: {
            address: addr,
            userId: nextId,
            sponsorAddress: canonical,
            registrationTimestamp: new Date(Date.now() - (i + 1) * 86400000),
            matrixProfile: {
              create: {
                username: `Cipher_${i + 1}`,
                totalEarnings: (i + 1) * 60,
              },
            },
          },
        });

        // Place into slot 1
        await prisma.matrixPlacement.create({
          data: {
            matrixOwnerAddress: canonical,
            placedUserAddress: addr,
            slotNumber: 1,
            position: i + 1,
            cycle: 1,
            payoutType: i === 0 ? "UPLINE_1" : "UPLINE_2",
            recipientAddress: canonical,
            wasFallback: false,
            amount: 30,
            txHash: `0xseedtx${i}00000000000000000000000000000000000000000000000000000000`,
            blockNumber: BigInt(1000 + i),
            timestamp: new Date(Date.now() - (i + 1) * 3600000),
          },
        }).catch(() => {});
      }
    }

    // Create activity records
    const sampleActs = [
      { action: "MEMBER_JOINED", title: "New Member Joined", description: "Slot #01 filled by 0x3b1...7890", amount: 30, slot: 1 },
      { action: "REWARD_RECEIVED", title: "Reward Received", description: "+12.50 TROB direct distribution", amount: 12.5, slot: 1 },
      { action: "CYCLE_COMPLETED", title: "Cycle Completed", description: "Slot #01 cycle completed & recycled", amount: 60, slot: 1 },
    ];

    for (const act of sampleActs) {
      await prisma.matrixActivity.create({
        data: {
          userAddress: canonical,
          action: act.action,
          title: act.title,
          description: act.description,
          slotNumber: act.slot,
          amount: act.amount,
        },
      }).catch(() => {});
    }
  }
}

export const matrixService = new MatrixService();
export * from "./model";
