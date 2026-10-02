import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { getOnChainDaoTransactions } from '../../_lib/blockchainSync';
import type { TransactionItem } from '@/hooks/useApi';
import { getActiveDaoAddress } from '@/utils/trobAddress';

export const dynamic = 'force-dynamic';

const PROTOCOL_ADDRESS = getActiveDaoAddress();

function toIsoUtc(ts: any): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  const s = String(ts).trim();
  if (s.endsWith('Z') || s.includes('+') || (s.lastIndexOf('-') > 10)) {
    return new Date(s).toISOString();
  }
  return new Date(s.replace(' ', 'T') + 'Z').toISOString();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const filterType = searchParams.get('type') || 'all';
    const searchQuery = (searchParams.get('search') || '').trim().toLowerCase();

    // 1. Try Express backend if configured
    const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
      `/api/dao/transactions?${searchParams.toString()}`
    );
    if (backendRes && backendRes.success && backendRes.data?.transactions?.length > 0) {
      return NextResponse.json(backendRes);
    }

    // 2. Fetch live market price for accurate USD calculations
    let trobPriceUsd = 0.0565;
    try {
      const pRes = await fetch(process.env.TROB_PRICE_API_URL || 'https://backend.trobchain.com/v1/market/price', {
        signal: AbortSignal.timeout(1200),
      });
      if (pRes.ok) {
        const pj = await pRes.json();
        const p = Number(pj?.data?.priceUsd ?? pj?.priceUsd);
        if (Number.isFinite(p) && p > 0) trobPriceUsd = p;
      }
    } catch {}

    // 3. Fetch direct on-chain smart contract transactions from EquoraDAO.sol
    const onChainItems = await getOnChainDaoTransactions(address);

    // 4. Fetch transactions from Neon Database (DaoEvent)
    let dbItems: TransactionItem[] = [];
    try {
      let whereClauses: string[] = [];
      let params: any[] = [];

      if (address && address.trim()) {
        params.push(address.trim().toLowerCase());
        whereClauses.push(`LOWER("userAddress") = $${params.length}`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      const rowsRes = await queryNeon<any>(
        `SELECT id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "amountBtt", "amountUsdEst", "priceSource", reason
         FROM "DaoEvent"
         ${whereSql}
         ORDER BY "timestamp" DESC, "createdAt" DESC
         LIMIT 200`,
        params
      );

      dbItems = rowsRes.rows.map((evt) => {
        const isPositive = evt.eventType === 'pushed' || evt.eventType === 'fallback_claimed';
        const amtBtt = parseFloat(evt.amountBtt || '0');
        const amtUsd = parseFloat(evt.amountUsdEst || '0') || Math.round(amtBtt * trobPriceUsd * 100) / 100;

        return {
          id: evt.id,
          type: evt.eventType as any,
          typeLabel:
            evt.reason ||
            (evt.eventType === 'joined'
              ? `Council Seat #${evt.incomingPosition || ''} Activated`
              : evt.eventType === 'pushed'
              ? `Instant Cashback (Seat #${evt.incomingPosition || ''})`
              : evt.eventType === 'retopup'
              ? '5X Cap Retopup'
              : 'Dividend Reward Claimed'),
          amountBtt: amtBtt,
          amountTrob: amtBtt,
          amountUsd: amtUsd,
          isPositive,
          from: isPositive ? PROTOCOL_ADDRESS : evt.userAddress,
          to: isPositive ? evt.userAddress : PROTOCOL_ADDRESS,
          txHash: evt.txHash || '',
          timestamp: toIsoUtc(evt.timestamp || evt.createdAt),
          status: 'Confirmed',
        };
      });
    } catch (dbErr) {
      console.warn('[Transactions API] DB fetch warning:', dbErr);
    }

    // 5. Merge and deduplicate by (txHash + type + recipient/from)
    const seenKeys = new Set<string>();
    const mergedList: TransactionItem[] = [];

    // Prioritize direct on-chain verified transactions from EquoraDAO.sol
    for (const item of onChainItems) {
      const key = `${item.txHash?.toLowerCase()}-${item.type}-${item.to?.toLowerCase()}-${item.from?.toLowerCase()}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        mergedList.push(item);
      }
    }

    for (const item of dbItems) {
      const cleanTx = (item.txHash || '').split('-')[0].toLowerCase();
      const key = `${cleanTx}-${item.type}-${item.to?.toLowerCase()}-${item.from?.toLowerCase()}`;
      if (!seenKeys.has(key) && !seenKeys.has(item.id)) {
        seenKeys.add(key);
        mergedList.push(item);
      }
    }

    // 6. Apply search and type filtering
    let filtered = mergedList;

    if (filterType !== 'all') {
      const cleanType = filterType.toLowerCase();
      filtered = filtered.filter((t) => {
        if (cleanType === 'joined' || cleanType === 'council_seat') {
          return t.type === 'joined';
        }
        if (cleanType === 'pushed' || cleanType === 'seat_distribution' || cleanType === 'dividend') {
          return t.type === 'pushed';
        }
        if (cleanType === 'retopup') {
          return t.type === 'retopup';
        }
        return t.type.toLowerCase() === cleanType;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((t) => {
        return (
          t.txHash?.toLowerCase().includes(searchQuery) ||
          t.from?.toLowerCase().includes(searchQuery) ||
          t.to?.toLowerCase().includes(searchQuery) ||
          t.typeLabel?.toLowerCase().includes(searchQuery) ||
          String(t.amountTrob || t.amountBtt || '').includes(searchQuery)
        );
      });
    }

    // 7. Sort by timestamp descending
    filtered.sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return tB - tA;
    });

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginatedTransactions = filtered.slice(offset, offset + limit);
    const pages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        total,
        page,
        limit,
        pages,
        trobPriceUsd,
        bttPriceUsd: trobPriceUsd,
        priceSource: 'blockchain-sync',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch transactions';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
