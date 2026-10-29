import prisma from "@equora/database";
import { daoService, priceService } from "../dao";
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

export const BASE_SLOT_COST = 30;

export const SLOT_COSTS: Record<number, number> = {
  1: 30,
  2: 30,
  3: 30,
  4: 30,
  5: 30,
  6: 30,
  7: 30,
  8: 30,
  9: 30,
  10: 30,
  11: 30,
  12: 30,
};

export function getSlotCost(slotNumber: number): number {
  return 30;
}

export const DEFAULT_BENCHMARK_TROB_PRICE = 0.037146; // Live market fallback
export const TROB_PRICE_USD = DEFAULT_BENCHMARK_TROB_PRICE;

export function getRankName(tier: number): string {
  switch (tier) {
    case 1:
      return "ALPHA";
    case 2:
      return "PRIME";
    case 3:
      return "ELITE";
    case 4:
      return "CROWN";
    case 5:
      return "CROWN PRESTIGE";
    default:
      return "NONE";
  }
}

export function computeRankTier(highestSlot: number): number {
  if (highestSlot > 12) return 5;  // CROWN PRESTIGE (Infinite tier)
  if (highestSlot >= 10) return 4; // CROWN (Slots 10-12)
  if (highestSlot >= 7) return 3;  // ELITE (Slots 7-9)
  if (highestSlot >= 4) return 2;  // PRIME (Slots 4-6)
  if (highestSlot >= 1) return 1;  // ALPHA (Slots 1-3)
  return 0;
}

function getLevelForPosition(pos: number): number {
  if (pos <= 2) return 1;
  if (pos <= 6) return 2;
  return 3;
}

export async function getRootMatrixOwnerAddress(): Promise<string> {
  try {
    const rootUser = await prisma.user.findFirst({
      where: { userId: 1 },
      select: { address: true },
    });
    if (rootUser?.address) return rootUser.address.toLowerCase();

    const firstUser = await prisma.user.findFirst({
      orderBy: { userId: "asc" },
      select: { address: true },
    });
    if (firstUser?.address) return firstUser.address.toLowerCase();
  } catch {}
  return "0x0000000000000000000000000000000000000001";
}

function getFallbackProfile(canonicalAddress: string): MatrixUserProfileDTO {
  return {
    address: canonicalAddress,
    userId: 1,
    username: `Operative #${canonicalAddress.slice(2, 6).toUpperCase()}`,
    avatarUrl: null,
    bio: null,
    telegram: null,
    twitter: null,
    sponsorAddress: null,
    sponsorUserId: null,
    directReferralsCount: 0,
    activeDirectsCount: 0,
    isQualified: false,
    teamCount: 0,
    rankTier: 0,
    rankName: "NONE",
    totalEarnings: 0,
    directEarnings: 0,
    matrixEarnings: 0,
    poolEarnings: 0,
    availableBalance: 0,
    withdrawnTotal: 0,
    recyclesCount: 0,
    highestUnlockedSlot: 0,
    joinedAt: new Date(),
  };
}

function getFallbackUserSlots(): MatrixSlotSummaryDTO[] {
  return Array.from({ length: 12 }, (_, i) => {
    const slotNumber = i + 1;
    return {
      slotNumber,
      cost: SLOT_COSTS[slotNumber] || 0,
      isUnlocked: false,
      currentCycle: 1,
      recyclesCount: 0,
      filledNodes: 0,
      upgradeReserve: 0,
      totalEarned: 0,
      unlockedAt: null,
    };
  });
}

function getFallbackSlotDetails(slotNumber: number, cycle: number = 1): MatrixSlotDetailsDTO {
  const nodesArray = Array.from({ length: 14 }, (_, i) => {
    const pos = i + 1;
    return {
      position: pos,
      level: getLevelForPosition(pos),
      filled: false,
      placedUser: null,
      userId: null,
      payoutType: null,
      recipientAddress: null,
      wasFallback: false,
      amount: 0,
      timestamp: null,
      isDirect: false,
      isDirectDeposited: false,
      isSpillover: false,
    };
  });
  return {
    slotNumber,
    cost: SLOT_COSTS[slotNumber] || 0,
    isUnlocked: slotNumber === 1,
    currentCycle: cycle,
    recyclesCount: 0,
    filledNodes: 0,
    upgradeReserve: 0,
    totalEarned: 0,
    nodes: nodesArray,
  };
}

function getFallbackDashboard(canonicalAddress: string): MatrixDashboardDTO {
  return {
    currentSlot: 1,
    totalEarnedTrob: 0,
    totalEarnedUsd: 0,
    availableWithdrawTrob: 0,
    availableWithdrawUsd: 0,
    recyclesCount: 0,
    trobPriceUsd: TROB_PRICE_USD,
    isQualified: false,
    activeDirectsCount: 0,
    activeSlotProgress: {
      slotNumber: 1,
      filledNodes: 0,
      totalNodes: 14,
      cycle: 1,
      upgradeReserve: 0,
      level1Filled: 0,
      level2Filled: 0,
      level3Filled: 0,
    },
    nextPosition: {
      positionNumber: 1,
      title: "Position #1 - Direct Line 1",
      description: "Distributed directly to level 1 direct upline",
      rewardType: "Pass-Up / Sponsor",
    },
    recentActivity: [],
  };
}

function getFallbackEarningsOverview(): MatrixEarningsOverviewDTO {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    totalEarnings: 0,
    totalEarningsUsd: 0,
    availableBalance: 0,
    availableBalanceUsd: 0,
    withdrawnTotal: 0,
    withdrawnTotalUsd: 0,
    trobPriceUsd: TROB_PRICE_USD,
    breakdown: {
      directBonus: 0,
      matrixPlacements: 0,
      upgradeReserves: 0,
      poolShares: 0,
    },
    chartData: days.map((day) => ({ date: day, amount: 0 })),
    recentPayouts: [],
  };
}

const inMemorySettingsCache = new Map<string, MatrixSettingsDTO>();

export async function isUserMatrixQualified(address: string): Promise<boolean> {
  if (!address || address === "0x0000000000000000000000000000000000000000") return false;
  const canonical = address.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { address: canonical },
    select: { isQualified: true, userId: true, sponsorAddress: true },
  });
  if (!user) return false;
  // Genesis root (userId 1 or no sponsor) is always qualified as protocol apex
  if (user.userId === 1 || !user.sponsorAddress) return true;
  if (user.isQualified) return true;
  // Fallback: count active Slot 1 deposited directs (>= 2)
  const activeCount = await prisma.matrixSlot.count({
    where: {
      slotNumber: 1,
      isUnlocked: true,
      user: { sponsorAddress: canonical },
    },
  }).catch(() => 0);
  return activeCount >= 2;
}

export class MatrixService {
  // ── USER LIFECYCLE & PROFILE ──────────────────────────────────────────────

  async getOrCreateUser(address: string, sponsorAddress?: string): Promise<MatrixUserProfileDTO> {
    const canonicalAddress = address.toLowerCase();

    try {
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

        let createdNew = false;
        try {
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
                  isUnlocked: false,
                  unlockedAt: null,
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
          createdNew = true;
        } catch (err: any) {
          if (err?.code === "P2002") {
            user = await prisma.user.findUnique({
              where: { address: canonicalAddress },
              include: {
                matrixProfile: true,
                matrixSettings: true,
                matrixSlots: true,
              },
            });
          } else {
            throw err;
          }
        }

        // Update sponsor direct referrals count (qualification requires $30 deposit)
        if (createdNew && normalizedSponsor) {
          const count = await prisma.user.count({ where: { sponsorAddress: normalizedSponsor } }).catch(() => 0);
          const depositedCount = await prisma.matrixSlot.count({
            where: {
              slotNumber: 1,
              isUnlocked: true,
              user: { sponsorAddress: normalizedSponsor },
            },
          }).catch(() => 0);
          await prisma.user.update({
            where: { address: normalizedSponsor },
            data: {
              directReferralsCount: count,
              isQualified: depositedCount >= 2,
            },
          }).catch(() => {});
        }

        // Record welcome activity
        if (createdNew) {
          await prisma.matrixActivity.create({
            data: {
              userAddress: canonicalAddress,
              action: "MEMBER_JOINED",
              title: "Account Activated",
              description: `Joined EQUORA Matrix Network as Operative #${nextUserId}`,
              slotNumber: 1,
            },
          }).catch(() => {});
        }
      } else {
        const normalizedSponsor = sponsorAddress ? sponsorAddress.toLowerCase() : null;
        if (!user.sponsorAddress && normalizedSponsor && normalizedSponsor !== canonicalAddress) {
          await prisma.user.update({
            where: { address: canonicalAddress },
            data: { sponsorAddress: normalizedSponsor },
          }).catch(() => {});
          const count = await prisma.user.count({ where: { sponsorAddress: normalizedSponsor } }).catch(() => 0);
          await prisma.user.update({
            where: { address: normalizedSponsor },
            data: { directReferralsCount: count },
          }).catch(() => {});
        }

        if (!user.matrixProfile) {
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
      }

      return await this.getUserProfile(canonicalAddress);
    } catch (dbErr: any) {
      console.warn(`[MatrixService] DB notice in getOrCreateUser(${canonicalAddress}), returning fallback:`, dbErr?.message || dbErr);
      return getFallbackProfile(canonicalAddress);
    }
  }

  async getUserProfile(address: string, sponsorAddress?: string): Promise<MatrixUserProfileDTO> {
    const canonicalAddress = address.toLowerCase();

    try {
      let user = await prisma.user.findUnique({
        where: { address: canonicalAddress },
        include: {
          matrixProfile: true,
          sponsor: { select: { address: true, userId: true } },
          matrixSlots: { where: { isUnlocked: true }, orderBy: { slotNumber: "desc" } },
        },
      });

      if (!user) {
        return await this.getOrCreateUser(canonicalAddress, sponsorAddress);
      }

      const profile = user.matrixProfile;
      const highestSlot = user.matrixSlots[0]?.slotNumber ?? 0;

      // Team count and active qualification calculation
      const directTeamCount = await prisma.user.count({
        where: { sponsorAddress: canonicalAddress },
      }).catch(() => 0);

      const activeDirectsCount = await prisma.matrixSlot.count({
        where: {
          slotNumber: 1,
          isUnlocked: true,
          user: { sponsorAddress: canonicalAddress },
        },
      }).catch(() => 0);

      const isRoot = user.userId === 1 || !user.sponsorAddress;
      const isQualified = isRoot || activeDirectsCount >= 2;

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
        directReferralsCount: user.directReferralsCount || directTeamCount,
        activeDirectsCount,
        isQualified,
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
    } catch (dbErr: any) {
      console.warn(`[MatrixService] DB notice in getUserProfile(${canonicalAddress}), returning fallback:`, dbErr?.message || dbErr);
      return getFallbackProfile(canonicalAddress);
    }
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
    try {
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
          isUnlocked: Boolean(s?.isUnlocked),
          currentCycle: s?.currentCycle ?? 1,
          recyclesCount: s?.recyclesCount ?? 0,
          filledNodes: s?.filledNodes ?? 0,
          upgradeReserve: Number(s?.upgradeReserve ?? 0),
          totalEarned: Number(s?.totalEarned ?? 0),
          unlockedAt: s?.unlockedAt ?? null,
        };
      });
    } catch (dbErr: any) {
      console.warn(`[MatrixService] DB notice in getUserSlots(${canonicalAddress}), returning fallback:`, dbErr?.message || dbErr);
      return getFallbackUserSlots();
    }
  }

  async getSlotDetails(
    address: string,
    slotNumber: number,
    cycle?: number
  ): Promise<MatrixSlotDetailsDTO | null> {
    const canonicalAddress = address.toLowerCase();

    try {
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
        select: {
          address: true,
          matrixSlots: {
            where: { slotNumber: 1, isUnlocked: true },
            select: { id: true },
          },
        },
      }).catch(() => []);
      const directSet = new Set(directReferrals.map((r: any) => r.address.toLowerCase()));
      const depositedDirectSet = new Set(
        directReferrals
          .filter((r: any) => r.matrixSlots && r.matrixSlots.length > 0)
          .map((r: any) => r.address.toLowerCase())
      );

      const nodesArray = Array.from({ length: 14 }, (_, i) => {
        const pos = i + 1;
        const level = getLevelForPosition(pos);
        const placement = currentPlacements.find((p: any) => p.position === pos);
        if (placement) {
          const placedLower = placement.placedUserAddress.toLowerCase();
          const isDirect = directSet.has(placedLower);
          const isDirectDeposited = depositedDirectSet.has(placedLower);
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
            isDirectDeposited,
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
          isDirectDeposited: false,
          isSpillover: false,
        };
      });

      return {
        slotNumber,
        cost: SLOT_COSTS[slotNumber] || 0,
        isUnlocked: Boolean(slot?.isUnlocked),
        currentCycle: targetCycle,
        recyclesCount: slot?.recyclesCount ?? 0,
        filledNodes: slot?.filledNodes ?? 0,
        upgradeReserve: Number(slot?.upgradeReserve ?? 0),
        totalEarned: Number(slot?.totalEarned ?? 0),
        nodes: nodesArray,
      };
    } catch (dbErr: any) {
      console.warn(`[MatrixService] DB notice in getSlotDetails(${canonicalAddress}, ${slotNumber}), returning fallback:`, dbErr?.message || dbErr);
      return getFallbackSlotDetails(slotNumber, cycle || 1);
    }
  }

  // ── MATRIX BUY & PLACEMENT LOGIC ──────────────────────────────────────────

  async buySlot(
    userAddress: string,
    slotNumber: number,
    txHash?: string,
    sponsorAddress?: string
  ): Promise<{ success: boolean; slot: MatrixSlotSummaryDTO; message: string }> {
    const canonicalAddress = userAddress.toLowerCase();

    if (slotNumber < 1 || slotNumber > 12) {
      throw new Error("Invalid slot number (must be 1-12)");
    }

    // Ensure user exists
    await this.getOrCreateUser(canonicalAddress, sponsorAddress);

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
    let uplineAddress = currentUser?.sponsorAddress || null;

    // Organic entry fallback: if user has no sponsor and is not the root, route into Genesis Root Matrix
    if (!uplineAddress) {
      const rootAddress = await getRootMatrixOwnerAddress();
      if (rootAddress && rootAddress.toLowerCase() !== canonicalAddress) {
        uplineAddress = rootAddress;
        await prisma.user.update({
          where: { address: canonicalAddress },
          data: { sponsorAddress: uplineAddress },
        }).catch(() => {});
      }
    }

    if (uplineAddress) {
      // If Slot 1 deposit, update sponsor's active direct referrals count and qualification
      if (slotNumber === 1) {
        const depositedDirects = await prisma.matrixSlot.count({
          where: {
            slotNumber: 1,
            isUnlocked: true,
            user: { sponsorAddress: uplineAddress },
          },
        });
        const totalDirects = await prisma.user.count({
          where: { sponsorAddress: uplineAddress },
        });
        await prisma.user.update({
          where: { address: uplineAddress },
          data: {
            directReferralsCount: totalDirects,
            isQualified: depositedDirects >= 2,
          },
        }).catch(() => {});
      }

      // Resolve matrix owner with bubble-up upline traversal (up to 12 levels)
      let targetMatrixOwner: string = uplineAddress;
      let depth = 0;
      let uplineSlot: any = null;

      while (targetMatrixOwner && depth < 12) {
        const slotRec = await prisma.matrixSlot.findUnique({
          where: {
            userAddress_slotNumber: {
              userAddress: targetMatrixOwner,
              slotNumber,
            },
          },
        });

        const isOwnerQualified = await isUserMatrixQualified(targetMatrixOwner);
        const isSponsor = targetMatrixOwner.toLowerCase() === uplineAddress.toLowerCase();

        if (slotRec && slotRec.isUnlocked && (isSponsor || isOwnerQualified)) {
          uplineSlot = slotRec;
          break;
        }

        const parentUser = await prisma.user.findUnique({
          where: { address: targetMatrixOwner },
          select: { sponsorAddress: true },
        });
        if (!parentUser?.sponsorAddress || parentUser.sponsorAddress.toLowerCase() === targetMatrixOwner.toLowerCase()) {
          break;
        }
        targetMatrixOwner = parentUser.sponsorAddress;
        depth++;
      }

      // If matrix owner slot not yet initialized in DB, auto-initialize
      if (!uplineSlot && targetMatrixOwner) {
        uplineSlot = await prisma.matrixSlot.upsert({
          where: {
            userAddress_slotNumber: {
              userAddress: targetMatrixOwner,
              slotNumber,
            },
          },
          update: { isUnlocked: true },
          create: {
            userAddress: targetMatrixOwner,
            slotNumber,
            isUnlocked: true,
            currentCycle: 1,
            filledNodes: 0,
            upgradeReserve: 0,
            totalEarned: 0,
          },
        });
      }

      if (uplineSlot && uplineSlot.isUnlocked) {
        const nextPos = (uplineSlot.filledNodes % 14) + 1;
        const currentUplineCycle = uplineSlot.currentCycle;

        // Determine exact payout type & recipient according to EquoraMatrix.sol
        let payoutType = "OWNER_DIRECT";
        let recipient = targetMatrixOwner;
        let amount = slotCost;
        let isOwnerIncome = false;

        if (nextPos === 1) {
          // P1 -> Upline 1 (Sponsor of matrix owner)
          const matrixOwnerUser = await prisma.user.findUnique({
            where: { address: targetMatrixOwner },
            select: { sponsorAddress: true },
          });
          const upline1 = matrixOwnerUser?.sponsorAddress;
          if (upline1) {
            const isUp1Qualified = await isUserMatrixQualified(upline1);
            if (isUp1Qualified) {
              payoutType = "UPLINE_1";
              recipient = upline1;
            } else {
              payoutType = "PROTOCOL_POOL";
              recipient = "0xProtocolPools_EquoraVault";
            }
          } else {
            payoutType = "PROTOCOL_POOL";
            recipient = "0xProtocolPools_EquoraVault";
          }
        } else if (nextPos === 2) {
          // P2 -> Upline 2 (Sponsor of Upline 1, strictly distinct from Upline 1 and targetMatrixOwner to prevent double payout)
          const matrixOwnerUser = await prisma.user.findUnique({
            where: { address: targetMatrixOwner },
            select: { sponsorAddress: true },
          });
          const upline1 = matrixOwnerUser?.sponsorAddress;
          let upline2: string | null = null;

          if (upline1) {
            let currentSearch = upline1;
            let uplineDepth = 0;
            while (currentSearch && uplineDepth < 12) {
              const upRecord = await prisma.user.findUnique({
                where: { address: currentSearch },
                select: { sponsorAddress: true },
              });
              const candidate = upRecord?.sponsorAddress || null;
              if (!candidate || candidate.toLowerCase() === currentSearch.toLowerCase()) {
                break;
              }
              const isDistinct =
                candidate.toLowerCase() !== upline1.toLowerCase() &&
                candidate.toLowerCase() !== targetMatrixOwner.toLowerCase();
              if (isDistinct) {
                const isCandQualified = await isUserMatrixQualified(candidate);
                if (isCandQualified) {
                  upline2 = candidate;
                  break;
                }
              }
              currentSearch = candidate;
              uplineDepth++;
            }
          }

          if (upline2) {
            payoutType = "UPLINE_2";
            recipient = upline2;
          } else {
            payoutType = "PROTOCOL_POOL";
            recipient = "0xProtocolPools_EquoraVault";
          }
        } else if (
          nextPos === 3 || nextPos === 6 ||
          nextPos === 8 || nextPos === 9 ||
          nextPos === 11 || nextPos === 12
        ) {
          // P3, P6, P8, P9, P11, P12 -> Slot Owner (YOU) when qualified
          payoutType = "OWNER_DIRECT";
          const isOwnerQualified = await isUserMatrixQualified(targetMatrixOwner);
          if (isOwnerQualified) {
            recipient = targetMatrixOwner;
            isOwnerIncome = true;
          } else {
            recipient = "0xProtocolPools_EquoraVault";
            isOwnerIncome = false;
          }
        } else if (nextPos === 4 || nextPos === 5 || nextPos === 14) {
          // P4, P5, P14 -> 4 Protocol Pools (35% DAO, 40% Royalty, 15% Rewards, 10% Magic Blind Box)
          payoutType = "PROTOCOL_POOL";
          recipient = "0xProtocolPools_EquoraVault";
          isOwnerIncome = false;
        } else if (nextPos === 7) {
          // P7 -> Downline 1 (occupant at position 1 in this cycle). Fallback to Downline 2. Else pools.
          const dl1Node = await prisma.matrixPlacement.findFirst({
            where: { matrixOwnerAddress: targetMatrixOwner, slotNumber, cycle: currentUplineCycle, position: 1 },
            select: { placedUserAddress: true },
          });
          const dl2Node = await prisma.matrixPlacement.findFirst({
            where: { matrixOwnerAddress: targetMatrixOwner, slotNumber, cycle: currentUplineCycle, position: 2 },
            select: { placedUserAddress: true },
          });
          const dl1 = dl1Node?.placedUserAddress;
          const dl2 = dl2Node?.placedUserAddress;

          const dl1Qualified = dl1 ? await isUserMatrixQualified(dl1) : false;
          const dl2Qualified = dl2 ? await isUserMatrixQualified(dl2) : false;

          if (dl1 && dl1Qualified) {
            recipient = dl1;
            payoutType = "SPILLOVER_DOWNLINE1";
          } else if (dl2 && dl2Qualified) {
            recipient = dl2;
            payoutType = "SPILLOVER_DOWNLINE2";
          } else {
            recipient = "0xProtocolPools_EquoraVault";
            payoutType = "PROTOCOL_POOL";
          }
        } else if (nextPos === 10) {
          // P10 -> Downline 2 (occupant at position 2 in this cycle), strictly avoiding who was paid at P7
          const dl1Node = await prisma.matrixPlacement.findFirst({
            where: { matrixOwnerAddress: targetMatrixOwner, slotNumber, cycle: currentUplineCycle, position: 1 },
            select: { placedUserAddress: true },
          });
          const dl2Node = await prisma.matrixPlacement.findFirst({
            where: { matrixOwnerAddress: targetMatrixOwner, slotNumber, cycle: currentUplineCycle, position: 2 },
            select: { placedUserAddress: true },
          });
          const p7Placement = await prisma.matrixPlacement.findFirst({
            where: { matrixOwnerAddress: targetMatrixOwner, slotNumber, cycle: currentUplineCycle, position: 7 },
            select: { recipientAddress: true },
          });
          const alreadyPaidAtP7 = p7Placement?.recipientAddress ? p7Placement.recipientAddress.toLowerCase() : null;
          const dl1 = dl1Node?.placedUserAddress;
          const dl2 = dl2Node?.placedUserAddress;

          const dl1Qualified = dl1 ? await isUserMatrixQualified(dl1) : false;
          const dl2Qualified = dl2 ? await isUserMatrixQualified(dl2) : false;

          if (dl2 && dl2Qualified && dl2.toLowerCase() !== alreadyPaidAtP7) {
            recipient = dl2;
            payoutType = "SPILLOVER_DOWNLINE2";
          } else if (dl1 && dl1Qualified && dl1.toLowerCase() !== alreadyPaidAtP7) {
            recipient = dl1;
            payoutType = "SPILLOVER_DOWNLINE1";
          } else {
            recipient = "0xProtocolPools_EquoraVault";
            payoutType = "PROTOCOL_POOL";
          }
        } else if (nextPos === 13) {
          // P13 -> Scans downlines at pos 3, 4, 5, 6 in this cycle (distinct from owner and pos 1 & 2)
          const dl1Node = await prisma.matrixPlacement.findFirst({
            where: { matrixOwnerAddress: targetMatrixOwner, slotNumber, cycle: currentUplineCycle, position: 1 },
            select: { placedUserAddress: true },
          });
          const dl2Node = await prisma.matrixPlacement.findFirst({
            where: { matrixOwnerAddress: targetMatrixOwner, slotNumber, cycle: currentUplineCycle, position: 2 },
            select: { placedUserAddress: true },
          });
          const dl1Lower = dl1Node?.placedUserAddress?.toLowerCase();
          const dl2Lower = dl2Node?.placedUserAddress?.toLowerCase();
          const ownerLower = targetMatrixOwner.toLowerCase();

          const downlineNodes = await prisma.matrixPlacement.findMany({
            where: {
              matrixOwnerAddress: targetMatrixOwner,
              slotNumber,
              cycle: currentUplineCycle,
              position: { in: [3, 4, 5, 6] },
            },
            select: { placedUserAddress: true },
          });
          let candidate: string | null = null;
          for (const d of downlineNodes) {
            const candLower = d.placedUserAddress.toLowerCase();
            if (candLower !== ownerLower && candLower !== dl1Lower && candLower !== dl2Lower) {
              const isCandQualified = await isUserMatrixQualified(d.placedUserAddress);
              if (isCandQualified) {
                candidate = d.placedUserAddress;
                break;
              }
            }
          }
          if (candidate) {
            recipient = candidate;
            payoutType = "SPILLOVER_DOWNLINE1";
          } else {
            recipient = "0xProtocolPools_EquoraVault";
            payoutType = "PROTOCOL_POOL";
          }
        }

        // Two-Stage Auto-Progression (Stage 1):
        // At position 5, the next slot is UNLOCKED & RESERVED in standby mode ($0 out-of-pocket)
        if (nextPos === 5 && slotNumber < 12) {
          const nextSlotNum = slotNumber + 1;
          await prisma.matrixSlot.upsert({
            where: {
              userAddress_slotNumber: {
                userAddress: targetMatrixOwner,
                slotNumber: nextSlotNum,
              },
            },
            update: { isUnlocked: true },
            create: {
              userAddress: targetMatrixOwner,
              slotNumber: nextSlotNum,
              isUnlocked: true,
              currentCycle: 1,
              filledNodes: 0,
              upgradeReserve: 0,
              totalEarned: 0,
            },
          }).catch(() => {});
        }

        // Record placement
        const genTxHash = txHash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

        await prisma.matrixPlacement.create({
          data: {
            matrixOwnerAddress: targetMatrixOwner,
            placedUserAddress: canonicalAddress,
            slotNumber,
            position: nextPos,
            cycle: currentUplineCycle,
            payoutType,
            recipientAddress: recipient,
            wasFallback: !isOwnerIncome && payoutType === "OWNER_DIRECT",
            amount,
            txHash: genTxHash,
            blockNumber: BigInt(1000000),
            timestamp: new Date(),
          },
        });

        // Credit recipient profile & record transaction/activity if not protocol vault
        const isVault = recipient.startsWith("0xProtocolPools") || recipient === "0x0000000000000000000000000000000000000000";
        if (!isVault) {
          const isDirect = payoutType === "UPLINE_1";

          // Ensure recipient exists in User table for foreign key integrity
          const existingRecipientUser = await prisma.user.findUnique({ where: { address: recipient } });
          if (!existingRecipientUser) {
            const highestUser = await prisma.user.findFirst({
              orderBy: { userId: "desc" },
              select: { userId: true },
            });
            const nextUserId = (highestUser?.userId ?? 0) + 1;
            await prisma.user.create({
              data: {
                address: recipient,
                userId: nextUserId,
                registrationTimestamp: new Date(),
              },
            }).catch(() => {});
          }

          await prisma.matrixProfile.upsert({
            where: { userAddress: recipient },
            create: {
              userAddress: recipient,
              username: `Operative #${recipient.slice(2, 6).toUpperCase()}`,
              totalEarnings: amount,
              availableBalance: amount,
              directEarnings: isDirect ? amount : 0,
              matrixEarnings: isDirect ? 0 : amount,
            },
            update: {
              totalEarnings: { increment: amount },
              availableBalance: { increment: amount },
              ...(isDirect ? { directEarnings: { increment: amount } } : { matrixEarnings: { increment: amount } }),
            },
          }).catch(() => {});

          await prisma.matrixTransaction.create({
            data: {
              userAddress: recipient,
              type: isDirect ? "COMMISSION_EARNED" : "SPILLOVER_RECEIVED",
              amount,
              slotNumber,
              cycle: currentUplineCycle,
              position: nextPos,
              status: "COMPLETED",
              txHash: genTxHash,
              timestamp: new Date(),
              description: `Matrix reward: ${payoutType} (Slot #${slotNumber}, P${nextPos})`,
            },
          }).catch(() => {});

          await prisma.matrixActivity.create({
            data: {
              userAddress: recipient,
              action: "REWARD_DISTRIBUTED",
              title: `Matrix Commission Received ($${amount.toFixed(2)} USD)`,
              description: `Earned from Position #${nextPos} on Slot #${slotNumber} (${payoutType})`,
              slotNumber,
              amount,
            },
          }).catch(() => {});
        }

        // Update upline slot counters
        const newFilled = uplineSlot.filledNodes + 1;
        if (newFilled >= 14) {
          // Two-Stage Auto-Progression (Stage 2):
          // Complete cycle & recycle, and next slot activates live!
          await prisma.matrixCycleEvent.create({
            data: {
              userAddress: targetMatrixOwner,
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
              ...(isOwnerIncome ? { totalEarned: { increment: amount } } : {}),
            },
          });

          if (isOwnerIncome) {
            await prisma.matrixProfile.update({
              where: { userAddress: targetMatrixOwner },
              data: {
                recyclesCount: { increment: 1 },
              },
            }).catch(() => {});
          }
        } else {
          await prisma.matrixSlot.update({
            where: { id: uplineSlot.id },
            data: {
              filledNodes: newFilled,
              ...(isOwnerIncome ? { totalEarned: { increment: amount } } : {}),
            },
          });
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
        amountUsd: slotCost,
        token: "USD",
        txHash: buyTxHash,
        status: "COMPLETED",
        description: `Unlocked Matrix Slot #${slotNumber} for $${slotCost}`,
      },
    });

    // Record activity
    await prisma.matrixActivity.create({
      data: {
        userAddress: canonicalAddress,
        action: "SLOT_ACTIVATED",
        title: `Slot #${slotNumber} Activated`,
        description: `Successfully unlocked Slot #${slotNumber} for $${slotCost}`,
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
    try {
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

      if (nextPosNumber === 1) {
        nextPosTitle = "Position #1 - Level 1 Pass-Up";
        nextPosDesc = "100% payout to direct Upline 1 (or 4 Protocol Pools if unqualified)";
        nextReward = "Upline 1 (Pass-Up)";
      } else if (nextPosNumber === 2) {
        nextPosTitle = "Position #2 - Level 1 Pass-Up";
        nextPosDesc = "100% payout to second-line Upline 2 (or 4 Protocol Pools if unqualified)";
        nextReward = "Upline 2 (Pass-Up)";
      } else if (
        nextPosNumber === 3 || nextPosNumber === 6 ||
        nextPosNumber === 8 || nextPosNumber === 9 ||
        nextPosNumber === 11 || nextPosNumber === 12
      ) {
        nextPosTitle = `Position #${nextPosNumber} - 100% Direct P2P`;
        nextPosDesc = "100% payout goes directly to YOU as Slot Owner (requires 2 active directs)";
        nextReward = "Slot Owner (100% P2P)";
      } else if (nextPosNumber === 4) {
        nextPosTitle = "Position #4 - 4 Protocol Pools";
        nextPosDesc = "35% DAO, 40% Royalty Pool, 15% Level Rewards, 10% Magic Blind Box";
        nextReward = "Protocol Pools";
      } else if (nextPosNumber === 5) {
        nextPosTitle = "Position #5 - Stage 1 Next Slot Reserve";
        nextPosDesc = "Funds Protocol Pools and automatically unlocks & reserves Next Slot in Standby ($0 out-of-pocket)";
        nextReward = "Stage 1 Reserve";
      } else if (nextPosNumber === 7) {
        nextPosTitle = "Position #7 - Downline Spillover";
        nextPosDesc = "Spillover reward to Node 1 occupant (fallback to Node 2)";
        nextReward = "Downline Spillover";
      } else if (nextPosNumber === 10) {
        nextPosTitle = "Position #10 - Downline Spillover";
        nextPosDesc = "Spillover reward to Node 2 occupant (with anti-double payout protection)";
        nextReward = "Downline Spillover";
      } else if (nextPosNumber === 13) {
        nextPosTitle = "Position #13 - Downline Waterfall";
        nextPosDesc = "Queue scan across downlines at Nodes 3, 4, 5, 6; splits equally among qualified candidates";
        nextReward = "Downline Waterfall";
      } else if (nextPosNumber === 14) {
        nextPosTitle = "Position #14 - Stage 2 Board Recycle";
        nextPosDesc = "Completes board cycle, activates reserved next slot live, and recycles under sponsor";
        nextReward = "Recycle & Stage 2 Live";
      }

      const activities = await prisma.matrixActivity.findMany({
        where: { userAddress: canonicalAddress },
        orderBy: { timestamp: "desc" },
        take: 8,
      }).catch(() => []);

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

      const livePrice = await this.getLiveTrobPriceUsd();

      return {
        currentSlot: highestSlot,
        totalEarnedTrob: livePrice > 0 ? Math.round((user.totalEarnings / livePrice) * 100) / 100 : user.totalEarnings,
        totalEarnedUsd: user.totalEarnings,
        availableWithdrawTrob: livePrice > 0 ? Math.round((user.availableBalance / livePrice) * 100) / 100 : user.availableBalance,
        availableWithdrawUsd: user.availableBalance,
        recyclesCount: user.recyclesCount,
        trobPriceUsd: livePrice,
        isQualified: user.isQualified ?? false,
        activeDirectsCount: user.activeDirectsCount ?? 0,
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
    } catch (dbErr: any) {
      console.warn(`[MatrixService] DB notice in getDashboardOverview(${canonicalAddress}), returning fallback:`, dbErr?.message || dbErr);
      return getFallbackDashboard(canonicalAddress);
    }
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

    try {
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
    } catch (dbErr: any) {
      console.warn(`[MatrixService] DB notice in getTransactions(${canonicalAddress}), returning fallback:`, dbErr?.message || dbErr);
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
        stats: {
          totalInflow: 0,
          totalOutflow: 0,
          pendingCount: 0,
          netProfit: 0,
        },
      };
    }
  }

  // ── EARNINGS & WITHDRAWALS ─────────────────────────────────────────────────

  async getEarningsOverview(address: string): Promise<MatrixEarningsOverviewDTO> {
    const canonicalAddress = address.toLowerCase();
    try {
      const user = await this.getUserProfile(canonicalAddress);

      const recentTxs = await prisma.matrixTransaction.findMany({
        where: {
          userAddress: canonicalAddress,
          type: { not: "SLOT_PURCHASE" },
        },
        orderBy: { timestamp: "desc" },
        take: 10,
      }).catch(() => []);

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

      const livePrice = await this.getLiveTrobPriceUsd();

      return {
        totalEarnings: livePrice > 0 ? Math.round((user.totalEarnings / livePrice) * 100) / 100 : user.totalEarnings,
        totalEarningsUsd: user.totalEarnings,
        availableBalance: livePrice > 0 ? Math.round((user.availableBalance / livePrice) * 100) / 100 : user.availableBalance,
        availableBalanceUsd: user.availableBalance,
        withdrawnTotal: livePrice > 0 ? Math.round((user.withdrawnTotal / livePrice) * 100) / 100 : user.withdrawnTotal,
        withdrawnTotalUsd: user.withdrawnTotal,
        trobPriceUsd: livePrice,
        breakdown: {
          directBonus: user.directEarnings || Math.round(total * 0.35 * 100) / 100,
          matrixPlacements: user.matrixEarnings || Math.round(total * 0.45 * 100) / 100,
          upgradeReserves: Math.round(total * 0.1 * 100) / 100,
          poolShares: user.poolEarnings || Math.round(total * 0.1 * 100) / 100,
        },
        chartData,
        recentPayouts,
      };
    } catch (dbErr: any) {
      console.warn(`[MatrixService] DB notice in getEarningsOverview(${canonicalAddress}), returning fallback:`, dbErr?.message || dbErr);
      return getFallbackEarningsOverview();
    }
  }

  async requestWithdrawal(
    address: string,
    amount: number,
    customTxHash?: string
  ): Promise<{ success: boolean; amountWithdrawn: number; txHash: string; remainingBalance: number }> {
    const canonicalAddress = address.toLowerCase();

    if (amount <= 0) throw new Error("Withdrawal amount must be greater than zero");

    const profile = await prisma.matrixProfile.findUnique({
      where: { userAddress: canonicalAddress },
    });

    if (!profile || Number(profile.availableBalance) < amount) {
      throw new Error(`Insufficient available balance. Available: $${Number(profile?.availableBalance || 0).toFixed(2)} USD`);
    }

    const txHash =
      customTxHash ||
      `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

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
        amountUsd: amount,
        token: "USD",
        txHash,
        status: "COMPLETED",
        description: `Withdrew $${amount.toFixed(2)} USD to wallet`,
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
        description: `Successfully processed withdrawal of $${amount.toFixed(2)} USD`,
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

  // ── LIVE PRICE & MARKET ORACLE ──────────────────────────────────────────

  async getLiveTrobPriceUsd(): Promise<number> {
    try {
      const p = await priceService.getTrobUsdPrice();
      if (p && p.priceUsd > 0) return p.priceUsd;
    } catch {}
    return DEFAULT_BENCHMARK_TROB_PRICE;
  }

  // ── MATRIX STATS & PROTOCOL POOL ──────────────────────────────────────────

  async getMatrixStats(): Promise<MatrixStatsDTO> {
    try {
      const [totalPlacements, totalRecycles, daoStats] = await Promise.all([
        prisma.matrixPlacement.count().catch(() => 0),
        prisma.matrixCycleEvent.count().catch(() => 0),
        prisma.daoMember.aggregate({
          _sum: { entryAmountBtt: true },
          _count: { _all: true },
        }).catch(() => null),
      ]);

      return {
        totalPlacements,
        totalRecycles,
        daoPool: {
          totalShares: daoStats?._count?._all ?? 0,
          totalDeposited: Number(daoStats?._sum?.entryAmountBtt ?? 0),
          totalClaimed: 0,
        },
      };
    } catch {
      return {
        totalPlacements: 0,
        totalRecycles: 0,
        daoPool: { totalShares: 0, totalDeposited: 0, totalClaimed: 0 },
      };
    }
  }

  // ── CYCLES & PLACEMENT AUDIT HISTORY ──────────────────────────────────────

  async getUserCycles(address: string, slotNumber?: number): Promise<MatrixCycleEventDTO[]> {
    const canonical = address.toLowerCase();
    try {
      const where: any = { userAddress: canonical };
      if (typeof slotNumber === "number") {
        where.slotNumber = slotNumber;
      }
      const events = await prisma.matrixCycleEvent.findMany({
        where,
        orderBy: { cycleNumber: "desc" },
      });
      return events.map((e: any) => ({
        cycleNumber: e.cycleNumber,
        nodes: e.nodes,
        completedAt: e.completedAt,
        txHash: e.txHash,
      }));
    } catch {
      return [];
    }
  }

  async getCycleHistory(address: string, slotNumber: number): Promise<MatrixCycleHistoryDTO[]> {
    const canonical = address.toLowerCase();
    try {
      const events = await prisma.matrixCycleEvent.findMany({
        where: { userAddress: canonical, slotNumber },
        orderBy: { cycleNumber: "desc" },
      });
      return events.map((e: any) => ({
        cycle: e.cycleNumber,
        completedAt: e.completedAt,
        txHash: e.txHash,
        nodesCount: e.nodes?.length || 14,
      }));
    } catch {
      return [];
    }
  }

  async getPlacementHistory(
    address: string,
    page = 1,
    limit = 20
  ): Promise<MatrixPlacementHistoryResultDTO> {
    const canonical = address.toLowerCase();
    const skip = (page - 1) * limit;

    try {
      const where = {
        OR: [
          { matrixOwnerAddress: canonical },
          { placedUserAddress: canonical },
          { recipientAddress: canonical },
        ],
      };

      const [total, placements] = await Promise.all([
        prisma.matrixPlacement.count({ where }),
        prisma.matrixPlacement.findMany({
          where,
          orderBy: { timestamp: "desc" },
          skip,
          take: limit,
        }),
      ]);

      const history = placements.map((p: any) => ({
        id: p.id,
        slotNumber: p.slotNumber,
        position: p.position,
        cycle: p.cycle,
        payoutType: p.payoutType,
        recipientAddress: p.recipientAddress,
        wasFallback: p.wasFallback,
        amount: Number(p.amount),
        isIncome: p.recipientAddress.toLowerCase() === canonical,
        matrixOwner: p.matrixOwnerAddress,
        placedUser: p.placedUserAddress,
        txHash: p.txHash,
        timestamp: p.timestamp,
      }));

      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        history,
      };
    } catch {
      return {
        total: 0,
        page,
        limit,
        totalPages: 1,
        history: [],
      };
    }
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
      { action: "REWARD_RECEIVED", title: "Reward Received", description: "+$30.00 direct distribution", amount: 30, slot: 1 },
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
