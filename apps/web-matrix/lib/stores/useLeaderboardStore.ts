import { create } from "zustand";
import {
  matrixApi,
  MatrixLeaderboardEntry,
  MatrixLeaderboardSummary,
} from "../api";
import { useUserStore } from "./useUserStore";

export type LeaderboardTimeframe = "All Time" | "30 Days" | "7 Days";

export interface LeaderboardUserRank {
  rank: number | null;
  totalUsers: number;
  activeEarners?: number;
  totalEarnedUsd?: number;
  totalEarnedTrob?: number;
  recyclesCount?: number;
  directCount?: number;
  milestones?: number;
  rankTier?: number;
  rankName?: string;
}

export interface LeaderboardState {
  entries: MatrixLeaderboardEntry[];
  summary: MatrixLeaderboardSummary | null;
  timeframe: LeaderboardTimeframe;
  userRank: LeaderboardUserRank | null;
  loading: boolean;
  error: string | null;

  // Actions
  setTimeframe: (timeframe: LeaderboardTimeframe) => void;
  fetchLeaderboard: (force?: boolean) => Promise<void>;
  fetchUserRank: (userAddress?: string) => Promise<void>;
}

let latestLeaderboardRequestId = 0;

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: [],
  summary: null,
  timeframe: "All Time",
  userRank: null,
  loading: false,
  error: null,

  setTimeframe: (timeframe: LeaderboardTimeframe) => {
    set({ timeframe });
    get().fetchLeaderboard(true);
  },

  fetchLeaderboard: async (force = false) => {
    const { timeframe, entries } = get();
    if (entries.length > 0 && !force) return;

    const reqId = ++latestLeaderboardRequestId;
    set({ loading: true, error: null });
    const period = timeframe === "7 Days" ? "7d" : timeframe === "30 Days" ? "30d" : "all";

    try {
      const res = await matrixApi.getLeaderboard(period, 100);
      if (reqId !== latestLeaderboardRequestId) return;
      const rawEntries = Array.isArray(res) ? res : res?.entries || [];
      const summary = !Array.isArray(res) && res?.summary ? res.summary : get().summary;

      const genesisHex = process.env.NEXT_PUBLIC_GENESIS_ROOT_HEX?.toLowerCase();
      const genesisB58 = process.env.NEXT_PUBLIC_GENESIS_ROOT_ADDRESS?.toLowerCase();
      const cleaned = rawEntries.filter((e) => {
        const a = (e.address || "").toLowerCase();
        const b = (e.base58 || "").toLowerCase();
        if (genesisHex && a === genesisHex) return false;
        if (genesisB58 && (a === genesisB58 || b === genesisB58)) return false;
        return true;
      });

      set({ entries: cleaned, summary: summary || null, loading: false, error: null });
      return;
    } catch (err: any) {
      if (reqId !== latestLeaderboardRequestId) return;
      set({ entries: [], loading: false, error: err?.message || "Failed to load on-chain leaderboard" });
    }
  },

  fetchUserRank: async (userAddress) => {
    const addr = userAddress || useUserStore.getState().address;
    if (!addr) {
      set({ userRank: null });
      return;
    }

    try {
      const rank = await matrixApi.getUserRank(addr).catch(() => null);
      if (rank) {
        set({ userRank: rank });
      }
    } catch {}
  },
}));

