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
      const data = await matrixApi.getLeaderboard(period, 50).catch(() => null);
      if (data && data.length > 0) {
        const cleaned = data.filter((e) => {
          const a = (e.address || '').toLowerCase();
          return (
            (!process.env.NEXT_PUBLIC_GENESIS_ROOT_HEX || a !== process.env.NEXT_PUBLIC_GENESIS_ROOT_HEX.toLowerCase()) && (!process.env.NEXT_PUBLIC_GENESIS_ROOT_ADDRESS || a !== process.env.NEXT_PUBLIC_GENESIS_ROOT_ADDRESS.toLowerCase())
          );
        });
        set({ entries: cleaned, loading: false });
        return;
      }
    } catch {}

    set({ entries: [], loading: false });
  },

  fetchUserRank: async (userAddress) => {
    const addr = userAddress || useUserStore.getState().address;
    if (!addr) return;

    try {
      const rank = await matrixApi.getUserRank(addr).catch(() => null);
      if (rank) {
        set({ userRank: rank });
        return;
      }
    } catch {}

    
  },
}));

