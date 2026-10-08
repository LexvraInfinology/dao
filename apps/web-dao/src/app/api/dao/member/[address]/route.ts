import { NextRequest, NextResponse } from 'next/server';
import { getAndSyncMemberState } from '../../../_lib/onChainMemberSync';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: { address: string } }
) {
  try {
    const address = context?.params?.address;
    if (!address) {
      return NextResponse.json({ success: false, error: 'Address required' }, { status: 400 });
    }

    let bttPriceUsd = 0.056;
    try {
      const { TROB_PRICE_API_URL } = await import('@/config/env');
      const pRes = await fetch(TROB_PRICE_API_URL, { cache: 'no-store', signal: AbortSignal.timeout(1200) });
      if (pRes.ok) {
        const pj = await pRes.json();
        const p = Number(pj?.data?.priceUsd ?? pj?.priceUsd);
        if (Number.isFinite(p) && p > 0) bttPriceUsd = p;
      }
    } catch {}

    const synced = await getAndSyncMemberState(address);

    return NextResponse.json({
      success: true,
      data: {
        isMember: synced.isMember,
        position: synced.position,
        nftTokenId: synced.nftTokenId,
        status: synced.status,
        joinedAt: synced.joinedAt,
        pushedAmountBtt: synced.totalEarnedTrob,
        pushedAmountTrob: synced.totalEarnedTrob,
        pushedAmountUsdEstimate: synced.lifetimeUsd,
        currentCycleUsd: synced.currentCycleUsd,
        earningsCapBtt: 26785.71, // Smart contract fixed 5X cap (26,785.71 TROB = $1,500.00 USD)
        earningsCapTrob: 26785.71,
        earningsCapUsd: 1500,
        capProgressPct: synced.capProgressPct,
        isCapped: synced.isCapped,
        underfunded: synced.status === 'underfunded',
        retopupCount: synced.retopupCount,
        retopupDeadline: synced.retopupDeadline,
        retopupTimeRemainingSeconds: synced.retopupTimeRemainingSeconds,
        entryAmountBtt: synced.entryAmountTrob,
        entryAmountTrob: synced.entryAmountTrob,
        entryAmountUsdEstimate: synced.entryAmountUsd,
        poolClaimableTrob: synced.poolClaimableTrob ?? 0,
        fallbackClaimableTrob: synced.fallbackClaimableTrob ?? 0,
        totalClaimableTrob: Math.round(((synced.poolClaimableTrob ?? 0) + (synced.fallbackClaimableTrob ?? 0)) * 100) / 100,
        unearnedDebtTrob: synced.unearnedDebtTrob ?? 0,
        unearnedDebtUsd: synced.unearnedDebtTrob ? Math.round(synced.unearnedDebtTrob * 0.056 * 100) / 100 : 0,
        directReferralsCount: 0,
        isQualified: synced.isMember,
        userId: synced.userId,
        txHash: synced.txHash,
      },
    });
  } catch (error: any) {
    console.error('[API member/[address]] FATAL ERROR:', error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error), stack: error?.stack },
      { status: 500 }
    );
  }
}
