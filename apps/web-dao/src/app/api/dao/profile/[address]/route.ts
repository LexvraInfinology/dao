import { NextRequest, NextResponse } from 'next/server';
import { getActiveDaoAddress } from '@/utils/trobAddress';
import { getAndSyncMemberState } from '../../../_lib/onChainMemberSync';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  if (!address) {
    return NextResponse.json({ success: false, error: 'Address required' }, { status: 400 });
  }

  let bttPriceUsd = 0.037757;
  try {
    const { TROB_PRICE_API_URL } = await import('@/config/env');
    const pRes = await fetch(TROB_PRICE_API_URL, { cache: 'no-store', signal: AbortSignal.timeout(1200) });
    if (pRes.ok) {
      const pj = await pRes.json();
      const p = Number(pj?.data?.priceUsd ?? pj?.priceUsd);
      if (Number.isFinite(p) && p > 0) bttPriceUsd = p;
    }
  } catch {}

  const earningsCapUsd = 1500;
  const earningsCapBtt = Math.round((earningsCapUsd / bttPriceUsd) * 100) / 100;

  try {
    const synced = await getAndSyncMemberState(address);

    if (synced.isMember && synced.position) {
      const pos = synced.position;
      const isUnderfunded = synced.status === 'underfunded';

      const nftBadges = [
        {
          id: `sbt-${pos}`,
          tokenId: synced.nftTokenId || pos,
          name: `Genesis Council Seat #${pos}`,
          type: 'Soulbound Token (SBT)',
          contractAddress: getActiveDaoAddress(),
          mintDate: synced.joinedAt || '2026-10-03 15:31:06',
          rarity: 'Genesis Founder (1 of 100)',
          image: '/badges/genesis-founder.png',
        },
      ];

      return NextResponse.json({
        success: true,
        data: {
          address: synced.address,
          userId: synced.userId || pos,
          isMember: true,
          underfunded: isUnderfunded,
          position: pos,
          nftTokenId: synced.nftTokenId || pos,
          sponsorAddress: null,
          joinedAt: synced.joinedAt,
          registrationTimestamp: synced.joinedAt,
          status: synced.status,
          retopupCount: synced.retopupCount,
          currentCycleUsd: synced.currentCycleUsd,
          retopupDeadline: synced.retopupDeadline,
          retopupTimeRemainingSeconds: synced.retopupTimeRemainingSeconds,
          isExpired: synced.status === 'vacant',
          txHash: synced.txHash,
          highestMatrixSlot: isUnderfunded ? 0 : 1,
          matrixSlots: [],
          nftBadges,
          poolCards: [
            {
              tier: 1,
              tierName: 'Genesis Council Payouts',
              targetEarningsUsd: 1500,
              pushedAmountUsd: synced.lifetimeUsd,
              progressPct: synced.capProgressPct,
              unlockedAt: synced.joinedAt || '2026-10-03 15:31:06',
              status: isUnderfunded ? 'underfunded' : synced.isCapped ? 'capped' : 'active',
            },
          ],
          totalEarnedUsd: synced.lifetimeUsd,
          totalEarnedBtt: synced.totalEarnedTrob,
          pushedAmountBtt: synced.totalEarnedTrob,
          pushedAmountTrob: synced.totalEarnedTrob,
          pushedAmountUsdEstimate: synced.lifetimeUsd,
          earningsCapUsd: 1500,
          earningsCapBtt,
          earningsCapTrob: earningsCapBtt,
          remainingCapUsd: Math.max(0, 1500 - synced.currentCycleUsd),
          remainingCapTrob: Math.max(0, earningsCapBtt - synced.totalEarnedTrob),
          capProgressPct: synced.capProgressPct,
          isCapped: synced.isCapped,
          bttPriceUsd,
          trobPriceUsd: bttPriceUsd,
        },
      });
    }
  } catch (err) {
    console.warn('[profile route] Error:', err);
  }

  // Non-member profile response
  return NextResponse.json({
    success: true,
    data: {
      address,
      userId: null,
      isMember: false,
      underfunded: false,
      position: null,
      nftTokenId: null,
      sponsorAddress: null,
      registrationTimestamp: null,
      status: 'unclaimed',
      retopupDeadline: null,
      retopupTimeRemainingSeconds: null,
      isExpired: false,
      txHash: null,
      highestMatrixSlot: 0,
      matrixSlots: [],
      nftBadges: [],
      poolCards: [],
      totalEarnedUsd: 0,
      totalEarnedBtt: 0,
      pushedAmountBtt: 0,
      pushedAmountTrob: 0,
      pushedAmountUsdEstimate: 0,
      earningsCapUsd: 1500,
      earningsCapBtt,
      earningsCapTrob: earningsCapBtt,
      remainingCapUsd: 1500,
      remainingCapTrob: earningsCapBtt,
      capProgressPct: 0,
      isCapped: false,
      bttPriceUsd,
      trobPriceUsd: bttPriceUsd,
    },
  });
}
