// ==============================================================================
// EQUORA MATRIX PROTOCOL — FRONTEND API CLIENT (apps/web-matrix/lib/api.ts)
// ==============================================================================

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    const raw = process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
    return raw.endsWith("/api/matrix") ? raw : `${raw}/api/matrix`;
  }
  // In the browser, check if running on localhost
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4000/api/matrix";
    }
  }
  return "https://api.equorafidao.com/api/matrix";
}

export const API_BASE_URL = getApiBaseUrl();

export const DEFAULT_USER_ADDRESS = "";

export function getStoredUserAddress(): string {
  if (typeof window !== "undefined") {
    // Check if user explicitly disconnected
    const isDisconnected = localStorage.getItem("equora_wallet_explicit_disconnect") === "true";
    if (isDisconnected) return "";

    const stored = localStorage.getItem("equora_user_address");
    if (stored && stored.trim().startsWith("0x")) {
      return stored.trim().toLowerCase();
    }

    // Dynamic cross-sync with DAO auth address if present on this device
    const daoAuth = localStorage.getItem("equora_auth_address");
    if (daoAuth && daoAuth.trim().startsWith("0x")) {
      return daoAuth.trim().toLowerCase();
    }
  }
  return "";
}

export function setStoredUserAddress(address: string | null): void {
  if (typeof window !== "undefined") {
    if (address && address.trim().startsWith("0x")) {
      localStorage.setItem("equora_user_address", address.trim().toLowerCase());
      localStorage.removeItem("equora_wallet_explicit_disconnect");
    } else {
      localStorage.removeItem("equora_user_address");
      localStorage.setItem("equora_wallet_explicit_disconnect", "true");
    }
  }
}

export function clearStoredUserAddress(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("equora_user_address");
    localStorage.setItem("equora_wallet_explicit_disconnect", "true");
  }
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface MatrixUserProfile {
  address: string;
  userId: number;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  telegram: string | null;
  twitter: string | null;
  sponsorAddress: string | null;
  sponsorUserId: number | null;
  sponsorCode?: number | null;
  referralCode?: number | null;
  daoSeat?: number | null;
  upline2Address?: string | null;
  directReferralsCount: number;
  activeDirectsCount?: number;
  isQualified?: boolean;
  isRegistered?: boolean;
  teamCount: number;
  rankTier: number;
  rankName: string;
  totalEarnings: number;
  totalEarningsTrob?: number;
  totalEarningsUsd?: number;
  directEarnings: number;
  matrixEarnings: number;
  poolEarnings: number;
  availableBalance: number;
  availableBalanceTrob?: number;
  availableBalanceUsd?: number;
  withdrawnTotal: number;
  withdrawnTotalTrob?: number;
  withdrawnTotalUsd?: number;
  recyclesCount: number;
  highestUnlockedSlot: number;
  currentSlot?: number;
  isSlot2Reserved?: boolean;
  joinedAt: string;
}

export interface MatrixDashboardOverview {
  address?: string;
  highestUnlockedSlot?: number;
  currentSlot: number;
  totalEarnedTrob: number;
  totalEarnedUsd: number;
  availableWithdrawTrob: number;
  availableWithdrawUsd: number;
  totalWithdrawnTrob?: number;
  totalWithdrawnUsd?: number;
  recyclesCount: number;
  trobPriceUsd: number;
  isQualified?: boolean;
  activeDirectsCount?: number;
  sponsorAddress?: string | null;
  activeSlotProgress: {
    slotNumber: number;
    filledNodes: number;
    totalNodes: number;
    cycle: number;
    upgradeReserve: number;
    level1Filled: number;
    level2Filled: number;
    level3Filled: number;
    currentCycle?: number;
    nodes?: any[];
  };
  nextPosition?: {
    positionNumber: number;
    title: string;
    description: string;
    rewardType: string;
  };
  recentActivity: Array<{
    id: string;
    action?: string;
    title?: string;
    description: string;
    slotNumber?: number;
    amount?: number;
    timestamp: string;
    status: string;
    slot?: number;
    position?: number;
    amountUsd?: number;
    token?: string;
    fromAddress?: string | null;
    toAddress?: string | null;
    txHash?: string | null;
  }>;
}

export interface MatrixSlotSummary {
  slotNumber: number;
  cost: number;
  isUnlocked: boolean;
  isLive?: boolean;
  currentCycle: number;
  recyclesCount: number;
  filledNodes: number;
  upgradeReserve: number;
  totalEarned: number;
  totalEarnedUsd?: number;
  totalEarnedTrob?: number;
  unlockedAt: string | null;
}

export interface MatrixNodePlacement {
  position: number;
  level: number;
  filled: boolean;
  placedUser: string | null;
  userId: number | null;
  payoutType: string | null;
  recipientAddress: string | null;
  wasFallback: boolean;
  amount: number;
  timestamp: string | null;
  isDirect?: boolean;
  isDirectDeposited?: boolean;
  isSpillover?: boolean;
}

export interface MatrixSlotDetails {
  slotNumber: number;
  cost: number;
  isUnlocked: boolean;
  isLive?: boolean;
  currentCycle: number;
  totalCycles?: number;
  isViewingSnapshot?: boolean;
  recyclesCount: number;
  filledNodes: number;
  upgradeReserve: number;
  totalEarned: number;
  totalEarnedUsd?: number;
  totalEarnedTrob?: number;
  nodes: MatrixNodePlacement[];
}

export interface MatrixLeaderboardEntry {
  rank: number;
  address: string;
  userId: number;
  username: string;
  avatarUrl: string | null;
  totalEarned: number;
  totalEarnedUsd: number;
  directCount: number;
  highestSlot: number;
  rankTier: number;
  rankName: string;
}

export interface MatrixTransaction {
  id: string;
  type: string;
  slotNumber: number | null;
  slotIndex?: number | null;
  cycle: number | null;
  position: number | null;
  amount: number;
  amountUsd: number | null;
  token: string;
  fromAddress: string | null;
  toAddress: string | null;
  txHash: string | null;
  status: string;
  description: string | null;
  timestamp: string;
}

export type MatrixTransactionItem = MatrixTransaction;

export interface MatrixEarningsOverview {
  totalEarnings: number;
  totalEarningsUsd?: number;
  availableBalance: number;
  availableBalanceUsd?: number;
  withdrawnTotal: number;
  withdrawnTotalUsd?: number;
  totalWithdrawn?: number;
  pendingRewards?: number;
  trobPriceUsd?: number;
  breakdown: {
    directBonus?: number;
    matrixPlacements?: number;
    upgradeReserves?: number;
    poolShares?: number;
    directMatrixBonus?: number;
    levelOverrides?: number;
    leadershipPool?: number;
    recycleSpillover?: number;
  };
  monthlyOverview?: Array<{ month: string; amount: number }>;
  chartData?: Array<{
    date: string;
    amount: number;
  }>;
  recentPayouts: MatrixTransaction[];
}

export interface MatrixSettings {
  autoUpgrade: boolean;
  autoReinvest: boolean;
  telegramNotifications: boolean;
  emailNotifications: boolean;
  soundEffects: boolean;
  currency: string;
  theme: string;
  matrixDisplayMode: string;
  hideZeroBalances: boolean;
  email: string | null;
  telegram: string | null;
  notifications?: Record<string, boolean>;
  privacy?: Record<string, any>;
}

import { MatrixApiError, parseApiErrorResponse, formatUserErrorMessage } from "./errors";

export { MatrixApiError };

// ── Generic Fetch Helper ────────────────────────────────────────────────────

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new MatrixApiError(0, "Backend API not configured", "Using direct on-chain synchronization.");
  }
  const url = `${baseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      const friendlyMessage = parseApiErrorResponse(errText, res.status);
      console.warn(`[Matrix API] Error (${res.status}) on ${endpoint}:`, errText);
      throw new MatrixApiError(res.status, errText, friendlyMessage);
    }

    const data = await res.json();
    return data.data !== undefined ? data.data : data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof MatrixApiError) {
      throw error;
    }
    const technical = error instanceof Error ? error.message : String(error);
    const friendlyMessage = formatUserErrorMessage(
      error,
      "Unable to connect to the server. Please check your internet connection."
    );
    console.warn(`[Matrix API] Network error on ${url}:`, technical);
    throw new MatrixApiError(0, technical, friendlyMessage);
  }
}

// ── API Methods ─────────────────────────────────────────────────────────────

export const matrixApi = {
  /** User Profile */
  async getProfile(address: string, sponsorAddress?: string): Promise<MatrixUserProfile> {
    const qs = sponsorAddress ? `?sponsor=${encodeURIComponent(sponsorAddress)}` : "";
    return apiFetch<MatrixUserProfile>(`/profile/${address.toLowerCase()}${qs}`);
  },

  async updateProfile(
    address: string,
    data: { username?: string; avatarUrl?: string; bio?: string; telegram?: string; twitter?: string }
  ): Promise<MatrixUserProfile> {
    return apiFetch<MatrixUserProfile>(`/profile/${address.toLowerCase()}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async registerUser(address: string, sponsorAddress?: string): Promise<MatrixUserProfile> {
    return apiFetch<MatrixUserProfile>(`/user/register`, {
      method: "POST",
      body: JSON.stringify({ address: address.toLowerCase(), sponsorAddress }),
    });
  },

  /** Dashboard */
  async getDashboard(address: string): Promise<MatrixDashboardOverview> {
    return apiFetch<MatrixDashboardOverview>(`/dashboard/${address.toLowerCase()}`);
  },

  /** Slots & Tree */
  async getSlots(address: string): Promise<MatrixSlotSummary[]> {
    return apiFetch<MatrixSlotSummary[]>(`/slots/${address.toLowerCase()}`);
  },

  async getSlotDetails(address: string, slotNumber: number, cycle?: number): Promise<MatrixSlotDetails> {
    const qs = cycle ? `?cycle=${cycle}` : "";
    return apiFetch<MatrixSlotDetails>(`/slots/${address.toLowerCase()}/${slotNumber}${qs}`);
  },

  async buySlot(
    userAddress: string,
    slotNumber: number,
    txHash?: string,
    sponsorAddress?: string
  ): Promise<{ success: boolean; slot: MatrixSlotSummary; message: string }> {
    return apiFetch<{ success: boolean; slot: MatrixSlotSummary; message: string }>(`/slots/buy`, {
      method: "POST",
      body: JSON.stringify({
        userAddress: userAddress.toLowerCase(),
        slotNumber,
        txHash,
        sponsorAddress: sponsorAddress ? sponsorAddress.toLowerCase() : undefined,
      }),
    });
  },

  async getDirectMembers(address: string): Promise<Array<{
    address: string;
    userId: number;
    username: string;
    joinedAt: string;
    activeSlots: number;
    totalContributed: number;
  }>> {
    return apiFetch(`/directs/${address.toLowerCase()}`);
  },

  /** Leaderboard */
  async getLeaderboard(period = "all", limit = 25): Promise<MatrixLeaderboardEntry[]> {
    return apiFetch<MatrixLeaderboardEntry[]>(`/leaderboard?period=${period}&limit=${limit}`);
  },

  async getUserRank(address: string): Promise<{ rank: number; totalUsers: number }> {
    return apiFetch<{ rank: number; totalUsers: number }>(`/leaderboard/rank/${address.toLowerCase()}`);
  },

  /** Transactions */
  async getTransactions(
    address: string,
    options: { page?: number; limit?: number; type?: string } = {}
  ): Promise<{
    items: MatrixTransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: {
      totalInflow: number;
      totalOutflow: number;
      pendingCount: number;
      netProfit: number;
    };
  }> {
    const params = new URLSearchParams();
    if (options.page) params.set("page", String(options.page));
    if (options.limit) params.set("limit", String(options.limit));
    if (options.type && options.type !== "ALL") params.set("type", options.type);
    return apiFetch(`/transactions/${address.toLowerCase()}?${params.toString()}`);
  },

  /** Earnings & Withdrawals */
  async getEarnings(address: string): Promise<MatrixEarningsOverview> {
    return apiFetch<MatrixEarningsOverview>(`/earnings/${address.toLowerCase()}`);
  },

  async withdraw(
    userAddress: string,
    amount: number,
    txHash?: string
  ): Promise<{ success: boolean; amountWithdrawn: number; txHash: string; remainingBalance: number }> {
    return apiFetch(`/withdraw`, {
      method: "POST",
      body: JSON.stringify({ userAddress: userAddress.toLowerCase(), amount, txHash }),
    });
  },

  /** Settings */
  async getSettings(address: string): Promise<MatrixSettings> {
    return apiFetch<MatrixSettings>(`/settings/${address.toLowerCase()}`);
  },

  async updateSettings(address: string, data: Partial<MatrixSettings>): Promise<MatrixSettings> {
    return apiFetch<MatrixSettings>(`/settings/${address.toLowerCase()}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Dev Demo Seeding */
  async seedDemo(address: string): Promise<{ success: boolean; message: string }> {
    return apiFetch(`/dev/seed`, {
      method: "POST",
      body: JSON.stringify({ address: address.toLowerCase() }),
    });
  },

  /** Live TROB Price & $30 Slot Calculation (Benchmark pegged to live market oracle) */
  async getLiveTrobPrice(): Promise<{
    priceUsd: number;
    priceSource: string;
    updatedAt: string;
    isStale: boolean;
    slot1Trob: number;
  }> {
    try {
      const endpoints = [
        "/api/price/trob",
        "/api/price",
        "/api/trob-market/price",
      ];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { cache: "no-store" });
          if (res.ok) {
            const json = await res.json();
            const price = Number(json?.data?.priceUsd ?? json?.priceUsd ?? json?.price);
            if (Number.isFinite(price) && price > 0) {
              return {
                priceUsd: price,
                priceSource: "live-market-proxy",
                updatedAt: json?.data?.updatedAt || new Date().toISOString(),
                isStale: false,
                slot1Trob: Math.round((30 / price) * 100) / 100,
              };
            }
          }
        } catch {}
      }
    } catch {}

    const benchmarkPrice = 0.037146; // Live market benchmark
    return {
      priceUsd: benchmarkPrice,
      priceSource: "pegged-floor-benchmark",
      updatedAt: new Date().toISOString(),
      isStale: false,
      slot1Trob: Math.round((30 / benchmarkPrice) * 100) / 100,
    };
  },

  /**
   * Auto-fetch on-chain account details & eligibility:
   * - Wallet creation date (>= 1 Oct 2026)
   * - Staked Energy (1,070 TROB or 107 TROB)
   * - Staked Bandwidth (237 TROB or 24 TROB)
   * - Official SR Vote (TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY)
   * Note: Matrix has NO device restriction (multiple wallets per device allowed, 1 matrix ID per wallet).
   */
  async getWalletEligibility(address: string): Promise<WalletEligibility | null> {
    if (!address) return null;
    let url = `/api/eligibility/${address}`;
    if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost")) {
      const rootApi = process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/matrix\/?$/, "").replace(/\/+$/, "");
      url = `${rootApi}/api/dao/eligibility/${address}`;
    }
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as WalletEligibility;
      }
    } catch (err) {
      // Automatic fallback to internal Next.js route handler if external API is down or unconfigured
      if (url !== `/api/eligibility/${address}`) {
        try {
          const fallbackRes = await fetch(`/api/eligibility/${address}`);
          const fallbackJson = await fallbackRes.json();
          if (fallbackJson.success && fallbackJson.data) {
            return fallbackJson.data as WalletEligibility;
          }
        } catch {}
      }
      console.warn("[MatrixApi] Failed to fetch eligibility details:", err);
    }
    return null;
  },
};

export interface WalletEligibility {
  address: string;
  canonicalAddress?: string;
  condition1: {
    passed: boolean;
    creationTimestamp: number | null;
    creationDate: string | null;
    minRequiredDate: string;
    reason?: string;
  };
  condition2: {
    passed: boolean;
    energy: {
      stakedTrob: number;
      requiredTrob: number;
      passed: boolean;
    };
    bandwidth: {
      stakedTrob: number;
      requiredTrob: number;
      passed: boolean;
    };
    srVote: {
      voted: boolean;
      officialSrAddress: string;
      passed: boolean;
    };
    missingRequirements: string[];
  };
  eligibleToDeposit: boolean;
  status: string;
}
