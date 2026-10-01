import { NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';

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

  let memberCount = 0;
  let totalCollectedBTT = 0;
  let totalDistributedBTT = 0;

  try {
    const countRes = await queryNeon<{ count: string }>(
      `SELECT COUNT(*) as count FROM "DaoMember" WHERE LOWER(status) = 'active'`
    );
    if (countRes.rows.length > 0) {
      memberCount = parseInt(countRes.rows[0].count, 10);
    }

    const sumRes = await queryNeon<{ total_collected: string; total_distributed: string }>(
      `SELECT COALESCE(SUM("entryAmountBtt"), 0) as total_collected,
              COALESCE(SUM("pushedAmountBtt"), 0) as total_distributed
       FROM "DaoMember"`
    );
    if (sumRes.rows.length > 0) {
      totalCollectedBTT = parseFloat(sumRes.rows[0].total_collected) || 0;
      totalDistributedBTT = parseFloat(sumRes.rows[0].total_distributed) || 0;
    }
  } catch (err) {
    console.warn('[dao stats] Neon DB query fallback failed:', err);
  }

  const remainingPositions = Math.max(0, 100 - memberCount);

  return NextResponse.json({
    success: true,
    data: {
      memberCount,
      activeMembers: memberCount,
      capacity: 100,
      remainingPositions,
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
      isClosed: memberCount >= 100,
      bttPriceUsd,
      trobPriceUsd: bttPriceUsd,
      priceSource: 'trobchain-market',
      priceUpdatedAt: new Date().toISOString(),
      dividendYieldApy: '0%',
      treasurySnapshotUsd: 0,
    },
  });
}
