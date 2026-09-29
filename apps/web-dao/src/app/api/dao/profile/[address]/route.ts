import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/profile/${address}`
  );
  if (backendRes && backendRes.success) {
    return NextResponse.json(backendRes);
  }

  const fallbackProfile = {
    address,
    isMember: false,
    position: null,
    nftTokenId: null,
    sponsorAddress: null,
    registrationTimestamp: null,
    highestMatrixSlot: 1,
    matrixSlots: [],
    nftBadges: [],
    poolCards: [],
    totalEarnedBtt: 0,
    totalEarnedUsd: 0,
    bttPriceUsd: 0.056001,
    priceSource: 'trobchain',
  };

  return NextResponse.json({
    success: true,
    data: fallbackProfile,
  });
}
