import { create } from "zustand";
import {
  matrixApi,
  getStoredUserAddress,
  MatrixEarningsOverview,
  MatrixTransaction,
} from "../api";
import { useUserStore } from "./useUserStore";

export interface FinanceState {
  earnings: MatrixEarningsOverview | null;
  transactions: MatrixTransaction[];
  transactionStats: {
    totalInflow: number;
    totalOutflow: number;
    pendingCount: number;
    netProfit: number;
  } | null;

  loadingEarnings: boolean;
  loadingTransactions: boolean;
  withdrawing: boolean;
  error: string | null;

  // Actions
  fetchEarnings: (userAddress?: string, force?: boolean) => Promise<void>;
  fetchTransactions: (
    options?: { page?: number; limit?: number; type?: string },
    userAddress?: string,
    force?: boolean
  ) => Promise<void>;
  withdraw: (
    amount: number,
    userAddress?: string,
    txHash?: string
  ) => Promise<{ success: boolean; amountWithdrawn: number; txHash: string; remainingBalance: number }>;
  reset: () => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  earnings: null,
  transactions: [],
  transactionStats: null,

  loadingEarnings: false,
  loadingTransactions: false,
  withdrawing: false,
  error: null,

  fetchEarnings: async (userAddress, force = false) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) return;
    const { earnings, loadingEarnings } = get();
    if (loadingEarnings) return;
    if (earnings && !force) return;

    set({ loadingEarnings: true, error: null });
    try {
      const data = await matrixApi.getEarnings(addr);
      set({ earnings: data, loadingEarnings: false });
    } catch (err: any) {
      set({
        error: err?.message || "Failed to load earnings overview",
        loadingEarnings: false,
      });
    }
  },

  fetchTransactions: async (options = { page: 1, limit: 30 }, userAddress, force = false) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) return;
    const { transactions, loadingTransactions } = get();
    if (loadingTransactions) return;
    if (transactions.length > 0 && !force) return;

    set({ loadingTransactions: true, error: null });
    try {
      const res = await matrixApi.getTransactions(addr, options);
      set({
        transactions: res.items || [],
        transactionStats: res.stats || null,
        loadingTransactions: false,
      });
    } catch (err: any) {
      set({
        error: err?.message || "Failed to load transactions",
        loadingTransactions: false,
      });
    }
  },

  withdraw: async (amount: number, userAddress?: string, txHash?: string) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) throw new Error("No wallet connected for withdrawal");

    set({ withdrawing: true, error: null });
    try {
      const res = await matrixApi.withdraw(addr, amount, txHash);
      // Re-fetch earnings & profile balance
      await get().fetchEarnings(addr, true);
      await get().fetchTransactions({ page: 1, limit: 30 }, addr, true);
      await useUserStore.getState().fetchProfile(true);
      set({ withdrawing: false });
      return res;
    } catch (err: any) {
      set({
        error: err?.message || "Withdrawal failed",
        withdrawing: false,
      });
      throw err;
    }
  },

  reset: () => {
    set({
      earnings: null,
      transactions: [],
      transactionStats: null,
      error: null,
    });
  },
}));
