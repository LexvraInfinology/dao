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
    const targetCycle = cycle ?? 1;
    const cacheKey = `${slotNum}_${targetCycle}`;
    const cached = get().slotDetailsCache[cacheKey];

    // If cached, immediately show cached board to prevent jitter / blank flashes
    if (cached) {
      set({
        selectedSlotNumber: slotNum,
        selectedCycle: targetCycle,
        slotDetails: cached,
      });
    } else {
      set({ selectedSlotNumber: slotNum, selectedCycle: targetCycle });
    }

    await get().fetchSlotDetails(slotNum, targetCycle, userAddress, true);
  },

  fetchSlotDetails: async (slotNum, cycle, userAddress, force = false) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) return;
    const targetSlot = slotNum ?? get().selectedSlotNumber ?? 1;
    const { slotDetails, loadingDetails, selectedCycle, slotDetailsCache } = get();
    const targetCycle = cycle ?? selectedCycle ?? 1;
    const cacheKey = `${targetSlot}_${targetCycle}`;

    const isSlotSwitch = targetSlot !== slotDetails?.slotNumber || targetCycle !== (slotDetails?.currentCycle ?? 1);
    const isInitialLoad = !slotDetails;

    // Fast cache display if available and not forcing refresh
    if (!force && slotDetailsCache[cacheKey]) {
      set({
        slotDetails: slotDetailsCache[cacheKey],
        selectedSlotNumber: targetSlot,
        selectedCycle: targetCycle,
        loadingDetails: false,
      });
      return;
    }

    if (isInitialLoad && !slotDetailsCache[cacheKey]) {
      set({ loadingDetails: true, error: null });
    }

    try {
      // 1. Prioritize live on-chain 14-node board data
      const onChainDetails = await getOnChainSlotDetails(addr, targetSlot, targetCycle);
      if (onChainDetails) {
        const newCache = { ...get().slotDetailsCache, [cacheKey]: onChainDetails };
        // Only update current slotDetails if the user is still on this slot and cycle
        if (get().selectedSlotNumber === targetSlot && (get().selectedCycle ?? 1) === (onChainDetails.currentCycle ?? targetCycle)) {
          set({
            slotDetails: onChainDetails,
            selectedSlotNumber: targetSlot,
            selectedCycle: onChainDetails.currentCycle,
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
      const details = await matrixApi.getSlotDetails(addr, targetSlot, targetCycle);
      if (details) {
        const newCache = { ...get().slotDetailsCache, [cacheKey]: details };
        if (get().selectedSlotNumber === targetSlot) {
          set({
            slotDetails: details,
            selectedSlotNumber: targetSlot,
            selectedCycle: targetCycle ?? null,
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

    // 1. Prioritize live on-chain contract state
    try {
      const [onChainDetails, onChainProf, onChainQual, onChainRank] = await Promise.all([
        getOnChainSlotDetails(addr, 1).catch(() => null),
        getOnChainUserProfile(addr).catch(() => null),
        getOnChainQualification(addr).catch(() => null),
        getOnChainUserRankMilestones(addr).catch(() => null),
      ]);

      if (onChainDetails || onChainProf) {
        const TROB_PRICE_USD = 0.056;
        const totalEarnedUsd = (onChainDetails?.totalEarnedUsd && onChainDetails.totalEarnedUsd > 0)
          ? onChainDetails.totalEarnedUsd
          : (onChainProf?.totalEarningsUsd ?? 0);
        const totalEarnedTrob = onChainDetails?.totalEarnedTrob ?? onChainProf?.totalEarningsTrob ?? (totalEarnedUsd > 0 ? totalEarnedUsd / TROB_PRICE_USD : 0);
        const availableWithdrawUsd = totalEarnedUsd;
        const availableWithdrawTrob = totalEarnedTrob;
        const filledCount = onChainDetails?.filledNodes ?? 0;
        const isUserRegistered = Boolean(onChainProf?.isRegistered);
        const effectiveHighestSlot = isUserRegistered ? (onChainProf?.highestUnlockedSlot || 1) : 0;

        const onChainDashboard: MatrixDashboardOverview = {
          address: addr,
          currentSlot: onChainProf?.currentSlot || 1,
          highestUnlockedSlot: effectiveHighestSlot,
          totalEarnedTrob,
          totalEarnedUsd,
          availableWithdrawTrob,
          availableWithdrawUsd,
          totalWithdrawnTrob: onChainProf?.withdrawnTotalTrob ?? 0,
          totalWithdrawnUsd: onChainProf?.withdrawnTotalUsd ?? 0,
          recyclesCount: onChainDetails?.recyclesCount ?? 0,
          trobPriceUsd: TROB_PRICE_USD,
          rankMilestones: onChainRank || {
            tierNumber: 0,
            tierName: "NONE",
            milestones: 0,
            alphaThreshold: 42,
            primeThreshold: 84,
            eliteThreshold: 126,
            crownThreshold: 168,
            isAlphaAchieved: false,
            isPrimeAchieved: false,
            isEliteAchieved: false,
            isCrownAchieved: false,
          },
          activeSlotProgress: {
            slotNumber: 1,
            filledNodes: filledCount,
            totalNodes: 14,
            cycle: onChainDetails?.currentCycle ?? 1,
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
              const title = isP2P
                ? `P2P Direct Yield Received (+$30.00)`
                : `Seat P${pos} Activated (${n.label || (n.code ? `Member #${n.code}` : `Position #${pos}`)})`;

              return {
                id: `onchain-pos-${pos}`,
                action,
                title,
                slot: 1,
                position: pos,
                amount: n.amount || 882.51,
                amountUsd: 30.0,
                token: "TROB",
                fromAddress: n.placedUser || n.base58,
                toAddress: addr,
                txHash: n.txHash || null,
                status: "CONFIRMED",
                description: `Position #${pos} placed • ${n.label || (n.code ? `Operative #${n.code}` : "Downline")} (${n.payoutType || "+$30 Yield"})`,
                timestamp: n.timestamp || new Date().toISOString(),
              };
            }),
          isQualified: onChainQual?.isQualified ?? onChainProf?.isQualified ?? false,
          activeDirectsCount: onChainQual?.activeDirectsCount ?? onChainProf?.activeDirectsCount ?? 0,
          sponsorAddress: onChainProf?.sponsorAddress || null,
        };

        set({ dashboard: onChainDashboard, loadingDashboard: false });

        // Synchronize slotDetails so tree view components have the complete node array
        if (onChainDetails) {
          set({ slotDetails: onChainDetails });
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
