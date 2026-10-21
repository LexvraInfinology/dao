"use client";

import { useEffect, useCallback } from "react";
import {
  useUserStore,
  useMatrixStore,
  useFinanceStore,
  useLeaderboardStore,
} from "./stores";

export function useMatrixUser() {
  const address = useUserStore((s) => s.address);
  const profile = useUserStore((s) => s.profile);
  const settings = useUserStore((s) => s.settings);
  const loadingProfile = useUserStore((s) => s.loadingProfile);
  const userError = useUserStore((s) => s.error);
  const initAddress = useUserStore((s) => s.initAddress);
  const setAddress = useUserStore((s) => s.setAddress);
  const fetchProfile = useUserStore((s) => s.fetchProfile);
  const fetchSettings = useUserStore((s) => s.fetchSettings);

  const slots = useMatrixStore((s) => s.slots);
  const selectedSlotNumber = useMatrixStore((s) => s.selectedSlotNumber);
  const slotDetails = useMatrixStore((s) => s.slotDetails);
  const dashboard = useMatrixStore((s) => s.dashboard);
  const loadingSlots = useMatrixStore((s) => s.loadingSlots);
  const matrixError = useMatrixStore((s) => s.error);
  const fetchSlots = useMatrixStore((s) => s.fetchSlots);
  const fetchSlotDetails = useMatrixStore((s) => s.fetchSlotDetails);
  const selectSlot = useMatrixStore((s) => s.selectSlot);
  const buySlotStore = useMatrixStore((s) => s.buySlot);
  const fetchDashboard = useMatrixStore((s) => s.fetchDashboard);

  const earnings = useFinanceStore((s) => s.earnings);
  const loadingEarnings = useFinanceStore((s) => s.loadingEarnings);
  const financeError = useFinanceStore((s) => s.error);
  const fetchEarnings = useFinanceStore((s) => s.fetchEarnings);

  const leaderboard = useLeaderboardStore((s) => s.entries);

  // Initialize address on mount if not set
  useEffect(() => {
    initAddress();
  }, [initAddress]);

  const refreshAll = useCallback(
    async (force = false) => {
      await Promise.all([
        fetchProfile(force),
        fetchDashboard(undefined, force),
        fetchSlots(undefined, force),
        fetchEarnings(undefined, force),
        fetchSettings(force),
        fetchSlotDetails(undefined, undefined, undefined, force),
      ]);
    },
    [
      fetchProfile,
      fetchDashboard,
      fetchSlots,
      fetchEarnings,
      fetchSettings,
      fetchSlotDetails,
    ]
  );

  // Refresh when address changes
  useEffect(() => {
    if (address) {
      refreshAll(true);
    }
  }, [address, refreshAll]);

  const changeAddress = useCallback(
    (newAddress: string) => {
      useMatrixStore.getState().reset();
      useFinanceStore.getState().reset();
      setAddress(newAddress);
    },
    [setAddress]
  );

  const loadSlot = useCallback(
    async (slotNum: number, cycle?: number) => {
      await selectSlot(slotNum, cycle);
    },
    [selectSlot]
  );

  const buySlot = useCallback(
    async (slotNum: number) => {
      return await buySlotStore(slotNum);
    },
    [buySlotStore]
  );

  const loading = loadingProfile || loadingSlots || loadingEarnings;
  const error = userError || matrixError || financeError || null;

  return {
    address,
    changeAddress,
    profile,
    dashboard,
    slots,
    selectedSlotNumber,
    slotDetails,
    earnings,
    settings,
    leaderboard,
    loading,
    error,
    refreshAll: () => refreshAll(true),
    loadSlot,
    buySlot,
  };
}
