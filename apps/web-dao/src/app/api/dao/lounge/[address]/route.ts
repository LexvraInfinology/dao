import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';
import { queryNeon } from '../../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/lounge/${address}`
  );
  if (backendRes && backendRes.success) {
    return NextResponse.json(backendRes);
  }

  const bttPriceUsd = 0.0572;
  const earningsCapUsd = 1500;
  const earningsCapBtt = Math.round((earningsCapUsd / bttPriceUsd) * 100) / 100;

  // 2. Direct Serverless Neon Lookup (Vercel native)
  try {
    const { rows } = await queryNeon<any>(
      `SELECT * FROM "DaoMember" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
      [address.trim()]
    );
    if (rows.length > 0) {
      const m = rows[0];
      const pushedBtt = parseFloat(m.pushedAmountBtt || '0');
      const entryBtt = parseFloat(m.entryAmountBtt || '5244.75');
      const capBtt = entryBtt * 5;
      const pushedUsd = Math.round(pushedBtt * bttPriceUsd * 100) / 100;
      const isCapped = pushedBtt >= capBtt;
      const capProgressPct = capBtt > 0 ? Math.min(100, Math.round((pushedBtt / capBtt) * 100)) : 0;
      const remainingCapBtt = Math.max(0, capBtt - pushedBtt);
      const remainingCapUsd = Math.max(0, earningsCapUsd - pushedUsd);

      return NextResponse.json({
        success: true,
        data: {
          isMember: true,
          address: m.address,
          position: m.position,
          nftTokenId: m.nftTokenId || m.position,
          status: m.status || 'ACTIVE',
          claimableDividendsBtt: 0,
          claimableDividendsUsd: 0,
          totalReceivedBtt: pushedBtt,
          totalReceivedUsd: pushedUsd,
          earningsCapBtt: capBtt,
          earningsCapTrob: capBtt,
          earningsCapUsd,
          pushedBtt,
          pushedTrob: pushedBtt,
          pushedUsd,
          capProgressPct,
          remainingCapBtt,
          remainingCapTrob: remainingCapBtt,
          remainingCapUsd,
          isCapped,
          bttPriceUsd,
          trobPriceUsd: bttPriceUsd,
          soulboundPass: {
            seatNumber: m.position,
            memberId: `#${String(m.position).padStart(4, '0')}`,
            tier: 'Genesis Council',
            joinedAt: m.joinedAt,
            nftTokenId: m.nftTokenId || m.position,
          },
          incomeChannels: {
            daoSeats: {
              earnedUsd: pushedUsd,
              earnedBtt: pushedBtt,
            },
            matrixSlots: {
              highestSlot: 0,
              earnedUsd: 0,
              earnedBtt: 0,
            },
          },
        },
      });
    }
  } catch (dbErr) {
    console.warn('[lounge route] Neon fallback error:', dbErr);
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
