import { create } from "zustand";
import {
  matrixApi,
  getStoredUserAddress,
  MatrixSlotSummary,
  MatrixSlotDetails,
  MatrixDashboardOverview,
} from "../api";
import {
  getOnChainAllSlots,
  getOnChainSlotDetails,
  getOnChainDirectMembers,
  getOnChainUserProfile,
  getOnChainQualification,
  getOnChainUserRankMilestones,
  getLiveTrobPriceUsd,
  getLiveSlotCostUsdAndSun,
} from "../contracts";
import { useUserStore } from "./useUserStore";

export interface MatrixState {
  slots: MatrixSlotSummary[];
  selectedSlotNumber: number;
  selectedCycle: number | null;
  slotDetails: MatrixSlotDetails | null;
  slotDetailsCache: Record<string, MatrixSlotDetails>;
  directMembers: Array<{
    address: string;
    userId: number;
    username: string;
    joinedAt: string;
    activeSlots: number;
    totalContributed: number;
  }>;
  dashboard: MatrixDashboardOverview | null;

  loadingSlots: boolean;
  loadingDetails: boolean;
  loadingDirects: boolean;
  loadingDashboard: boolean;
  buyingSlot: boolean;
  error: string | null;

  // Actions
  fetchSlots: (userAddress?: string, force?: boolean) => Promise<void>;
  selectSlot: (slotNum: number, cycle?: number, userAddress?: string) => Promise<void>;
  fetchSlotDetails: (
    slotNum?: number,
    cycle?: number,
    userAddress?: string,
    force?: boolean
  ) => Promise<void>;
  buySlot: (
    slotNum: number,
    userAddress?: string,
    txHash?: string
  ) => Promise<{ success: boolean; slot: MatrixSlotSummary; message: string }>;
  fetchDirectMembers: (userAddress?: string, force?: boolean) => Promise<void>;
  fetchDashboard: (userAddress?: string, force?: boolean) => Promise<void>;
  reset: () => void;
}

export const useMatrixStore = create<MatrixState>((set, get) => ({
  slots: [],
  selectedSlotNumber: 1,
  selectedCycle: null,
  slotDetails: null,
  slotDetailsCache: {},
  directMembers: [],
  dashboard: null,

  loadingSlots: false,
  loadingDetails: false,
  loadingDirects: false,
  loadingDashboard: false,
  buyingSlot: false,
  error: null,

  fetchSlots: async (userAddress, force = false) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) return;
    const { slots, loadingSlots } = get();
    if (loadingSlots) return;
    if (slots.length > 0 && !force) return;

    set({ loadingSlots: true, error: null });
    try {
      // 1. Prioritize live on-chain contract state
      const onChainData = await getOnChainAllSlots(addr);
      if (onChainData && onChainData.length > 0) {
        set({ slots: onChainData, loadingSlots: false });
        return;
      }
    } catch (err: any) {
      console.warn("[MatrixStore] Direct on-chain slot query failed, falling back to API:", err);
    }

    try {
      const data = await matrixApi.getSlots(addr);
      set({ slots: data || [], loadingSlots: false });
    } catch (err: any) {
      set({
        error: err?.message || "Failed to load matrix slots",
        loadingSlots: false,
      });
    }
  },

    selectSlot: async (slotNum: number, cycle?: number, userAddress?: string) => {
    const targetCycleNorm = cycle ?? null;
    const prevSlot = get().slotDetails?.slotNumber;
    const prevCycle = get().selectedCycle ?? null;
    const isChangingView = prevSlot !== slotNum || prevCycle !== targetCycleNorm;

    // Show clean on-chain loader on explicit slot/board switch so stale or unverified trees never flash
    if (isChangingView || !get().slotDetails) {
      set({
        selectedSlotNumber: slotNum,
        selectedCycle: targetCycleNorm,
        slotDetails: null,
        loadingDetails: true,
      });
    } else {
      set({
        selectedSlotNumber: slotNum,
        selectedCycle: targetCycleNorm,
      });
    }

    await get().fetchSlotDetails(slotNum, cycle, userAddress, true);
  },

  fetchSlotDetails: async (slotNum, cycle, userAddress, force = false) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) return;
    const targetSlot = slotNum ?? get().selectedSlotNumber ?? 1;
    const { slotDetails, loadingDetails, selectedCycle, slotDetailsCache } = get();
    const isLive = cycle === undefined;
    const cacheKey = isLive ? `${targetSlot}_live` : `${targetSlot}_cycle_${cycle}`;

    const isSlotSwitch = targetSlot !== slotDetails?.slotNumber;
    const isInitialLoad = !slotDetails;

    // Fast cache display if available and not forcing refresh
    if (!force && slotDetailsCache[cacheKey]) {
      set({
        slotDetails: slotDetailsCache[cacheKey],
        selectedSlotNumber: targetSlot,
        selectedCycle: cycle ?? null,
        loadingDetails: false,
      });
      return;
    }

    if (isInitialLoad && !slotDetailsCache[cacheKey]) {
      set({ loadingDetails: true, error: null });
    }

    try {
      // 1. Prioritize live on-chain 14-node board data
      const onChainDetails = await getOnChainSlotDetails(addr, targetSlot, cycle);
      if (onChainDetails) {
        const newCache = { ...get().slotDetailsCache, [cacheKey]: onChainDetails };
        const currentSelectedCycle = get().selectedCycle ?? null;
        const targetCycleNorm = cycle ?? null;
        // Only update current slotDetails if the user is still on this exact slot and cycle
        if (get().selectedSlotNumber === targetSlot && currentSelectedCycle === targetCycleNorm) {
          set({
            slotDetails: onChainDetails,
            slotDetailsCache: newCache,
            loadingDetails: false,
          });
        } else {
          set({ slotDetailsCache: newCache });
        }
        return;
      }
    } catch (err: any) {
      console.warn("[MatrixStore] Direct on-chain slot details failed, falling back to API:", err);
    }

    try {
      const details = await matrixApi.getSlotDetails(addr, targetSlot, cycle);
      if (details) {
        const newCache = { ...get().slotDetailsCache, [cacheKey]: details };
        const currentSelectedCycle = get().selectedCycle ?? null;
        const targetCycleNorm = cycle ?? null;
        if (get().selectedSlotNumber === targetSlot && currentSelectedCycle === targetCycleNorm) {
          set({
            slotDetails: details,
            slotDetailsCache: newCache,
            loadingDetails: false,
          });
        } else {
          set({ slotDetailsCache: newCache });
        }
      }
    } catch (err: any) {
      set({
        error: err?.message || `Failed to load details for slot ${targetSlot}`,
        loadingDetails: false,
      });
    }
  },

  buySlot: async (slotNum: number, userAddress?: string, txHash?: string) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) throw new Error("No wallet connected to buy slot");

    set({ buyingSlot: true, error: null });
    try {
      const res = await matrixApi.buySlot(addr, slotNum, txHash);
      // Revalidate slots & details immediately
      await get().fetchSlots(addr, true);
      await get().fetchSlotDetails(slotNum, undefined, addr, true);
      // Also refresh user profile to update balances and unlocked slot tier
      await useUserStore.getState().fetchProfile(true);
      set({ buyingSlot: false });
      return res;
    } catch (err: any) {
      set({
        error: err?.message || `Failed to purchase slot ${slotNum}`,
        buyingSlot: false,
      });
      throw err;
    }
  },

  fetchDirectMembers: async (userAddress, force = false) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) return;
    const { directMembers, loadingDirects } = get();
    if (loadingDirects) return;
    if (directMembers.length > 0 && !force) return;

    set({ loadingDirects: true, error: null });
    try {
      // 1. Prioritize live on-chain direct referrals
      const onChainDirects = await getOnChainDirectMembers(addr);
      if (onChainDirects) {
        set({ directMembers: onChainDirects, loadingDirects: false });
        return;
      }
    } catch (err: any) {
      console.warn("[MatrixStore] Direct on-chain direct members query failed:", err);
    }

    try {
      const members = await matrixApi.getDirectMembers(addr);
      set({ directMembers: members || [], loadingDirects: false });
    } catch (err: any) {
      set({
        error: err?.message || "Failed to load direct members",
        loadingDirects: false,
      });
    }
  },

  fetchDashboard: async (userAddress, force = false) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) return;
    const { dashboard, loadingDashboard } = get();
    if (loadingDashboard) return;
    if (dashboard && !force) return;

    set({ loadingDashboard: true, error: null });

    // 1. Prioritize live on-chain contract state across unlocked slots
    try {
      const [onChainDetails, onChainProf, onChainQual, onChainRank, onChainAllSlots, livePrice, slot1Cost] = await Promise.all([
        getOnChainSlotDetails(addr, 1).catch(() => null),
        getOnChainUserProfile(addr).catch(() => null),
        getOnChainQualification(addr).catch(() => null),
        getOnChainUserRankMilestones(addr).catch(() => null),
        getOnChainAllSlots(addr).catch(() => []),
        getLiveTrobPriceUsd().catch(() => 0),
        getLiveSlotCostUsdAndSun(1).catch(() => ({ costUsd: 30, costSun: 0, priceUsd: 0 })),
      ]);

      if (onChainDetails || onChainProf) {
        const liveTrobPrice = livePrice || slot1Cost.priceUsd || 0;
        const slotSumUsd = Array.isArray(onChainAllSlots)
          ? onChainAllSlots.reduce((acc: number, s: any) => acc + Number(s?.totalEarnedUsd ?? s?.totalEarned ?? 0), 0)
          : 0;
        const slotSumTrob = Array.isArray(onChainAllSlots)
          ? onChainAllSlots.reduce((acc: number, s: any) => acc + Number(s?.totalEarnedTrob ?? 0), 0)
          : 0;

        const isUserRegistered = Boolean(onChainProf?.isRegistered);
        const totalEarnedUsd = isUserRegistered
          ? Math.max(
              Number(onChainProf?.totalEarningsUsd ?? 0),
              slotSumUsd,
              Number(onChainDetails?.totalEarnedUsd ?? 0)
            )
          : 0;
        const totalEarnedTrob = isUserRegistered
          ? Math.max(
              Number(onChainProf?.totalEarningsTrob ?? 0),
              slotSumTrob,
              Number(onChainDetails?.totalEarnedTrob ?? 0)
            )
          : 0;

        const availableWithdrawUsd = totalEarnedUsd;
        const availableWithdrawTrob = totalEarnedTrob;
        const filledCount = onChainDetails?.filledNodes ?? 0;
        const effectiveHighestSlot = isUserRegistered ? (onChainProf?.highestUnlockedSlot || 1) : 0;
        const slot1CostTrob = slot1Cost.costSun > 0
          ? Number((slot1Cost.costSun / 1_000_000).toFixed(2))
          : (liveTrobPrice > 0 ? Number((slot1Cost.costUsd / liveTrobPrice).toFixed(2)) : 0);

        const allSlotsPlacements = Array.isArray(onChainAllSlots)
          ? onChainAllSlots.reduce((acc: number, s: any) => {
              if (!s?.isUnlocked) return acc;
              const cyc = Math.max(1, Number(s.currentCycle || 1));
              const recs = Math.max(0, Number(s.recyclesCount ?? cyc - 1));
              const filled = Math.max(0, Number(s.filledNodes || 0));
              return acc + recs * 14 + filled;
            }, 0)
          : 0;
        const mergedMilestonesCount = Math.max(
          Number(onChainRank?.milestones ?? 0),
          allSlotsPlacements
        );
        const derivedTierNum = Math.max(
          Number(onChainRank?.tierNumber ?? 0),
          mergedMilestonesCount >= 168 ? 4 : mergedMilestonesCount >= 126 ? 3 : mergedMilestonesCount >= 84 ? 2 : mergedMilestonesCount >= 42 ? 1 : 0
        );
        const tierNames = ["NONE", "ALPHA", "PRIME", "ELITE", "CROWN"];
        const resolvedRankMilestones = {
          tierNumber: derivedTierNum,
          tierName: tierNames[derivedTierNum] || onChainRank?.tierName || "NONE",
          milestones: mergedMilestonesCount,
          alphaThreshold: onChainRank?.alphaThreshold ?? 42,
          primeThreshold: onChainRank?.primeThreshold ?? 84,
          eliteThreshold: onChainRank?.eliteThreshold ?? 126,
          crownThreshold: onChainRank?.crownThreshold ?? 168,
          isAlphaAchieved: Boolean(onChainRank?.isAlphaAchieved || mergedMilestonesCount >= 42),
          isPrimeAchieved: Boolean(onChainRank?.isPrimeAchieved || mergedMilestonesCount >= 84),
          isEliteAchieved: Boolean(onChainRank?.isEliteAchieved || mergedMilestonesCount >= 126),
          isCrownAchieved: Boolean(onChainRank?.isCrownAchieved || mergedMilestonesCount >= 168),
        };

        const onChainDashboard: MatrixDashboardOverview = {
          address: addr,
          currentSlot: isUserRegistered ? (onChainProf?.currentSlot || 1) : 0,
          highestUnlockedSlot: effectiveHighestSlot,
          totalEarnedTrob,
          totalEarnedUsd,
          availableWithdrawTrob,
          availableWithdrawUsd,
          totalWithdrawnTrob: onChainProf?.withdrawnTotalTrob ?? 0,
          totalWithdrawnUsd: onChainProf?.withdrawnTotalUsd ?? 0,
          recyclesCount: onChainDetails?.recyclesCount ?? 0,
          trobPriceUsd: liveTrobPrice,
          rankMilestones: resolvedRankMilestones,
          activeSlotProgress: {
            slotNumber: isUserRegistered ? (onChainProf?.currentSlot || 1) : 0,
            filledNodes: filledCount,
            totalNodes: 14,
            cycle: onChainDetails?.currentCycle ?? (isUserRegistered ? 1 : 0),
            upgradeReserve: 0,
            level1Filled: Math.min(2, filledCount),
            level2Filled: Math.max(0, Math.min(4, filledCount - 2)),
            level3Filled: Math.max(0, filledCount - 6),
            nodes: onChainDetails?.nodes ?? [],
          },
          recentActivity: (onChainDetails?.nodes || [])
            .filter((n: any) => n.filled)
            .map((n: any) => {
              const pos = n.position;
              const isP2P = pos === 3 || pos === 6 || pos === 8 || pos === 9 || pos === 11 || pos === 12;
              const action = isP2P ? "COMMISSION_RECEIVED" : "MEMBER_JOINED";
              const usdVal = Number(n.amountUsd ?? slot1Cost.costUsd ?? 30);
              const title = isP2P
                ? `P2P Direct Yield Received (+$${usdVal.toFixed(2)})`
                : `Seat P${pos} Activated (${n.label || (n.code ? `Member #${n.code}` : `Position #${pos}`)})`;

              return {
                id: `onchain-pos-${pos}`,
                action,
                title,
                slot: 1,
                position: pos,
                amount: Number(n.amount || slot1CostTrob || 0),
                amountUsd: usdVal,
                token: "TROB",
                fromAddress: n.placedUser || n.base58,
                toAddress: addr,
                txHash: n.txHash || null,
                status: "CONFIRMED",
                description: `Position #${pos} placed • ${n.label || (n.code ? `Operative #${n.code}` : "Downline")} (${n.payoutType || `+$${usdVal.toFixed(2)} Yield`})`,
                timestamp: n.timestamp || new Date().toISOString(),
              };
            }),
          isQualified: onChainQual?.isQualified ?? onChainProf?.isQualified ?? false,
          activeDirectsCount: onChainQual?.activeDirectsCount ?? onChainProf?.activeDirectsCount ?? 0,
          sponsorAddress: onChainProf?.sponsorAddress || null,
        };

        const currentState = get();
        set({
          dashboard: onChainDashboard,
          loadingDashboard: false,
          ...(Array.isArray(onChainAllSlots) && onChainAllSlots.length > 0 ? { slots: onChainAllSlots } : {}),
        });

        // Only populate initial slotDetails when user has not switched away from live Slot 1
        if (onChainDetails && currentState.selectedSlotNumber === 1 && !currentState.selectedCycle) {
          set({
            slotDetails: onChainDetails,
            slotDetailsCache: { ...get().slotDetailsCache, ["1_live"]: onChainDetails },
          });
        }
        return;
      }
    } catch (err: any) {
      console.warn("[MatrixStore] Direct on-chain dashboard query notice:", err);
    }

    try {
      const dash = await matrixApi.getDashboard(addr);
      set({ dashboard: dash, loadingDashboard: false });
    } catch (err: any) {
      set({
        error: err?.message || "Failed to load dashboard overview",
        loadingDashboard: false,
      });
    }
  },

  reset: () => {
    set({
      slots: [],
      selectedSlotNumber: 1,
      selectedCycle: null,
      slotDetails: null,
      directMembers: [],
      dashboard: null,
      error: null,
    });
  },
}));
