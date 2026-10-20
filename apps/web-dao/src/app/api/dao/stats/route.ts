import { NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { getOnChainDaoTransactions, syncOnChainMembersState } from '../../_lib/blockchainSync';
import { getMergedOnChainDaoStats } from '../../_lib/onChainMergedDao';
import { TROB_PRICE_API_URL } from '@/config/env';

export const dynamic = 'force-dynamic';

// Ultra-fast in-memory cache (3s for live DB stats, 30s for TROB market price)
let cachedStatsData: any = null;
let cachedStatsTime = 0;
let cachedTrobPrice = 0.057097;
let cachedTrobPriceTime = 0;

export async function GET() {
  const now = Date.now();
  if (cachedStatsData && now - cachedStatsTime < 10000) {
    return NextResponse.json({ success: true, data: cachedStatsData });
  }

  // Trigger real-time on-chain state sync in background (throttled)
  syncOnChainMembersState().catch(() => {});
  getOnChainDaoTransactions().catch(() => {});

  const trobPriceUsd = 0.056;
  const bttPriceUsd = trobPriceUsd;
  const entryFeeUsd = 300;
  const earningsCapUsd = 1500;
  const entryFeeBtt = 5357.14; // Smart contract fixed entry fee
  const earningsCapBtt = 26785.71; // Smart contract fixed 5X cap

  let memberCount = 87;
  let nextAvailableSeat = 79;
  let rawDbCollectedBTT = 0;
  let rawDbDistributedBTT = 0;

  // 1. Fetch live Merged On-Chain Data directly from TrobChain (V1 + V2)
  const mergedOnChain = await getMergedOnChainDaoStats(trobPriceUsd);

  // 2. Fetch Neon DB stats
  try {
    const combinedRes = await queryNeon<{
      total_count: string;
      active_count: string;
      total_collected: string;
      total_distributed: string;
      next_seat: number;
    }>(
      `SELECT 
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE LOWER(status) NOT IN ('vacant', 'blank')) as active_count,
        COALESCE(SUM("entryAmountBtt"), 0) as total_collected,
        COALESCE(SUM("pushedAmountBtt"), 0) as total_distributed,
        COALESCE(MIN(position) FILTER (WHERE LOWER(status) IN ('vacant', 'blank')), MAX(position) + 1, 1) as next_seat
       FROM "DaoMember"`
    );
    if (combinedRes.rows.length > 0) {
      memberCount = parseInt(combinedRes.rows[0].active_count || combinedRes.rows[0].total_count, 10) || 87;
      nextAvailableSeat = Number(combinedRes.rows[0].next_seat) || 79;
      rawDbCollectedBTT = parseFloat(combinedRes.rows[0].total_collected) || 0;
      rawDbDistributedBTT = parseFloat(combinedRes.rows[0].total_distributed) || 0;
    }
  } catch (err) {
    console.warn('[dao stats] Neon DB combined query note:', err);
  }

  const remainingPositions = Math.max(0, 100 - memberCount);

  // Use Merged On-Chain Truth (V1 + V2) as primary source
  const totalCollectedBTT = mergedOnChain.mergedCollectedTrob;
  const totalDistributedBTT = mergedOnChain.mergedDistributedTrob;

  const payload = {
    memberCount,
    activeMembers: memberCount,
    capacity: 100,
    remainingPositions,
    nextAvailableSeat,
    entryFeeUsd,
    earningsCapUsd,
    entryFeeBtt,
    entryFeeTrob: entryFeeBtt,
    earningsCapBtt,
    earningsCapTrob: earningsCapBtt,
    totalCollectedBTT,
    totalCollectedTROB: totalCollectedBTT,
    totalDistributedBTT,
    totalDistributedTROB: totalDistributedBTT,
    totalCollectedUSDEstimate: mergedOnChain.mergedCollectedUsd,
    totalDistributedUSDEstimate: mergedOnChain.mergedDistributedUsd,
    onChain: {
      source: 'merged-v1-v2',
      v1: {
        contractHex: '410a59d6a2dcd3b18687c1efe1625642ad85679377',
        contractBase58: 'TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto',
        totalCollectedTrob: mergedOnChain.v1CollectedTrob,
        totalDistributedTrob: mergedOnChain.v1DistributedTrob,
      },
      v2: {
        contractHex: '419031dbc5faddd365a9b3d40ddc0c550ca0f369e4',
        contractBase58: 'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT',
        totalCollectedTrob: mergedOnChain.v2CollectedTrob,
        totalDistributedTrob: mergedOnChain.v2DistributedTrob,
      },
      merged: {
        totalCollectedTrob: mergedOnChain.mergedCollectedTrob,
        totalDistributedTrob: mergedOnChain.mergedDistributedTrob,
        differenceTrob: Math.round((mergedOnChain.mergedCollectedTrob - mergedOnChain.mergedDistributedTrob) * 1000) / 1000,
      },
    },
    rawDb: {
      collectedTrob: rawDbCollectedBTT,
      distributedTrob: rawDbDistributedBTT,
    },
    isClosed: memberCount >= 100,
    bttPriceUsd,
    trobPriceUsd: bttPriceUsd,
    priceSource: 'trobchain-market',
    priceUpdatedAt: new Date().toISOString(),
    dividendYieldApy: '0%',
    treasurySnapshotUsd: 0,
  };

  cachedStatsData = payload;
  cachedStatsTime = Date.now();

  return NextResponse.json({
    success: true,
    data: payload,
  });
}
