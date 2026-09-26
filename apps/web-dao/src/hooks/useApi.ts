'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthContext } from '@/context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ─── Generic fetch hook ───────────────────────────────────────────────────────

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useApi<T> — fetches a GET endpoint and returns { data, loading, error, refetch }.
 * Automatically attaches JWT Bearer token from AuthContext when available.
 * Supports optional polling via `pollMs`.
 */
export function useApi<T>(
  path: string | null,
  options?: {
    /** Poll interval in ms. No polling if omitted. */
    pollMs?: number;
    /** Fallback value returned while loading */
    fallback?: T;
    /** Don't fetch until this is true */
    enabled?: boolean;
  }
): UseApiResult<T> {
  const auth = useAuthContext();
  const { fallback = null, pollMs, enabled = true } = options ?? {};

  const [data, setData]       = useState<T | null>(fallback ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const pollRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    if (!path || !enabled) return;

    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`;

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers,
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`API ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      setData(json.data !== undefined ? json.data : json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setError(msg);
      // Keep stale data if we have it
    } finally {
      setLoading(false);
    }
  }, [path, enabled, auth.token]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling
  useEffect(() => {
    if (!pollMs || !path || !enabled) return;
    pollRef.current = setInterval(fetchData, pollMs);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchData, pollMs, path, enabled]);

  return { data, loading, error, refetch: fetchData };
}

// ─── Typed shortcuts ──────────────────────────────────────────────────────────

export interface DaoStatsData {
  memberCount: number;
  activeMembers: number;
  capacity: number;
  remainingPositions: number;
  entryFeeBtt: number;
  earningsCapBtt: number;
  totalCollectedBTT: number;
  totalDistributedBTT: number;
  isClosed: boolean;
  bttPriceUsd: number;
  priceSource: string;
  priceUpdatedAt: string;
  dividendYieldApy?: string;
  treasurySnapshotUsd?: number;
}

export interface DaoEventData {
  id: string;
  eventType: string;
  userAddress: string | null;
  incomingPosition: number | null;
  amountBtt: number;
  amountUsdEstimate: number;
  txHash: string;
  blockNumber: string;
  timestamp: string;
}

export interface TrobPriceData {
  priceUsd: number;
  priceSource: string;
  updatedAt: string;
  isStale: boolean;
  seatEntryUsd: number;
  seatEntryTrob: number;
}

export interface MemberDetailsData {
  isMember: boolean;
  position: number | null;
  nftTokenId: number | null;
  status?: string;
  joinedAt?: string;
  pushedAmountBtt: number;
  pushedAmountUsdEstimate: number;
  earningsCapBtt?: number;
  capProgressPct?: number;
  isCapped?: boolean;
  entryAmountBtt?: number;
  entryAmountUsdEstimate?: number;
  directReferralsCount: number;
  isQualified: boolean;
  userId: number | null;
  txHash?: string;
}

export interface ProfileData extends MemberDetailsData {
  address: string;
  sponsorAddress: string | null;
  registrationTimestamp: string | null;
  highestMatrixSlot: number;
  matrixSlots: Array<{
    slotNumber: number;
    isUnlocked: boolean;
    currentCycle: number;
    filledNodes: number;
    totalEarned: number;
    totalEarnedUsd: number;
  }>;
  nftBadges: Array<{ tokenId: number; rank: number; mintedAt: string }>;
  poolCards: Array<{ tier: number; tierName: string; unlockedAt: string }>;
  totalEarnedBtt: number;
  totalEarnedUsd: number;
  bttPriceUsd: number;
  priceSource: string;
}

export interface LoungeData {
  isMember: boolean;
  address?: string;
  position?: number;
  nftTokenId?: number;
  status?: string;
  soulboundPass?: {
    tokenId: number | null;
    seatNumber: number | null;
    memberId: string;
    tier: string;
    joinedAt: string;
  };
  claimableDividendsBtt: number;
  claimableDividendsUsd: number;
  totalReceivedBtt: number;
  totalReceivedUsd: number;
  earningsCapBtt: number;
  earningsCapUsd: number;
  pushedBtt: number;
  pushedUsd: number;
  capProgressPct: number;
  remainingCapBtt: number;
  remainingCapUsd: number;
  isCapped: boolean;
  incomeChannels?: {
    daoSeats: { label: string; earnedBtt: number; earnedUsd: number };
    matrixSlots: { label: string; earnedBtt: number; earnedUsd: number; highestSlot: number };
    rankPools: { label: string; unlockedPools: string[] };
  };
  bttPriceUsd: number;
  priceSource: string;
}

export interface TransactionItem {
  id: string;
  type: string;
  typeLabel: string;
  amountBtt: number;
  amountUsd: number;
  isPositive: boolean | null;
  from: string;
  to: string;
  txHash: string;
  timestamp: string;
  status: string;
}

export interface TransactionsData {
  transactions: TransactionItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  bttPriceUsd: number;
  priceSource: string;
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

export function useDaoStats(pollMs?: number) {
  return useApi<DaoStatsData>('/api/dao/stats', { pollMs });
}

export function useTrobPrice(pollMs?: number) {
  return useApi<TrobPriceData>('/api/price/trob', { pollMs });
}

export function useDaoEvents(limit = 20, pollMs?: number) {
  return useApi<DaoEventData[]>(`/api/dao/events?limit=${limit}`, { pollMs });
}

export function useDaoMember(address: string | null) {
  return useApi<MemberDetailsData>(
    address ? `/api/dao/member/${address}` : null,
    { enabled: !!address }
  );
}

export function useDaoProfile(address: string | null) {
  return useApi<ProfileData>(
    address ? `/api/dao/profile/${address}` : null,
    { enabled: !!address }
  );
}

export function useLounge(address: string | null) {
  return useApi<LoungeData>(
    address ? `/api/dao/lounge/${address}` : null,
    { enabled: !!address }
  );
}

export function useTransactions(address: string | null, page = 1, limit = 20) {
  return useApi<TransactionsData>(
    address
      ? `/api/dao/transactions?address=${address}&page=${page}&limit=${limit}`
      : `/api/dao/transactions?page=${page}&limit=${limit}`
  );
}

export function useDaoProposals(limit = 20) {
  return useApi<unknown[]>(`/api/dao/proposals?limit=${limit}`);
}

// ─── POST helper ──────────────────────────────────────────────────────────────

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? `Request failed (${res.status})`);
  return (json.data !== undefined ? json.data : json) as T;
}
