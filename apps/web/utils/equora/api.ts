/**
 * Centralized API client for Equora.Fi
 * Connects frontend to the Express backend (apps/api) with graceful offline fallbacks.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface DAOStatsResponse {
  memberCount: number;
  activeMembers: number;
  blankMembers: number;
  cappedMembers: number;
  capacity: number;
  remainingPositions: number;
  entryFeeBtt: number;
  earningsCapBtt: number;
  totalCollectedBTT: number;
  totalCollectedUSDEstimate: number;
  totalDistributedBTT: number;
  totalDistributedUSDEstimate: number;
  totalPoolReceivedBTT: number;
  totalPoolReceivedUSDEstimate: number;
  isClosed: boolean;
  distributionMode: string;
  bttPriceUsd: number;
  priceSource: string;
  priceUpdatedAt: string;
}

export interface DAOMemberItem {
  position: number;
  address: string;
  userId: number | null;
  nftTokenId: number;
  entryAmountBtt: number;
  entryAmountUsdEstimate: number;
  pushedAmountBtt: number;
  pushedAmountUsdEstimate: number;
  status: string;
  joinedAt: string;
  txHash: string;
  hasFallbackClaims: boolean;
}

export interface DAOEventItem {
  id: string;
  eventType: string;
  userAddress: string;
  incomingPosition?: number;
  recipientCount?: number;
  amountBtt: number;
  amountUsdEstimate: number;
  priceSource?: string;
  reason?: string;
  txHash: string;
  blockNumber?: string;
  timestamp: string;
}

export interface MemberDetailResponse {
  isMember: boolean;
  position: number | null;
  userId: number | null;
  directReferralsCount: number;
  isQualified: boolean;
  nftTokenId: number | null;
  joinedAt?: string;
  entryAmountBtt: number;
  entryAmountUsdEstimate: number;
  pushedAmountBtt: number;
  pushedAmountUsdEstimate: number;
  earningsCapBtt: number;
  capProgressPct: number;
  isCapped: boolean;
  priceSource?: string;
  status?: string;
  txHash?: string;
  fallbackClaims?: any[];
}

export async function fetchDAOStats(): Promise<DAOStatsResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dao/stats`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.warn("⚠️ [API] Failed to fetch DAO stats:", err);
    return null;
  }
}

export async function fetchDAOMembers(page = 1, limit = 100): Promise<{ total: number; members: DAOMemberItem[] } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dao/members?page=${page}&limit=${limit}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.warn("⚠️ [API] Failed to fetch DAO members:", err);
    return null;
  }
}

export async function fetchDAOEvents(limit = 20): Promise<DAOEventItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dao/events?limit=${limit}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchMemberByAddress(address: string): Promise<MemberDetailResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dao/${address}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.warn(`⚠️ [API] Failed to fetch member ${address}:`, err);
    return null;
  }
}
