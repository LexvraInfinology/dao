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
            a !== '0x7124b32b48786a13177f3bdc9620e7a48eb9c902' &&
            a !== 'tlhtkgsbruwfyv8mo6b4z3rrj1k1wlwzwa' &&
            a !== '0xef380fa5abfba8a057e1df49c0f6b3d6b24280ee'
          );
        });
        set({ entries: cleaned, loading: false });
        return;
      }
    } catch {}

    // Fall back to on-chain joined members registry if API is unavailable
    try {
      const records: any[] = require("../joinedMembers.json");
      if (Array.isArray(records) && records.length > 0) {
        const entries: MatrixLeaderboardEntry[] = records.slice(0, 25).map((rec, idx) => {
          const directs = records.filter(
            (r) => r.sponsor && r.sponsor.toLowerCase() === rec.evm?.toLowerCase()
          ).length;
          const totalEarnings = directs >= 2 ? directs * 30 : 0;
          return {
            rank: idx + 1,
            address: rec.evm,
            userId: rec.memberNumber || idx + 1,
            username: rec.name || `Operative ${rec.evm.slice(2, 6).toUpperCase()}`,
            avatarUrl: null,
            totalEarned: totalEarnings,
            totalEarnedUsd: totalEarnings,
            directCount: directs,
            highestSlot: 1,
            rankTier: directs >= 10 ? 4 : directs >= 5 ? 3 : directs >= 2 ? 2 : 1,
            rankName: directs >= 10 ? "CROWN" : directs >= 5 ? "ELITE" : directs >= 2 ? "PRIME" : "ALPHA",
          };
        });
        set({ entries, loading: false });
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

    // Check position in joined members
    try {
      const records: any[] = require("../joinedMembers.json");
      if (Array.isArray(records)) {
        const idx = records.findIndex((r) => r.evm?.toLowerCase() === addr.toLowerCase());
        if (idx !== -1) {
          set({ userRank: { rank: idx + 1, totalUsers: records.length } });
        }
      }
    } catch {}
  },
}));
