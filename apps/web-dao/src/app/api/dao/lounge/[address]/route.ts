import { NextRequest, NextResponse } from 'next/server';
import { queryNeon } from '../../../_lib/neonDb';
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
      const isUnderfunded = synced.status === 'underfunded';
      const isCapped = synced.isCapped;
      const pos = synced.position;

      // Count active members for equal cashback calculation
      let activeCount = 85;
      try {
        const countRes = await queryNeon<any>(
          `SELECT COUNT(*) as cnt FROM "DaoMember" WHERE LOWER(status) = 'active'`
        );
        const dbActive = parseInt(countRes.rows[0]?.cnt || '84', 10);
        activeCount = Math.max(1, dbActive + (isCapped ? 1 : 0));
      } catch {}

      const retopupCashbackUsd = parseFloat((300 / activeCount).toFixed(2));
      const retopupCashbackTrob = Math.round((retopupCashbackUsd / bttPriceUsd) * 100) / 100;

      let bypassedToCouncilUsd = 0;
      let newActivationsSinceCap = 0;
      if (isCapped) {
        bypassedToCouncilUsd = 6.49;
        newActivationsSinceCap = 2;
      }

      const displayPushedUsd = isUnderfunded ? 0 : isCapped ? earningsCapUsd : synced.lifetimeUsd;
      const displayRemainingCapUsd = isUnderfunded ? earningsCapUsd : isCapped ? 0 : Math.max(0, earningsCapUsd - synced.currentCycleUsd);
      const displayRemainingCapBtt = isCapped ? 0 : Math.max(0, earningsCapBtt - synced.totalEarnedTrob);

      return NextResponse.json({
        success: true,
        data: {
          isMember: true,
          address: synced.address,
          position: pos,
          nftTokenId: synced.nftTokenId || pos,
          status: synced.status,
          claimableDividendsBtt: 0,
          claimableDividendsUsd: 0,
          totalReceivedBtt: isCapped ? earningsCapBtt : synced.totalEarnedTrob,
          totalReceivedUsd: displayPushedUsd,
          earningsCapBtt,
          earningsCapTrob: earningsCapBtt,
          earningsCapUsd,
          pushedBtt: isCapped ? earningsCapBtt : synced.totalEarnedTrob,
          pushedTrob: isCapped ? earningsCapBtt : synced.totalEarnedTrob,
          pushedUsd: displayPushedUsd,
          capProgressPct: synced.capProgressPct,
          remainingCapBtt: displayRemainingCapBtt,
          remainingCapTrob: displayRemainingCapBtt,
          remainingCapUsd: displayRemainingCapUsd,
          isCapped,
          currentCycleUsd: synced.currentCycleUsd,
          retopupCount: synced.retopupCount,
          retopupDeadline: synced.retopupDeadline,
          retopupTimeRemainingSeconds: synced.retopupTimeRemainingSeconds,
          retopupCashbackUsd,
          retopupCashbackTrob,
          activeMembersCount: activeCount,
          bypassedToCouncilUsd,
          newActivationsSinceCap,
          isExpired: synced.status === 'vacant',
          bttPriceUsd,
          trobPriceUsd: bttPriceUsd,
          soulboundPass: {
            tokenId: synced.nftTokenId || pos,
            seatNumber: pos,
            memberId: `#${String(pos).padStart(4, '0')}`,
            tier: 'Genesis Council',
            joinedAt: synced.joinedAt || '2026-10-03T15:31:06.000Z',
          },
          incomeChannels: {
            daoSeats: {
              label: 'Council Seat Distribution',
              earnedUsd: displayPushedUsd,
              earnedBtt: isCapped ? earningsCapBtt : synced.totalEarnedTrob,
            },
            matrixSlots: {
              label: 'Matrix Spillover',
              highestSlot: 0,
              earnedUsd: 0,
              earnedBtt: 0,
            },
            rankPools: {
              label: 'Rank Pool Rewards',
              unlockedPools: [],
            },
          },
        },
      });
    }
  } catch (err) {
    console.warn('[lounge route] Error:', err);
  }

  const nonMemberLounge = {
    isMember: false,
    address,
    position: undefined,
    nftTokenId: undefined,
    status: 'unclaimed',
    claimableDividendsBtt: 0,
    claimableDividendsUsd: 0,
    totalReceivedBtt: 0,
    totalReceivedUsd: 0,
    earningsCapBtt,
    earningsCapTrob: earningsCapBtt,
    earningsCapUsd,
    pushedBtt: 0,
    pushedTrob: 0,
    pushedUsd: 0,
    capProgressPct: 0,
    remainingCapBtt: earningsCapBtt,
    remainingCapTrob: earningsCapBtt,
    remainingCapUsd: earningsCapUsd,
    isCapped: false,
    bttPriceUsd,
    trobPriceUsd: bttPriceUsd,
    soulboundPass: null,
    incomeChannels: {
      daoSeats: { earnedUsd: 0, earnedBtt: 0 },
      matrixSlots: { highestSlot: 0, earnedUsd: 0, earnedBtt: 0 },
    },
  };

  return NextResponse.json({
    success: true,
    data: nonMemberLounge,
  });
}
