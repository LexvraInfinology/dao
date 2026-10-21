import { create } from "zustand";
import {
  matrixApi,
  getStoredUserAddress,
  MatrixSlotSummary,
  MatrixSlotDetails,
  MatrixDashboardOverview,
} from "../api";
import { useUserStore } from "./useUserStore";

export interface MatrixState {
  slots: MatrixSlotSummary[];
  selectedSlotNumber: number;
  selectedCycle: number | null;
  slotDetails: MatrixSlotDetails | null;
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
    userAddress?: string
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
    set({ selectedSlotNumber: slotNum, selectedCycle: cycle ?? null });
    await get().fetchSlotDetails(slotNum, cycle, userAddress, true);
  },

  fetchSlotDetails: async (slotNum, cycle, userAddress, force = false) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) return;
    const targetSlot = slotNum ?? get().selectedSlotNumber ?? 1;
    const { slotDetails, loadingDetails, selectedCycle } = get();
    const targetCycle = cycle ?? selectedCycle ?? undefined;

    if (loadingDetails) return;
    if (
      slotDetails &&
      slotDetails.slotNumber === targetSlot &&
      (targetCycle === undefined || slotDetails.currentCycle === targetCycle) &&
      !force
    ) {
      return;
    }

    set({ loadingDetails: true, error: null });
    try {
      const details = await matrixApi.getSlotDetails(addr, targetSlot, targetCycle);
      set({
        slotDetails: details,
        selectedSlotNumber: targetSlot,
        selectedCycle: targetCycle ?? null,
        loadingDetails: false,
      });
    } catch (err: any) {
      set({
        error: err?.message || `Failed to load details for slot ${targetSlot}`,
        loadingDetails: false,
      });
    }
  },

  buySlot: async (slotNum: number, userAddress?: string) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) throw new Error("No wallet connected to buy slot");

    set({ buyingSlot: true, error: null });
    try {
      const res = await matrixApi.buySlot(addr, slotNum);
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
