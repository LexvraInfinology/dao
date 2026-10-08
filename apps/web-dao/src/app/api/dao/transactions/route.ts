import { NextRequest, NextResponse } from 'next/server';
import { queryNeon } from '../../_lib/neonDb';
import { getOnChainDaoTransactions } from '../../_lib/blockchainSync';
import type { TransactionItem } from '@/hooks/useApi';
import { getActiveDaoAddress } from '@/utils/trobAddress';
import { TROB_PRICE_API_URL } from '@/config/env';

export const dynamic = 'force-dynamic';

const PROTOCOL_ADDRESS = getActiveDaoAddress();

// In-memory cache for ultra-fast transactions responses (3.5s cache)
let cachedTransactionsPayload: any = null;
let cachedTransactionsTime = 0;
let cachedTrobPrice = 0.037757;
let cachedTrobPriceTime = 0;

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

    const isDefaultQuery = !address && page === 1 && limit === 20 && filterType === 'all' && !searchQuery;
    const now = Date.now();

    // Fast-path: return cached response in < 30ms for default transactions list
    if (isDefaultQuery && cachedTransactionsPayload && now - cachedTransactionsTime < 10000) {
      return NextResponse.json({
        success: true,
        data: cachedTransactionsPayload,
      });
    }

    // 1. Fetch live market price with 30s cache
    let trobPriceUsd = cachedTrobPrice;
    if (now - cachedTrobPriceTime > 30000) {
      try {
        const pRes = await fetch(TROB_PRICE_API_URL, {
          signal: AbortSignal.timeout(1000),
        });
        if (pRes.ok) {
          const pj = await pRes.json();
          const p = Number(pj?.data?.priceUsd ?? pj?.priceUsd);
          if (Number.isFinite(p) && p > 0) {
            cachedTrobPrice = p;
            cachedTrobPriceTime = now;
            trobPriceUsd = p;
          }
        }
      } catch {}
    }

    // 2. Fetch direct on-chain smart contract transactions from TrobChain (uses cached on-chain events)
    let onChainItems: TransactionItem[] = [];
    try {
      onChainItems = (await getOnChainDaoTransactions(address, false)) || [];
    } catch (chainErr) {
      console.warn('[Transactions API] On-chain fetch warning:', chainErr);
    }

    // 3. Query Neon DB for confirmed protocol ledger events and stats concurrently
    let dbItems: TransactionItem[] = [];
    let protocolInflowsUsd = 25800;
    let protocolOutflowsUsd = 21930;

    try {
      let whereClauses: string[] = [];
      let params: any[] = [];

      if (address && address.trim()) {
        const { toTrobBase58, toTronHex } = await import('@/utils/trobAddress');
        const clean = address.trim();
        const b58 = toTrobBase58(clean);
        const hex = toTronHex(clean);
        params.push(clean.toLowerCase(), b58.toLowerCase(), hex.toLowerCase());
        whereClauses.push(`LOWER("userAddress") IN ($${params.length - 2}, $${params.length - 1}, $${params.length})`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const [rowsRes, statsRes] = await Promise.all([
        queryNeon<any>(
          `SELECT id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason
           FROM "DaoEvent"
           ${whereSql}
           ORDER BY "timestamp" DESC, "createdAt" DESC
           LIMIT 500`,
          params
        ),
        queryNeon<any>(
          `SELECT 
             COALESCE(SUM("totalDepositsUsd"), 25800) as inflows,
             COALESCE(SUM("pushedAmountBtt") * 0.056, 21930) as raw_outflows
           FROM "DaoMember"
           WHERE LOWER(status) NOT IN ('vacant', 'blank')`
        ).catch(() => ({ rows: [] as any[], rowCount: 0 })),
      ]);

      const seenRetopupRoots = new Set<string>();
      dbItems = rowsRes.rows
        .filter((evt) => {
          const tx = evt.txHash || '';
          if (tx.startsWith('retopup-1') || tx.includes('fake') || tx.includes('simulated')) {
            return false;
          }
          return true;
        })
        .map((evt) => {
          const isPositive = evt.eventType === 'pushed' || evt.eventType === 'fallback_claimed';
          const amtBtt = Math.round(parseFloat(evt.amountBtt || '0') * 100) / 100;
          const amtUsd = Math.round((parseFloat(evt.amountUsdEst || '0') || amtBtt * 0.056) * 100) / 100;

          let categoryBadge: string | undefined;
          const reasonLower = (evt.reason || '').toLowerCase();
          if (evt.eventType === 'retopup' || reasonLower.includes('retopup')) {
            categoryBadge = '5X Retopup';
          } else if (reasonLower.includes('cap reached') || reasonLower.includes('5x cap')) {
            categoryBadge = '5X Cap Event';
          } else if (reasonLower.includes('cashback')) {
            categoryBadge = 'Instant Cashback';
          } else if (reasonLower.includes('retopup loop') || reasonLower.includes('retopup distribution')) {
            categoryBadge = 'Retopup Share';
          }

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
            incomingPosition: evt.incomingPosition,
            categoryBadge,
          };
        });

      if (statsRes.rows[0]?.inflows) {
        const inf = Math.round(parseFloat(statsRes.rows[0].inflows) * 100) / 100;
        if (inf > 0) protocolInflowsUsd = inf;
      }
      // Outflows represent dividends distributed from the collected deposits (85% distributed, 15% protocol reserve)
      const rawOut = parseFloat(statsRes.rows[0]?.raw_outflows || '21930');
      protocolOutflowsUsd = Math.round(Math.min(protocolInflowsUsd * 0.85, rawOut) * 100) / 100;
    } catch (dbErr) {
      console.warn('[Transactions API] DB fetch warning:', dbErr);
    }

    // 4. Merge and deduplicate by transaction hash / ID
    const mergedMap = new Map<string, TransactionItem>();
    
    // Put DB items first (they have verified timestamps and USD values)
    for (const item of dbItems) {
      const key = (item.txHash && item.txHash.length > 10) ? `${item.txHash}-${item.type}` : item.id;
      mergedMap.set(key, item);
    }

    // Overlay on-chain items
    for (const item of onChainItems) {
      const key = (item.txHash && item.txHash.length > 10) ? `${item.txHash}-${item.type}` : item.id;
      if (!mergedMap.has(key)) {
        mergedMap.set(key, item);
      }
    }

    const rawList = Array.from(mergedMap.values());

    // 5. Apply search and type filtering
    let filtered = rawList;

    if (filterType !== 'all') {
      const cleanType = filterType.toLowerCase();
      filtered = filtered.filter((t) => {
        if (cleanType === 'joined' || cleanType === 'council_seat') {
          return t.type === 'joined';
        }
        if (cleanType === 'pushed' || cleanType === 'seat_distribution' || cleanType === 'dividend') {
          return t.type === 'pushed';
        }
        if (cleanType === 'retopup' || cleanType === 'cap' || cleanType === 'capped' || cleanType === '5x') {
          return (
            t.type === 'retopup' ||
            t.type === 'cap_reached' ||
            (t.categoryBadge && t.categoryBadge.toLowerCase().includes('cap')) ||
            (t.categoryBadge && t.categoryBadge.toLowerCase().includes('retopup')) ||
            (t.categoryBadge && t.categoryBadge.toLowerCase().includes('bypassed')) ||
            t.typeLabel.toLowerCase().includes('retopup') ||
            t.typeLabel.toLowerCase().includes('cap') ||
            t.typeLabel.toLowerCase().includes('bypassed')
          );
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
          t.categoryBadge?.toLowerCase().includes(searchQuery) ||
          t.note?.toLowerCase().includes(searchQuery) ||
          String(t.amountTrob || t.amountBtt || '').includes(searchQuery)
        );
      });
    }

    // 6. Sort by timestamp descending
    filtered.sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return tB - tA;
    });

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginatedTransactions = filtered.slice(offset, offset + limit);
    const pages = Math.ceil(total / limit) || 1;

    const resultPayload = {
      transactions: paginatedTransactions,
      total,
      page,
      limit,
      pages,
      protocolInflowsUsd,
      protocolOutflowsUsd,
      trobPriceUsd,
      bttPriceUsd: trobPriceUsd,
      priceSource: 'blockchain-sync',
    };

    if (isDefaultQuery) {
      cachedTransactionsPayload = resultPayload;
      cachedTransactionsTime = Date.now();
    }

    return NextResponse.json({
      success: true,
      data: resultPayload,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch transactions';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
