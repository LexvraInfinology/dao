import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { getOnChainDaoTransactions } from '../../_lib/blockchainSync';

export const dynamic = 'force-dynamic';

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
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    // 1. Try Express backend if configured
    const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
      `/api/dao/events?limit=${limit}`
    );
    if (backendRes && backendRes.success && Array.isArray(backendRes.data) && backendRes.data.length > 0) {
      return NextResponse.json(backendRes);
    }

    // 2. Fetch direct on-chain smart contract transactions
    const onChainTxList = await getOnChainDaoTransactions();

    // 3. Fetch from Neon Database
    let dbRows: any[] = [];
    try {
      const res = await queryNeon<any>(
        `SELECT id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "amountBtt", "amountUsdEst", "priceSource", reason
         FROM "DaoEvent"
         ORDER BY "timestamp" DESC, "createdAt" DESC
         LIMIT ${limit}`
      );
      dbRows = res.rows;
    } catch {}

    const eventsMap = new Map<string, any>();

    // Add on-chain items
    for (const item of onChainTxList) {
      const isPush = item.type === 'pushed';
      eventsMap.set(item.id, {
        id: item.id,
        eventType: item.type,
        userAddress: isPush ? item.to : item.from,
        incomingPosition: null,
        recipientCount: null,
        txHash: item.txHash,
        blockNumber: 1,
        timestamp: toIsoUtc(item.timestamp),
        amountBtt: item.amountTrob || item.amountBtt,
        amountTrob: item.amountTrob || item.amountBtt,
        amountUsdEst: item.amountUsd,
        priceSource: 'blockchain-onchain',
        reason: item.typeLabel,
      });
    }

    // Add DB items
    for (const evt of dbRows) {
      if (!eventsMap.has(evt.id) && !eventsMap.has(evt.txHash)) {
        eventsMap.set(evt.id, {
          ...evt,
          timestamp: toIsoUtc(evt.timestamp || evt.createdAt),
          amountBtt: parseFloat(evt.amountBtt || '0'),
          amountTrob: parseFloat(evt.amountBtt || '0'),
          amountUsdEst: parseFloat(evt.amountUsdEst || '0'),
          reason:
            evt.reason ||
            (evt.eventType === 'joined'
              ? `Council Seat Activated${evt.incomingPosition ? ` (#${evt.incomingPosition})` : ''}`
              : evt.eventType === 'pushed'
              ? `Instant 300/N Cashback${evt.incomingPosition ? ` (Seat #${evt.incomingPosition})` : ''}`
              : evt.eventType === 'retopup'
              ? '5X Cap Retopup'
              : evt.eventType),
        });
      }
    }

    const merged = Array.from(eventsMap.values());
    merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      data: merged.slice(0, limit),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch dao events';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
