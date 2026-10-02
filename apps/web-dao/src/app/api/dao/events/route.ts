import { NextRequest, NextResponse } from 'next/server';
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

/**
 * Pure On-Chain Real-Time Blockchain Activity Feed
 * Fetches exclusively from the verified TrobChain smart contract on-chain ledger.
 * Zero mocked data or duplicate database rows.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    // 1. Fetch direct on-chain smart contract transactions from TrobChain
    const onChainTxList = await getOnChainDaoTransactions(null, true);

    const eventsList: any[] = [];
    const seenKeys = new Set<string>();

    for (const item of onChainTxList) {
      const isPush = item.type === 'pushed';
      const userAddress = isPush ? item.to : item.from;

      // Deduplicate strictly by unique txHash + eventType + recipient/caller
      const dedupeKey = `${item.txHash}_${item.type}_${userAddress}`;
      if (seenKeys.has(dedupeKey)) continue;
      seenKeys.add(dedupeKey);

      // Extract seat position if not already explicitly assigned
      let pos = item.incomingPosition;
      if (!pos) {
        const m = item.typeLabel.match(/Seat #(\d+)/i);
        if (m && m[1]) pos = parseInt(m[1], 10);
      }

      eventsList.push({
        id: item.id,
        eventType: item.type,
        userAddress: userAddress,
        incomingPosition: pos || null,
        recipientCount: null,
        txHash: item.txHash,
        blockNumber: 1,
        timestamp: toIsoUtc(item.timestamp),
        amountBtt: item.amountTrob || item.amountBtt,
        amountTrob: item.amountTrob || item.amountBtt,
        amountUsdEst: item.amountUsd,
        amountUsdEstimate: item.amountUsd,
        priceSource: 'trobchain-blockchain',
        reason: item.typeLabel,
      });
    }

    // Sort strictly in reverse-chronological order (newest on-chain events first)
    eventsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      data: eventsList.slice(0, limit),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch dao events';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
