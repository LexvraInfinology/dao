import { NextRequest, NextResponse } from 'next/server';
import { queryNeon } from '../../_lib/neonDb';
import { getOnChainDaoTransactions } from '../../_lib/blockchainSync';
import { IS_MAINNET } from '@/config/env';

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
 * Fast Real-Time Blockchain & Protocol Activity Feed
 * Queries indexed events from Neon DB first on Mainnet,
 * or queries strictly on-chain testnet transactions when in Testnet mode.
 */
let cachedEventsMap = new Map<number, { data: any[]; time: number }>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const now = Date.now();
    const cached = cachedEventsMap.get(limit);
    if (cached && now - cached.time < 5000) {
      return NextResponse.json({ success: true, data: cached.data });
    }

    const eventsList: any[] = [];
    const seenKeys = new Set<string>();

    // 1. Query high-performance Neon DB confirmed protocol events (Mainnet only)
    if (IS_MAINNET) {
      try {
        const dbRes = await queryNeon<any>(
          `SELECT id, "eventType", "userAddress", "incomingPosition", "recipientCount",
                  "txHash", "blockNumber", "timestamp", "amountBtt", "amountUsdEst",
                  "priceSource", reason
           FROM "DaoEvent"
           ORDER BY "timestamp" DESC
           LIMIT $1`,
          [Math.max(limit * 20, 300)]
        );

      for (const row of dbRes.rows) {
        const txHash = row.txHash || '';
        // Skip synthetic / mock test events
        if (txHash.startsWith('retopup-1') || txHash.includes('fake') || txHash.includes('simulated')) {
          continue;
        }

        // Aggregate 85 member dividend push loops into a single collective 5X Retopup activity
        const isRetopupPush = txHash.includes('-retopup-push-') || (row.reason && row.reason.includes('Retopup Distribution'));
        if (isRetopupPush) {
          const rootTx = txHash.split('-retopup-')[0];
          const groupKey = `retopup_${rootTx}_${row.incomingPosition || '1'}`;
          if (seenKeys.has(groupKey)) continue;
          seenKeys.add(groupKey);

          eventsList.push({
            id: `retopup-${rootTx}-${row.incomingPosition || '1'}`,
            eventType: 'retopup',
            userAddress: row.userAddress,
            incomingPosition: row.incomingPosition || 1,
            recipientCount: 85,
            txHash: rootTx,
            blockNumber: Number(row.blockNumber || 1),
            timestamp: toIsoUtc(row.timestamp),
            amountBtt: 5357.14,
            amountTrob: 5357.14,
            amountUsdEst: 300,
            amountUsdEstimate: 300,
            priceSource: 'blockchain-onchain',
            reason: `5X Cap Retopup (Seat #${row.incomingPosition || '1'})`,
          });
          continue;
        }

        // Aggregate multi-recipient dividend push batches (e.g. 75 push rows from Seat #76 claim)
        const isDividendPush =
          (row.eventType === 'pushed' || (row.reason && row.reason.toLowerCase().includes('dividend push'))) &&
          !(row.reason && row.reason.toLowerCase().includes('instant cashback'));

        if (isDividendPush && row.incomingPosition) {
          const rootTx = txHash.split('-pushed-')[0] || txHash;
          const groupKey = `dividend_push_batch_${rootTx}_${row.incomingPosition}`;
          if (seenKeys.has(groupKey)) continue;
          seenKeys.add(groupKey);

          const singleAmountTrob = parseFloat(row.amountBtt || '0');
          const singleAmountUsd = parseFloat(row.amountUsdEst || '0');
          const recipients = row.recipientCount || (row.incomingPosition > 1 ? row.incomingPosition - 1 : 1);

          eventsList.push({
            id: `dividend-batch-${rootTx.slice(0, 10)}-${row.incomingPosition}`,
            eventType: 'seat_distribution',
            userAddress: row.userAddress,
            incomingPosition: row.incomingPosition,
            recipientCount: recipients,
            txHash: rootTx,
            blockNumber: Number(row.blockNumber || 1),
            timestamp: toIsoUtc(row.timestamp),
            amountBtt: singleAmountTrob,
            amountTrob: singleAmountTrob,
            amountUsdEst: singleAmountUsd,
            amountUsdEstimate: singleAmountUsd,
            priceSource: row.priceSource || 'neon-db',
            reason: `Instant 300/N Dividend Distribution (Seat #${row.incomingPosition})`,
          });
          continue;
        }

        const dedupeKey = `${txHash}_${row.eventType}_${row.userAddress}`;
        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);

        const amountTrob = parseFloat(row.amountBtt || '0');
        const amountUsd = parseFloat(row.amountUsdEst || '0');

        eventsList.push({
          id: row.id,
          eventType: row.eventType,
          userAddress: row.userAddress,
          incomingPosition: row.incomingPosition,
          recipientCount: row.recipientCount,
          txHash: row.txHash,
          blockNumber: Number(row.blockNumber || 1),
          timestamp: toIsoUtc(row.timestamp),
          amountBtt: amountTrob,
          amountTrob: amountTrob,
          amountUsdEst: amountUsd,
          amountUsdEstimate: amountUsd,
          priceSource: row.priceSource || 'neon-db',
          reason: row.reason || `${row.eventType} event`,
        });
      }
    } catch (dbErr) {
      console.warn('[Events API] Neon DB query note:', dbErr);
    }
  }

    // 2. Safely merge recent on-chain transactions without blocking (fast cache)
    try {
      const onChainTxList = await Promise.race([
        getOnChainDaoTransactions(null, false),
        new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 2000)),
      ]);

      for (const item of onChainTxList) {
        const isPush = item.type === 'pushed';
        const userAddress = isPush ? item.to : item.from;

        let pos = item.incomingPosition;
        if (!pos) {
          const m = item.typeLabel.match(/Seat #(\d+)/i);
          if (m && m[1]) pos = parseInt(m[1], 10);
        }

        // Aggregate multi-recipient on-chain dividend pushes
        const isDividendPush =
          (item.type === 'pushed' || (item.typeLabel && item.typeLabel.toLowerCase().includes('dividend push'))) &&
          !(item.typeLabel && item.typeLabel.toLowerCase().includes('instant cashback'));

        if (isDividendPush && pos) {
          const rootTx = item.txHash.split('-pushed-')[0] || item.txHash;
          const groupKey = `dividend_push_batch_${rootTx}_${pos}`;
          if (seenKeys.has(groupKey)) continue;
          seenKeys.add(groupKey);

          eventsList.push({
            id: `chain-dividend-${rootTx.slice(0, 10)}-${pos}`,
            eventType: 'seat_distribution',
            userAddress: userAddress,
            incomingPosition: pos,
            recipientCount: pos > 1 ? pos - 1 : 1,
            txHash: item.txHash,
            blockNumber: 1,
            timestamp: toIsoUtc(item.timestamp),
            amountBtt: item.amountTrob || item.amountBtt,
            amountTrob: item.amountTrob || item.amountBtt,
            amountUsdEst: item.amountUsd,
            amountUsdEstimate: item.amountUsd,
            priceSource: 'trobchain-blockchain',
            reason: `Instant 300/N Dividend Distribution (Seat #${pos})`,
          });
          continue;
        }

        const dedupeKey = `${item.txHash}_${item.type}_${userAddress}`;
        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);

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
    } catch (chainErr) {
      console.warn('[Events API] On-chain merge note:', chainErr);
    }

    // Sort strictly in reverse-chronological order (newest first)
    eventsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const finalData = eventsList.slice(0, limit);
    cachedEventsMap.set(limit, { data: finalData, time: Date.now() });

    return NextResponse.json({
      success: true,
      data: finalData,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch dao events';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
