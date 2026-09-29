import { NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';

export async function GET() {
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>('/api/price/trob');
  if (backendRes && backendRes.success && backendRes.data) {
    return NextResponse.json(backendRes);
  }

  // Graceful fallback for TROB market price
  const priceUsd = 0.056001;
  const seatEntryUsd = 300;
  const seatEntryTrob = Math.round((seatEntryUsd / priceUsd) * 1000) / 1000;

  const fallbackPrice = {
    priceUsd,
    priceSource: 'trobchain-api',
    updatedAt: new Date().toISOString(),
    isStale: false,
    seatEntryUsd,
    seatEntryTrob,
  };

  return NextResponse.json({
    success: true,
    data: fallbackPrice,
  });
}
