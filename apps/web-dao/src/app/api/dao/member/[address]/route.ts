import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';

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

  const bttPriceUsd = 0.056;
  const entryAmountUsd = 300;
  const earningsCapUsd = 1500;
  const entryAmountBtt = Math.round((entryAmountUsd / bttPriceUsd) * 100) / 100;
  const earningsCapBtt = Math.round((earningsCapUsd / bttPriceUsd) * 100) / 100;

  // Fallback for non-member / default lookup
  const fallbackMember = {
    isMember: false,
    position: null,
    nftTokenId: null,
    status: 'ACTIVE',
    joinedAt: undefined,
    pushedAmountBtt: 0,
    pushedAmountUsdEstimate: 0,
    earningsCapBtt,
    earningsCapUsd,
    capProgressPct: 0,
    isCapped: false,
    entryAmountBtt,
    entryAmountUsdEstimate: entryAmountUsd,
    directReferralsCount: 0,
    isQualified: false,
    userId: null,
  };

  return NextResponse.json({
    success: true,
    data: fallbackMember,
  });
}
