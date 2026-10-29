import { NextRequest, NextResponse } from 'next/server';
import { queryNeon } from '../../_lib/neonDb';

export const dynamic = 'force-dynamic';

// In-memory / DB state for the Root Leader waterfall
let waterfallState = {
  currentOfferSeat: 1, // Starts at Seat #1, waterfalls down to #10
  claimedBy: null as string | null,
  claimedSeat: null as number | null,
  passedSeats: [] as number[],
  isClaimed: false,
};

import { IS_MAINNET } from '@/config/env';

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch active DAO member count dynamically from on-chain smart contract
    let activeDaoCount = 10;
    try {
      const { getMergedOnChainDaoStats } = await import('../../_lib/onChainMergedDao');
      const stats = await getMergedOnChainDaoStats();
      activeDaoCount = Math.max(1, stats.activeMemberCount);
    } catch {
      if (IS_MAINNET) {
        const countRes = await queryNeon<any>(
          `SELECT count(*)::int as count FROM "DaoMember" WHERE LOWER(status) NOT IN ('vacant', 'blank')`
        );
        activeDaoCount = countRes.rows[0]?.count || 87;
      }
    }

    // 2. Fetch live TROB price (dynamically query market API with fallback)
    let bttPriceUsd = 0.042206;
    try {
      const { TROB_PRICE_API_URL } = await import('@/config/env');
      const pRes = await fetch(TROB_PRICE_API_URL, { cache: 'no-store' });
      if (pRes.ok) {
        const pj = await pRes.json();
        const p = Number(pj?.data?.priceUsd ?? pj?.priceUsd);
        if (Number.isFinite(p) && p > 0) bttPriceUsd = p;
      }
    } catch {}

    const slot1EntryUsd = 30;
    const slot1Trob = Math.round((slot1EntryUsd / bttPriceUsd) * 100) / 100;

    // 3. Calculate 35% Pool distribution to current available seats
    // Rule: "ensure that if total 100 seats are not filled then it will give the only available seat members there money in there wallet"
    const daoPoolPct = 35;
    const perSeatSharePct = activeDaoCount > 0 ? parseFloat((daoPoolPct / activeDaoCount).toFixed(4)) : 0;
    const instantDaoPushUsdPerMatrixEntry = activeDaoCount > 0 ? parseFloat(((slot1EntryUsd * 0.35) / activeDaoCount).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      data: {
        isOpen: false,
        reservationsOpen: false,
        purchasingPaused: true,
        launchDay: 22,
        slot1EntryUsd,
        slot1Trob,
        bttPriceUsd,
        rootLeaderWaterfall: {
          currentOfferSeat: waterfallState.currentOfferSeat,
          isClaimed: waterfallState.isClaimed,
          claimedBy: waterfallState.claimedBy,
          claimedSeat: waterfallState.claimedSeat,
          passedSeats: waterfallState.passedSeats,
          maxWaterfallSeat: 10,
        },
        protocolPools: {
          daoTreasuryPct: 35,
          monthlyRoyaltyPct: 40,
          monthlySalaryPct: 40,
          magicBlindBoxPct: 10,
          luckyDropsPct: 15,
          activeDaoMemberCount: activeDaoCount,
          isFull100: activeDaoCount >= 100,
          perSeatSharePct,
          instantDaoPushUsdPerMatrixEntry,
          distributionModel: activeDaoCount < 100
            ? `Proportional split: 100% of the 35% DAO royalty goes directly to the ${activeDaoCount} currently claimed seats (${perSeatSharePct}% per seat) until 100 seats fill.`
            : 'Standard model: 35% global volume distributed equally across all 100 DAO Council seats (0.35% per seat).',
        },
        devicePolicy: {
          daoSeats: 'Strictly 1 Seat Per Physical Device (Anti-Sybil protected).',
          matrixSlots: 'Multiple Matrix IDs allowed per physical device, but each slot requires a distinct Web3 wallet address.',
          daoWalletAllowedOnMatrix: true,
        },
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch matrix status';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(_req: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Matrix seat reservations and purchasing are paused until Day 22 global launch.',
  }, { status: 400 });
}
