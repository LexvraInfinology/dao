import { create } from "zustand";
import {
  matrixApi,
  getStoredUserAddress,
  setStoredUserAddress,
  clearStoredUserAddress,
  MatrixUserProfile,
  MatrixSettings,
  WalletEligibility,
} from "../api";
import { getOnChainUserProfile } from "../contracts";
import { getInjectedAuthorizedAccount, disconnectWallet, normalizeTo0x } from "../web3Wallet";

export interface UserState {
  address: string;
  profile: MatrixUserProfile | null;
  settings: MatrixSettings | null;
  eligibility: WalletEligibility | null;
  loadingProfile: boolean;
  loadingSettings: boolean;
  loadingEligibility: boolean;
  error: string | null;

  // Actions
  initAddress: () => void;
  setAddress: (newAddress: string) => void;
  disconnect: () => void;
  fetchProfile: (force?: boolean) => Promise<void>;
  fetchEligibility: (force?: boolean) => Promise<void>;
  updateProfile: (data: {
    username?: string;
    avatarUrl?: string;
    bio?: string;
    telegram?: string;
    twitter?: string;
  }) => Promise<MatrixUserProfile>;
  fetchSettings: (force?: boolean) => Promise<void>;
  updateSettings: (data: Partial<MatrixSettings>) => Promise<MatrixSettings>;
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  address: typeof window !== "undefined" ? getStoredUserAddress() : "",
  profile: null,
  settings: null,
  eligibility: null,
  loadingProfile: false,
  loadingSettings: false,
  loadingEligibility: false,
  error: null,

  initAddress: () => {
    if (typeof window !== "undefined") {
      const tryDetect = () => {
        if (localStorage.getItem("equora_wallet_explicit_disconnect") === "true") {
          set({ address: "", eligibility: null });
          return true;
        }

        // 1. Prioritize live injected wallet from browser / APK
        const injected = getInjectedAuthorizedAccount();
        if (injected) {
          setStoredUserAddress(injected);
          set({ address: injected });
          get().fetchEligibility();
          get().fetchProfile(true);
          return true;
        }

        // 2. Fall back to persisted address
        const stored = getStoredUserAddress();
        if (stored) {
          set({ address: stored });
          get().fetchEligibility();
          get().fetchProfile(true);
          return true;
        }

        return false;
      };

      if (!tryDetect()) {
        set({ address: "", eligibility: null });
        let pollCount = 0;
        const interval = setInterval(() => {
          pollCount++;
          if (tryDetect() || pollCount >= 30) {
            clearInterval(interval);
          }
        }, 100);
      }
    }
  },

  setAddress: (newAddress: string) => {
    const clean = newAddress ? normalizeTo0x(newAddress) : "";
    if (clean) {
      setStoredUserAddress(clean);
    } else {
      clearStoredUserAddress();
    }
    set({
      address: clean,
      profile: null,
      settings: null,
      eligibility: null,
      error: null,
    });
    if (clean) {
      get().fetchEligibility(true);
      get().fetchProfile(true);
    }
  },

  disconnect: () => {
    disconnectWallet();
    set({
      address: "",
      profile: null,
      settings: null,
      eligibility: null,
      error: null,
    });
  },

  fetchEligibility: async (force = false) => {
    const { address, eligibility, loadingEligibility } = get();
    const effectiveAddress = address || getStoredUserAddress();
    if (!effectiveAddress) return;
    if (loadingEligibility) return;
    if (eligibility && !force) return;

    set({ loadingEligibility: true });
    try {
      const data = await matrixApi.getWalletEligibility(effectiveAddress);
      set({ eligibility: data, loadingEligibility: false });
    } catch {
      set({ loadingEligibility: false });
    }
  },

  fetchProfile: async (force = false) => {
    const { address, profile, loadingProfile } = get();
    const effectiveAddress = address || getStoredUserAddress();
    if (!effectiveAddress) return;
    if (loadingProfile) return;
    if (profile && !force) return;

    set({ loadingProfile: true, error: null });
    try {
      const sponsor = typeof window !== "undefined" ? localStorage.getItem("equora_sponsor") : null;
      const [onChainProf, dbProf] = await Promise.all([
        getOnChainUserProfile(effectiveAddress).catch((err) => {
          console.warn("[UserStore] On-chain profile query failed:", err?.message);
          return null;
        }),
        matrixApi.getProfile(effectiveAddress, sponsor || undefined).catch((err) => {
          const isAbort =
            err?.name === "AbortError" ||
            err?.message?.toLowerCase().includes("aborted") ||
            err?.message?.toLowerCase().includes("cancelled") ||
            err?.message?.toLowerCase().includes("timed out");
          if (!isAbort) {
            console.warn("[UserStore] API profile query notice:", err?.message || err);
          }
          return null;
        }),
      ]);

      if (onChainProf && dbProf) {
        // Retain live on-chain balances/status as absolute truth, preserve user custom profile data
        const merged = {
          ...dbProf,
          ...onChainProf,
          highestUnlockedSlot: onChainProf.highestUnlockedSlot,
          totalEarnings: onChainProf.totalEarnings,
          directEarnings: onChainProf.directEarnings,
          matrixEarnings: onChainProf.matrixEarnings,
          availableBalance: onChainProf.availableBalance,
          withdrawnTotal: onChainProf.withdrawnTotal,
          directReferralsCount: onChainProf.directReferralsCount,
          activeDirectsCount: onChainProf.activeDirectsCount,
          isQualified: onChainProf.isQualified,
          rankTier: onChainProf.rankTier,
          username: dbProf.username || onChainProf.username,
          avatarUrl: dbProf.avatarUrl || onChainProf.avatarUrl,
          referralCode: onChainProf.referralCode || dbProf.referralCode || null,
          sponsorCode: onChainProf.sponsorCode || dbProf.sponsorCode || null,
          daoSeat: onChainProf.daoSeat || (dbProf as any)?.daoSeat || null,
          joinedAt: dbProf.joinedAt || onChainProf.joinedAt,
          bio: dbProf.bio || onChainProf.bio,
          telegram: dbProf.telegram || onChainProf.telegram,
          twitter: dbProf.twitter || onChainProf.twitter,
        };
        set({ profile: merged, loadingProfile: false });
        return;
      } else if (onChainProf) {
        set({ profile: onChainProf, loadingProfile: false });
        return;
      } else if (dbProf) {
        set({ profile: dbProf, loadingProfile: false });
        return;
      }
      throw new Error("Unable to load profile data from chain or database");
    } catch (err: any) {
      set({
        error: err?.message || "Failed to load user profile",
        loadingProfile: false,
      });
    }
  },

  updateProfile: async (data) => {
    const { address } = get();
    const effectiveAddress = address || getStoredUserAddress();
    if (!effectiveAddress) throw new Error("No wallet address connected");

    try {
      const updated = await matrixApi.updateProfile(effectiveAddress, data);
      set({ profile: updated });
      return updated;
    } catch (err: any) {
      set({ error: err?.message || "Failed to update profile" });
      throw err;
    }
  },

  fetchSettings: async (force = false) => {
    const { address, settings, loadingSettings } = get();
    const effectiveAddress = address || getStoredUserAddress();
    if (!effectiveAddress) return;
    if (loadingSettings) return;
    if (settings && !force) return;

    set({ loadingSettings: true, error: null });
    try {
      const sett = await matrixApi.getSettings(effectiveAddress);
      set({ settings: sett, loadingSettings: false });
    } catch (err: any) {
      set({
        settings: {
          autoUpgrade: true,
          autoReinvest: true,
          telegramNotifications: true,
          emailNotifications: false,
          soundEffects: true,
          currency: "USD",
          theme: "dark",
          matrixDisplayMode: "level",
          hideZeroBalances: false,
          email: null,
          telegram: null,
          notifications: {
            telegramNotifications: true,
            emailNotifications: false,
            soundEffects: true,
            matrixActivity: true,
            levelUpdates: true,
            referralJoined: true,
            cycleCompletion: true,
            earningsReward: true,
            leaderboardRank: true,
            announcements: false,
          },
        },
        loadingSettings: false,
      });
    }
  },

  updateSettings: async (data) => {
    const { address } = get();
    const effectiveAddress = address || getStoredUserAddress();
    if (!effectiveAddress) throw new Error("No wallet address connected");

    try {
      const updated = await matrixApi.updateSettings(effectiveAddress, data);
      set({ settings: updated });
      return updated;
    } catch (err: any) {
      set({ error: err?.message || "Failed to update settings" });
      throw err;
    }
  },

  reset: () => {
    set({
      profile: null,
      settings: null,
      eligibility: null,
      error: null,
    });
  },
}));
