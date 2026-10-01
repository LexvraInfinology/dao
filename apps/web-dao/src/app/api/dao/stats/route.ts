import { NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>('/api/dao/stats');
  if (backendRes && backendRes.success && backendRes.data) {
    return NextResponse.json(backendRes);
  }

  const bttPriceUsd = 0.056;
  const entryFeeUsd = 300;
  const earningsCapUsd = 1500;
  const entryFeeBtt = Math.ceil((entryFeeUsd / bttPriceUsd) * 100) / 100;
  const earningsCapBtt = Math.ceil((earningsCapUsd / bttPriceUsd) * 100) / 100;

  // Default state if backend is unreachable
  const fallbackStats = {
    memberCount: 0,
    activeMembers: 0,
    capacity: 100,
    remainingPositions: 100,
    entryFeeUsd,
    earningsCapUsd,
    entryFeeBtt,
    entryFeeTrob: entryFeeBtt,
    earningsCapBtt,
    earningsCapTrob: earningsCapBtt,
    totalCollectedBTT: 0,
    totalCollectedTROB: 0,
    totalDistributedBTT: 0,
    totalDistributedTROB: 0,
    isClosed: false,
    bttPriceUsd,
    trobPriceUsd: bttPriceUsd,
    priceSource: 'trobchain-market',
    priceUpdatedAt: new Date().toISOString(),
    dividendYieldApy: '0%',
    treasurySnapshotUsd: 0,
  };

  return NextResponse.json({
    success: true,
    data: fallbackStats,
  });
}
