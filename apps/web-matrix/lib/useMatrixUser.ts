"use client";

import { useEffect, useCallback } from "react";
import {
  useUserStore,
  useMatrixStore,
  useFinanceStore,
  useLeaderboardStore,
} from "./stores";
import { setupWalletListeners } from "./web3Wallet";

export function useMatrixUser() {
  const address = useUserStore((s) => s.address);
  const profile = useUserStore((s) => s.profile);
  const settings = useUserStore((s) => s.settings);
  const loadingProfile = useUserStore((s) => s.loadingProfile);
  const userError = useUserStore((s) => s.error);
  const eligibility = useUserStore((s) => s.eligibility);
  const loadingEligibility = useUserStore((s) => s.loadingEligibility);
  const fetchEligibility = useUserStore((s) => s.fetchEligibility);
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
  const fetchDirectMembers = useMatrixStore((s) => s.fetchDirectMembers);

  const earnings = useFinanceStore((s) => s.earnings);
  const loadingEarnings = useFinanceStore((s) => s.loadingEarnings);
  const financeError = useFinanceStore((s) => s.error);
  const fetchEarnings = useFinanceStore((s) => s.fetchEarnings);

  const leaderboard = useLeaderboardStore((s) => s.entries);

  // Initialize address on mount & subscribe to live TrobSafe wallet events
  useEffect(() => {
    initAddress();
    const cleanup = setupWalletListeners(
      (newAddr) => {
        setAddress(newAddr);
      },
      () => {
        useUserStore.getState().disconnect();
      }
    );
    return cleanup;
  }, [initAddress, setAddress]);

  const refreshAll = useCallback(
    async (force = false, followUp = false) => {
      await Promise.all([
        fetchProfile(force),
        fetchDashboard(undefined, force),
        fetchSlots(undefined, force),
        fetchEarnings(undefined, force),
        fetchSettings(force),
        fetchSlotDetails(undefined, undefined, undefined, force),
        fetchDirectMembers(undefined, force),
      ]);

      if (followUp) {
        setTimeout(async () => {
          await Promise.all([
            fetchProfile(true),
            fetchDashboard(undefined, true),
            fetchSlots(undefined, true),
            fetchEarnings(undefined, true),
            fetchSlotDetails(undefined, undefined, undefined, true),
            fetchDirectMembers(undefined, true),
          ]).catch(() => {});
        }, 3500);
      }
    },
    [
      fetchProfile,
      fetchDashboard,
      fetchSlots,
      fetchEarnings,
      fetchSettings,
      fetchSlotDetails,
      fetchDirectMembers,
    ]
  );

  // Refresh when address changes
  useEffect(() => {
    if (address) {
      refreshAll(true, true);
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

  const disconnectUser = useUserStore((s) => s.disconnect);

  const disconnect = useCallback(() => {
    useMatrixStore.getState().reset();
    useFinanceStore.getState().reset();
    disconnectUser();
  }, [disconnectUser]);

  const loadSlot = useCallback(
    async (slotNum: number, cycle?: number) => {
      await selectSlot(slotNum, cycle);
    },
    [selectSlot]
  );

  const buySlot = useCallback(
    async (slotNum: number, txHash?: string) => {
      return await buySlotStore(slotNum, undefined, txHash);
    },
    [buySlotStore]
  );

  const loading = loadingProfile || loadingSlots || loadingEarnings;
  const error = userError || matrixError || financeError || null;

  return {
    address,
    changeAddress,
    disconnect,
    profile,
    dashboard,
    slots,
    selectedSlotNumber,
    slotDetails,
    earnings,
    settings,
    eligibility,
    loadingEligibility,
    fetchEligibility,
    leaderboard,
    loading,
    error,
    refreshAll: (force?: boolean, followUp?: boolean) => refreshAll(force ?? true, followUp ?? false),
    loadSlot,
    buySlot,
  };
}
