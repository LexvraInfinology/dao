import { create } from "zustand";
import {
  matrixApi,
  getStoredUserAddress,
  setStoredUserAddress,
  MatrixUserProfile,
  MatrixSettings,
} from "../api";

export interface UserState {
  address: string;
  profile: MatrixUserProfile | null;
  settings: MatrixSettings | null;
  loadingProfile: boolean;
  loadingSettings: boolean;
  error: string | null;

  // Actions
  initAddress: () => void;
  setAddress: (newAddress: string) => void;
  fetchProfile: (force?: boolean) => Promise<void>;
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
  address: typeof window !== "undefined" ? getStoredUserAddress() : "0x71c85d7b561e723908f9c162590214b7e8d24982",
  profile: null,
  settings: null,
  loadingProfile: false,
  loadingSettings: false,
  error: null,

  initAddress: () => {
    const current = get().address;
    if (!current) {
      const stored = getStoredUserAddress();
      set({ address: stored });
    }
  },

  setAddress: (newAddress: string) => {
    const clean = newAddress.toLowerCase().trim();
    setStoredUserAddress(clean);
    set({
      address: clean,
      profile: null,
      settings: null,
      error: null,
    });
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
      const prof = await matrixApi.getProfile(effectiveAddress, sponsor || undefined);
      set({ profile: prof, loadingProfile: false });
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
        error: err?.message || "Failed to load settings",
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
      error: null,
    });
  },
}));
