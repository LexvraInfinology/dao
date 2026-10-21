// ==============================================================================
// EQUORA MATRIX PROTOCOL — FRONTEND API CLIENT (apps/web-matrix/lib/api.ts)
// ==============================================================================

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/matrix";
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "").endsWith("/api/matrix")
  ? rawBaseUrl.replace(/\/+$/, "")
  : `${rawBaseUrl.replace(/\/+$/, "")}/api/matrix`;

export const DEFAULT_USER_ADDRESS =
  process.env.NEXT_PUBLIC_DEFAULT_WALLET || "0x71c85d7b561e723908f9c162590214b7e8d24982";

export function getStoredUserAddress(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("equora_user_address");
    if (stored) return stored.toLowerCase();
  }
  return DEFAULT_USER_ADDRESS.toLowerCase();
}

export function setStoredUserAddress(address: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("equora_user_address", address.toLowerCase());
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
  directReferralsCount: number;
  teamCount: number;
  rankTier: number;
  rankName: string;
  totalEarnings: number;
  directEarnings: number;
  matrixEarnings: number;
  poolEarnings: number;
  availableBalance: number;
  withdrawnTotal: number;
  recyclesCount: number;
  highestUnlockedSlot: number;
  joinedAt: string;
}

export interface MatrixDashboardOverview {
  currentSlot: number;
  totalEarnedTrob: number;
  totalEarnedUsd: number;
  availableWithdrawTrob: number;
  availableWithdrawUsd: number;
  recyclesCount: number;
  trobPriceUsd: number;
  activeSlotProgress: {
    slotNumber: number;
    filledNodes: number;
    totalNodes: number;
    cycle: number;
    upgradeReserve: number;
    level1Filled: number;
    level2Filled: number;
    level3Filled: number;
  };
  nextPosition: {
    positionNumber: number;
    title: string;
    description: string;
    rewardType: string;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    title: string;
    description: string;
    slotNumber?: number;
    amount?: number;
    timestamp: string;
    status: string;
  }>;
}

export interface MatrixSlotSummary {
  slotNumber: number;
  cost: number;
  isUnlocked: boolean;
  currentCycle: number;
  recyclesCount: number;
  filledNodes: number;
  upgradeReserve: number;
  totalEarned: number;
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
  isSpillover?: boolean;
}

export interface MatrixSlotDetails {
  slotNumber: number;
  cost: number;
  isUnlocked: boolean;
  currentCycle: number;
  recyclesCount: number;
  filledNodes: number;
  upgradeReserve: number;
  totalEarned: number;
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
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      const friendlyMessage = parseApiErrorResponse(errText, res.status);
      console.warn(`[Matrix API] Error (${res.status}) on ${endpoint}:`, errText);
      throw new MatrixApiError(res.status, errText, friendlyMessage);
    }

    const data = await res.json();
    return data.data !== undefined ? data.data : data;
  } catch (error) {
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
    txHash?: string
  ): Promise<{ success: boolean; slot: MatrixSlotSummary; message: string }> {
    return apiFetch<{ success: boolean; slot: MatrixSlotSummary; message: string }>(`/slots/buy`, {
      method: "POST",
      body: JSON.stringify({ userAddress: userAddress.toLowerCase(), slotNumber, txHash }),
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
    amount: number
  ): Promise<{ success: boolean; amountWithdrawn: number; txHash: string; remainingBalance: number }> {
    return apiFetch(`/withdraw`, {
      method: "POST",
      body: JSON.stringify({ userAddress: userAddress.toLowerCase(), amount }),
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
};
