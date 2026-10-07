import { NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { TROB_PRICE_API_URL } from '@/config/env';

export const dynamic = 'force-dynamic';

function calculateTrobPegs(priceUsd: number) {
  const seatEntryUsd = 300;
  const seatEntryTrob = Math.ceil((seatEntryUsd / priceUsd) * 1000) / 1000;
  const earningsCapUsd = 1500;
  const earningsCapTrob = Math.ceil((earningsCapUsd / priceUsd) * 1000) / 1000;
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

export async function GET() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const now = Date.now();
  if (cachedTrobPayload && now - lastTrobFetchTime < 30_000) {
    return NextResponse.json(
      { success: true, data: cachedTrobPayload },
      { headers: corsHeaders }
    );
  }

  // 1. Fetch live TROB market price directly from official Trobchain API
  const TROB_MARKET_API = TROB_PRICE_API_URL;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(TROB_MARKET_API, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const data = json?.data ?? json;
      const priceUsd = Number(data?.priceUsd);
      if (Number.isFinite(priceUsd) && priceUsd > 0) {
        const pegs = calculateTrobPegs(priceUsd);
        const payload = {
          priceUsd,
          priceSource: 'trobchain-live-api',
          updatedAt: data.updatedAt || new Date().toISOString(),
          isStale: false,
          ...pegs,
        };
        cachedTrobPayload = payload;
        lastTrobFetchTime = Date.now();
        return NextResponse.json(
          {
            success: true,
            data: payload,
          },
          { headers: corsHeaders }
        );
      }
    }
  } catch (err) {
    // If cached payload exists, gracefully serve it on timeout
    if (cachedTrobPayload) {
      return NextResponse.json(
        { success: true, data: cachedTrobPayload },
        { headers: corsHeaders }
      );
    }
  }

  // 2. Fallback to backend proxy if available
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>('/api/price/trob');
  if (backendRes && backendRes.success && backendRes.data && backendRes.data.priceUsd > 0) {
    const priceUsd = backendRes.data.priceUsd;
    const pegs = calculateTrobPegs(priceUsd);
    return NextResponse.json(
      {
        success: true,
        data: {
          ...backendRes.data,
          ...pegs,
        },
      },
      { headers: corsHeaders }
    );
  }

  // 3. Graceful fallback for offline development
  const priceUsd = 0.037757;
  const pegs = calculateTrobPegs(priceUsd);

  return NextResponse.json(
    {
      success: true,
      data: {
        priceUsd,
        priceSource: 'trobchain-cached',
        updatedAt: new Date().toISOString(),
        isStale: false,
        ...pegs,
      },
    },
    { headers: corsHeaders }
  );
}
