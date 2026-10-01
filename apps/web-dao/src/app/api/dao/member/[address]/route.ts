import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';
import { queryNeon } from '../../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  if (!address) {
    return NextResponse.json({ success: false, error: 'Address required' }, { status: 400 });
  }

  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/member/${address}`
  );
  if (backendRes && backendRes.success) {
    return NextResponse.json(backendRes);
  }

  const bttPriceUsd = 0.0572;
  const entryAmountUsd = 300;
  const earningsCapUsd = 1500;
  const entryAmountBtt = Math.round((entryAmountUsd / bttPriceUsd) * 100) / 100;
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
      const isCapped = capBtt > 0 && pushedBtt >= capBtt;

      return NextResponse.json({
        success: true,
        data: {
          isMember: true,
          position: m.position,
          nftTokenId: m.nftTokenId,
          status: m.status || 'ACTIVE',
          joinedAt: m.joinedAt,
          pushedAmountBtt: pushedBtt,
          pushedAmountTrob: pushedBtt,
          pushedAmountUsdEstimate: Math.round(pushedBtt * bttPriceUsd * 100) / 100,
          earningsCapBtt: capBtt,
          earningsCapTrob: capBtt,
          earningsCapUsd,
          capProgressPct: capBtt > 0 ? Math.min(100, Math.round((pushedBtt / capBtt) * 100)) : 0,
          isCapped,
          entryAmountBtt: entryBtt,
          entryAmountTrob: entryBtt,
          entryAmountUsdEstimate: entryAmountUsd,
          directReferralsCount: 0,
          isQualified: true,
          userId: m.id,
        },
      });
    }
  } catch (dbErr) {
    console.warn('[member route] Neon lookup error:', dbErr);
  }

  // Non-member response
  const nonMember = {
    isMember: false,
    position: null,
    nftTokenId: null,
    status: 'unclaimed',
    joinedAt: undefined,
    pushedAmountBtt: 0,
    pushedAmountTrob: 0,
    pushedAmountUsdEstimate: 0,
    earningsCapBtt,
    earningsCapTrob: earningsCapBtt,
    earningsCapUsd,
    capProgressPct: 0,
    isCapped: false,
    entryAmountBtt,
    entryAmountTrob: entryAmountBtt,
    entryAmountUsdEstimate: entryAmountUsd,
    directReferralsCount: 0,
    isQualified: false,
    userId: null,
  };

  return NextResponse.json({
    success: true,
    data: nonMember,
  });
}
