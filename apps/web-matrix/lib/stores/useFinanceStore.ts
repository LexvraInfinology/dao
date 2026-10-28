import { create } from "zustand";
import {
  matrixApi,
  getStoredUserAddress,
  MatrixEarningsOverview,
  MatrixTransaction,
} from "../api";
import { useUserStore } from "./useUserStore";
import { getOnChainUserProfile, getOnChainJoinedTransactions } from "../contracts";

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
      const [data, onChainProf] = await Promise.all([
        matrixApi.getEarnings(addr).catch(() => null),
        getOnChainUserProfile(addr).catch(() => null),
      ]);

      if (data && onChainProf) {
        set({
          earnings: {
            ...data,
            totalEarnings: onChainProf.totalEarnings,
            totalEarningsUsd: onChainProf.totalEarnings,
            availableBalance: onChainProf.availableBalance,
            availableBalanceUsd: onChainProf.availableBalance,
            withdrawnTotal: onChainProf.withdrawnTotal,
            withdrawnTotalUsd: onChainProf.withdrawnTotal,
            totalWithdrawn: onChainProf.withdrawnTotal,
          },
          loadingEarnings: false,
        });
      } else if (data) {
        set({ earnings: data, loadingEarnings: false });
      } else if (onChainProf) {
        set({
          earnings: {
            totalEarnings: onChainProf.totalEarnings,
            totalEarningsUsd: onChainProf.totalEarnings,
            availableBalance: onChainProf.availableBalance,
            availableBalanceUsd: onChainProf.availableBalance,
            withdrawnTotal: onChainProf.withdrawnTotal,
            withdrawnTotalUsd: onChainProf.withdrawnTotal,
            totalWithdrawn: onChainProf.withdrawnTotal,
            pendingRewards: 0,
            breakdown: {
              directBonus: onChainProf.directEarnings,
              matrixPlacements: onChainProf.matrixEarnings,
              upgradeReserves: 0,
              poolShares: 0,
            },
            recentPayouts: [],
          },
          loadingEarnings: false,
        });
      } else {
        throw new Error("Failed to load earnings overview from chain or database");
      }
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
      if (res && res.items && res.items.length > 0) {
        set({
          transactions: res.items,
          transactionStats: res.stats || null,
          loadingTransactions: false,
        });
        return;
      }
    } catch {
      // Fallback to verified on-chain transactions
    }

    try {
      const onChainRes = getOnChainJoinedTransactions(addr);
      set({
        transactions: onChainRes.items,
        transactionStats: onChainRes.stats,
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
