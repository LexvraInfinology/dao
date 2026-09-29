import { NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';

export async function GET() {
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>('/api/dao/stats');
  if (backendRes && backendRes.success && backendRes.data) {
    return NextResponse.json(backendRes);
  }

  // Default empty state if backend is unreachable
  const fallbackStats = {
    memberCount: 0,
    activeMembers: 0,
    capacity: 100,
    remainingPositions: 100,
    entryFeeBtt: 300,
    earningsCapBtt: 1500,
    totalCollectedBTT: 0,
    totalDistributedBTT: 0,
    isClosed: false,
    bttPriceUsd: 0.05527,
    priceSource: 'trobchain-oracle',
    priceUpdatedAt: new Date().toISOString(),
    dividendYieldApy: '0%',
    treasurySnapshotUsd: 0,
  };

  return NextResponse.json({
    success: true,
    data: fallbackStats,
  });
}
