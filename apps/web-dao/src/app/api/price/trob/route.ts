import { NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { TROB_PRICE_API_URL } from '@/config/env';

export const dynamic = 'force-dynamic';

let cachedTrobPayload: any = null;
let lastTrobFetchTime = 0;
let inFlightPromise: Promise<any> | null = null;

function calculateTrobPegs(priceUsd: number) {
  const seatEntryUsd = 300;
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    return { seatEntryUsd, seatEntryTrob: 0, earningsCapUsd: 1500, earningsCapTrob: 0 };
  }
  const seatEntryTrob = Math.round((seatEntryUsd / priceUsd) * 100) / 100;
  const earningsCapUsd = 1500;
  const earningsCapTrob = Math.round((earningsCapUsd / priceUsd) * 100) / 100;
  return { seatEntryUsd, seatEntryTrob, earningsCapUsd, earningsCapTrob };
}

async function fetchLiveTrobPrice(): Promise<any> {
  const now = Date.now();
  // Return cached live price if fetched within the last 30 seconds
  if (cachedTrobPayload && now - lastTrobFetchTime < 30_000) {
    return cachedTrobPayload;
  }

  // Deduplicate concurrent requests so only one network call happens at a time
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    // 1. Try configured TROB_PRICE_API_URL
    const endpointsToTry = [
      TROB_PRICE_API_URL,
      'https://backend.trobchain.com/v1/market/price',
    ];

    for (const url of endpointsToTry) {
      if (!url) continue;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        clearTimeout(timeout);

        if (res.ok) {
          const json = await res.json();
          const rawPrice = json?.data?.priceUsd ?? json?.priceUsd ?? json?.price;
          const priceUsd = Number(rawPrice);
          if (Number.isFinite(priceUsd) && priceUsd > 0) {
            const pegs = calculateTrobPegs(priceUsd);
            const payload = {
              priceUsd,
              priceSource: 'live-market-api',
              updatedAt: json?.data?.updatedAt || new Date().toISOString(),
              isStale: false,
              ...pegs,
            };
            cachedTrobPayload = payload;
            lastTrobFetchTime = Date.now();
            return payload;
          }
        }
      } catch (err: any) {
        console.warn(`[price/trob] Failed to fetch from ${url}:`, err.message);
      }
    }

    inFlightPromise = null;

    if (cachedTrobPayload) {
      return { ...cachedTrobPayload, isStale: true };
    }

    // 2. Safe benchmark fallback if both market oracles are unreachable
    const fallbackPrice = 0.037146; // Official TROB live price benchmark
    const fallbackPegs = calculateTrobPegs(fallbackPrice);
    const fallbackPayload = {
      priceUsd: fallbackPrice,
      priceSource: 'pegged-benchmark-fallback',
      updatedAt: new Date().toISOString(),
      isStale: true,
      ...fallbackPegs,
    };
    cachedTrobPayload = fallbackPayload;
    lastTrobFetchTime = Date.now();
    return fallbackPayload;
  })();

  return inFlightPromise;
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

export async function GET() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const payload = await fetchLiveTrobPrice();
  return NextResponse.json(
    { success: Boolean(payload), data: payload },
    { headers: corsHeaders }
  );
}
