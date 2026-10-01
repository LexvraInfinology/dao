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
      `SELECT * FROM "DaoMember" WHERE address = '${address}' LIMIT 1`
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
          address,
          position: m.position,
          nftTokenId: m.nftTokenId,
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
        },
      });
    }
  } catch (dbErr) {
    console.warn('[lounge route] Neon fallback error:', dbErr);
  }

  const fallbackLounge = {
    isMember: false,
    address,
    position: undefined,
    nftTokenId: undefined,
    status: 'ACTIVE',
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
  };

  return NextResponse.json({
    success: true,
    data: fallbackLounge,
  });
}
