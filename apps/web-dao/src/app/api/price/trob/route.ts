import { NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { TROB_PRICE_API_URL } from '@/config/env';

export const dynamic = 'force-dynamic';

function calculateTrobPegs(priceUsd: number) {
  const seatEntryUsd = 300;
  const effectivePrice = Number.isFinite(priceUsd) && priceUsd > 0 ? priceUsd : 0.042431;
  const seatEntryTrob = Math.round((seatEntryUsd / effectivePrice) * 100) / 100;
  const earningsCapUsd = 1500;
  const earningsCapTrob = Math.round((earningsCapUsd / effectivePrice) * 100) / 100;
  return { seatEntryUsd, seatEntryTrob, earningsCapUsd, earningsCapTrob };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

let cachedTrobPayload: any = null;
let lastTrobFetchTime = 0;

function getPeggedTrobPayload(): any {
  const priceUsd = 0.056;
  const pegs = calculateTrobPegs(priceUsd);
  return {
    priceUsd,
    priceSource: 'trobchain-contract-peg',
    updatedAt: new Date().toISOString(),
    isStale: false,
    ...pegs,
  };
}

async function fetchLiveTrobPrice(): Promise<any> {
  const payload = getPeggedTrobPayload();
  cachedTrobPayload = payload;
  lastTrobFetchTime = Date.now();
  return payload;
}

export async function GET() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const payload = getPeggedTrobPayload();
  return NextResponse.json(
    { success: true, data: payload },
    { headers: corsHeaders }
  );
}
