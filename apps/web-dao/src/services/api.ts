/**
 * Centralized API Client for EQUORA Genesis DAO
 * Connects apps/web-dao to the backend API running on localhost:4000
 *
 * For React components, prefer the hooks in src/hooks/useApi.ts instead.
 * This module is used for server-side fetches or one-off calls outside React.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ─── Response types ───────────────────────────────────────────────────────────

export interface DaoStats {
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
  isClosed: boolean;
  bttPriceUsd: number;
  priceSource: string;
  priceUpdatedAt: string;
}

export interface TrobPrice {
  priceUsd: number;
  priceSource: string;
  updatedAt: string;
  isStale: boolean;
  seatEntryUsd: number;
  seatEntryTrob: number;
}

export interface DaoMember {
  id?: string;
  address: string;
  position: number;
  nftTokenId: number | null;
  entryAmountBtt: string | number;
  entryAmountUsdAtJoin?: string | number | null;
  joinedAt: string;
  status: string;
  txHash: string;
  blockNumber: string | number;
  isMember: boolean;
  pushedAmountBtt: number | string;
  pushedAmountUsdEstimate: number;
  earningsCapBtt: number;
  capProgressPct: number;
}

export interface DaoEvent {
  id: string;
  eventType: string;
  userAddress: string | null;
  incomingPosition: number | null;
  recipientCount: number | null;
  amountBtt: string | number;
  amountUsdEst: string | number | null;
  txHash: string;
  blockNumber: string | number;
  timestamp: string;
}

export interface ProtocolStats {
  totalMembers: number;
  daoMembersCount: number;
  daoCompleted: boolean;
  totalVolumeBTT: number;
  totalPlacements: number;
  totalRecycles: number;
}

export interface DaoProposal {
  id: string;
  title: string;
  category: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: string;
  endsIn: string;
  proposer: string;
  description: string;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchJson<T>(
  path: string,
  fallback: T,
  token?: string | null
): Promise<T> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      cache: 'no-store',
      headers,
    });
    if (!res.ok) {
      console.warn(`API ${path} → ${res.status}`);
      return fallback;
    }
    const data = await res.json();
    return (data.data !== undefined ? data.data : data) as T;
  } catch (err) {
    console.warn(`API network error for ${path}:`, (err as Error).message);
    return fallback;
  }
}

// ─── ApiService ───────────────────────────────────────────────────────────────

class ApiService {
  /** GET /api/dao/stats */
  async getDaoStats(): Promise<DaoStats> {
    return fetchJson<DaoStats>('/api/dao/stats', {
      memberCount: 0,
      activeMembers: 0,
      blankMembers: 0,
      cappedMembers: 0,
      capacity: 100,
      remainingPositions: 100,
      entryFeeBtt: 300,
      earningsCapBtt: 900,
      totalCollectedBTT: 0,
      totalCollectedUSDEstimate: 0,
      totalDistributedBTT: 0,
      totalDistributedUSDEstimate: 0,
      isClosed: false,
      bttPriceUsd: 1.0,
      priceSource: 'offchain-estimate',
      priceUpdatedAt: new Date().toISOString(),
    });
  }

  /** GET /api/price/trob */
  async getTrobPrice(): Promise<TrobPrice> {
    return fetchJson<TrobPrice>('/api/price/trob', {
      priceUsd: 1.0,
      priceSource: 'offchain-estimate',
      updatedAt: new Date().toISOString(),
      isStale: false,
      seatEntryUsd: 300,
      seatEntryTrob: 300,
    });
  }

  /** GET /api/dao/members */
  async getDaoMembers(
    page = 1,
    limit = 100
  ): Promise<{ members: DaoMember[]; total: number }> {
    return fetchJson('/api/dao/members?page=' + page + '&limit=' + limit, {
      members: [],
      total: 0,
    });
  }

  /** GET /api/dao/events */
  async getDaoEvents(limit = 20): Promise<DaoEvent[]> {
    return fetchJson<DaoEvent[]>(`/api/dao/events?limit=${limit}`, []);
  }

  /** GET /api/dao/member/:address */
  async getMemberByAddress(address: string): Promise<DaoMember | null> {
    return fetchJson<DaoMember | null>(`/api/dao/member/${address}`, null);
  }

  /** GET /api/stats/overview */
  async getGlobalStats(): Promise<ProtocolStats> {
    return fetchJson<ProtocolStats>('/api/stats/overview', {
      totalMembers: 0,
      daoMembersCount: 0,
      daoCompleted: false,
      totalVolumeBTT: 0,
      totalPlacements: 0,
      totalRecycles: 0,
    });
  }

  /** GET /api/dao/proposals */
  async getDaoProposals(limit = 20): Promise<DaoProposal[]> {
    return fetchJson<DaoProposal[]>(`/api/dao/proposals?limit=${limit}`, []);
  }

  /** POST /api/auth/nonce */
  async getNonce(address: string): Promise<string> {
    const result = await fetchJson<{ nonce: string }>(
      '/api/auth/nonce',
      { nonce: '' }
    );
    return result.nonce;
  }
}

export const api = new ApiService();
