import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';

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
    earningsCapBtt: 1500,
    earningsCapUsd: 82.5,
    pushedBtt: 0,
    pushedUsd: 0,
    capProgressPct: 0,
    remainingCapBtt: 1500,
    remainingCapUsd: 82.5,
    isCapped: false,
    bttPriceUsd: 0.055,
  };

  return NextResponse.json({
    success: true,
    data: fallbackLounge,
  });
}
