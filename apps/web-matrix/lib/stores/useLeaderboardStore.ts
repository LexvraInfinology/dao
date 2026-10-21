import { create } from "zustand";
import { matrixApi, MatrixLeaderboardEntry } from "../api";
import { useUserStore } from "./useUserStore";

export type LeaderboardTimeframe = "All Time" | "30 Days" | "7 Days";

export interface LeaderboardState {
  entries: MatrixLeaderboardEntry[];
  timeframe: LeaderboardTimeframe;
  userRank: { rank: number; totalUsers: number } | null;
  loading: boolean;
  error: string | null;

  // Actions
  setTimeframe: (timeframe: LeaderboardTimeframe) => void;
  fetchLeaderboard: (force?: boolean) => Promise<void>;
  fetchUserRank: (userAddress?: string) => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: [],
  timeframe: "All Time",
  userRank: null,
  loading: false,
  error: null,

  setTimeframe: (timeframe: LeaderboardTimeframe) => {
    set({ timeframe });
    get().fetchLeaderboard(true);
  },

  fetchLeaderboard: async (force = false) => {
    const { timeframe, entries, loading } = get();
    if (loading) return;
    if (entries.length > 0 && !force) return;

    set({ loading: true, error: null });
    const period = timeframe === "7 Days" ? "week" : timeframe === "30 Days" ? "month" : "all";

    try {
      const data = await matrixApi.getLeaderboard(period, 50);
      set({ entries: data || [], loading: false });
    } catch (err: any) {
      set({
        error: err?.message || "Failed to load leaderboard",
        loading: false,
      });
    }
  },

  fetchUserRank: async (userAddress) => {
    const addr = userAddress || useUserStore.getState().address;
    if (!addr) return;

    try {
      const rank = await matrixApi.getUserRank(addr);
      set({ userRank: rank });
    } catch {
      // Non-critical, ignore
    }
  },
}));
