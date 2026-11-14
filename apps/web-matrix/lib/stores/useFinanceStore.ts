import { create } from "zustand";
import {
  matrixApi,
  getStoredUserAddress,
  MatrixEarningsOverview,
  MatrixTransaction,
} from "../api";
import { useUserStore } from "./useUserStore";
import { getOnChainUserProfile, getOnChainJoinedTransactions, getOnChainUserTransactions } from "../contracts";

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

function getLocalEarningsCache(addr: string): MatrixEarningsOverview | null {
  if (typeof window === "undefined" || !addr) return null;
  try {
    const raw = localStorage.getItem(`equora_earnings_${addr.toLowerCase()}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalEarningsCache(addr: string, data: MatrixEarningsOverview) {
  if (typeof window === "undefined" || !addr || !data) return;
  try {
    localStorage.setItem(`equora_earnings_${addr.toLowerCase()}`, JSON.stringify(data));
  } catch {}
}

function getLocalTransactionsCache(addr: string): { items: MatrixTransaction[]; stats: any } | null {
  if (typeof window === "undefined" || !addr) return null;
  try {
    const raw = localStorage.getItem(`equora_txs_${addr.toLowerCase()}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalTransactionsCache(addr: string, items: MatrixTransaction[], stats: any) {
  if (typeof window === "undefined" || !addr || !items) return;
  try {
    localStorage.setItem(`equora_txs_${addr.toLowerCase()}`, JSON.stringify({ items, stats }));
  } catch {}
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

    // 1. Immediately hydrate from persistent local cache so charts and balances NEVER disappear
    const currentEarnings = get().earnings;
    if (!currentEarnings) {
      const cached = getLocalEarningsCache(addr);
      if (cached) {
        set({ earnings: cached });
      }
    }

    const { loadingEarnings } = get();
    if (loadingEarnings) return;
    if (get().earnings && !force) return;

    set({ loadingEarnings: true, error: null });
    try {
      const [data, onChainProf] = await Promise.all([
        matrixApi.getEarnings(addr).catch(() => null),
        getOnChainUserProfile(addr).catch(() => null),
      ]);

      const existing = get().earnings;

      if (data && onChainProf) {
        const apiTotal = Number(data.totalEarningsUsd ?? data.totalEarnings ?? 0);
        const effTotal = apiTotal > 0 ? apiTotal : onChainProf.totalEarnings;
        const apiSettled = Number(data.totalWithdrawn ?? data.withdrawnTotalUsd ?? 0);
        const effSettled =
          apiSettled > 0
            ? apiSettled
            : onChainProf.withdrawnTotal > 0
              ? onChainProf.withdrawnTotal
              : effTotal;
        const apiAvail = Number(data.availableBalanceUsd ?? data.availableBalance ?? 0);

        // Safeguard: Never replace populated payouts with empty array
        const freshPayouts =
          Array.isArray(data.recentPayouts) && data.recentPayouts.length > 0
            ? data.recentPayouts
            : existing?.recentPayouts || [];

        const merged: MatrixEarningsOverview = {
          ...data,
          totalEarnings: effTotal,
          totalEarningsUsd: effTotal,
          availableBalance: apiAvail > 0 ? apiAvail : onChainProf.availableBalance,
          availableBalanceUsd: apiAvail > 0 ? apiAvail : onChainProf.availableBalance,
          withdrawnTotal: effSettled,
          withdrawnTotalUsd: effSettled,
          totalWithdrawn: effSettled,
          recentPayouts: freshPayouts,
        };
        set({
          earnings: merged,
          loadingEarnings: false,
        });
        setLocalEarningsCache(addr, merged);
      } else if (data) {
        const freshPayouts =
          Array.isArray(data.recentPayouts) && data.recentPayouts.length > 0
            ? data.recentPayouts
            : existing?.recentPayouts || [];
        const merged = {
          ...data,
          recentPayouts: freshPayouts,
        };
        set({ earnings: merged, loadingEarnings: false });
        setLocalEarningsCache(addr, merged);
      } else if (onChainProf) {
        const effSettled =
          onChainProf.withdrawnTotal > 0 ? onChainProf.withdrawnTotal : onChainProf.totalEarnings;
        // Keep existing payouts rather than wiping to empty array!
        const existingPayouts = existing?.recentPayouts || [];
        const merged: MatrixEarningsOverview = {
          totalEarnings: onChainProf.totalEarnings,
          totalEarningsUsd: onChainProf.totalEarnings,
          availableBalance: onChainProf.availableBalance,
          availableBalanceUsd: onChainProf.availableBalance,
          withdrawnTotal: effSettled,
          withdrawnTotalUsd: effSettled,
          totalWithdrawn: effSettled,
          pendingRewards: 0,
          breakdown: existing?.breakdown || {
            directBonus: onChainProf.directEarnings,
            matrixPlacements: onChainProf.matrixEarnings,
            upgradeReserves: 0,
            poolShares: 0,
          },
          slotBreakdowns: (existing as any)?.slotBreakdowns || [],
          chartData: existing?.chartData || [],
          recentPayouts: existingPayouts,
        };
        set({
          earnings: merged,
          loadingEarnings: false,
        });
        setLocalEarningsCache(addr, merged);
      } else if (existing) {
        // If both network queries failed, preserve cached data
        set({ loadingEarnings: false });
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

  fetchTransactions: async (options = { page: 1, limit: 100 }, userAddress, force = false) => {
    const addr = userAddress || useUserStore.getState().address || getStoredUserAddress();
    if (!addr) return;

    // Immediately hydrate from local cache if store is empty
    const currentTxs = get().transactions;
    if (currentTxs.length === 0) {
      const cached = getLocalTransactionsCache(addr);
      if (cached && cached.items && cached.items.length > 0) {
        set({ transactions: cached.items, transactionStats: cached.stats || null });
      }
    }

    const { loadingTransactions } = get();
    if (loadingTransactions) return;
    if (get().transactions.length > 0 && !force) return;

    set({ loadingTransactions: true, error: null });
    // 1. Prioritize live 100% on-chain blockchain transaction ledger
    try {
      const onChainRes = await getOnChainUserTransactions(addr);
      if (onChainRes && onChainRes.items && onChainRes.items.length > 0) {
        set({
          transactions: onChainRes.items,
          transactionStats: onChainRes.stats,
          loadingTransactions: false,
        });
        setLocalTransactionsCache(addr, onChainRes.items, onChainRes.stats);
        return;
      }
    } catch (err: any) {
      console.warn("[FinanceStore] On-chain tx ledger notice:", err?.message || err);
    }

    // 2. Fallback to API / DB
    try {
      const res = await matrixApi.getTransactions(addr, options);
      if (res && res.items && res.items.length > 0) {
        set({
          transactions: res.items,
          transactionStats: res.stats || null,
          loadingTransactions: false,
        });
        setLocalTransactionsCache(addr, res.items, res.stats);
        return;
      }
    } catch {}

    set({ loadingTransactions: false });
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
