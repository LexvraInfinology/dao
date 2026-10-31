import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let cachedTrobPayload: any = null;
let lastTrobFetchTime = 0;
let inFlightPromise: Promise<any> | null = null;

const BENCHMARK_PRICE = 0.056;

async function fetchLiveTrobPrice(): Promise<any> {
  const now = Date.now();
  if (cachedTrobPayload && now - lastTrobFetchTime < 30_000) {
    return cachedTrobPayload;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    const endpointsToTry = [
      process.env.TROB_PRICE_API_URL,
      process.env.NEXT_PUBLIC_TROB_PRICE_API_URL,
      'https://backend.trobchain.com/v1/market/price',
      'https://backend.trobchain.com/v1/market/price/summary',
    ];

    for (const url of endpointsToTry) {
      if (!url) continue;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

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
            const payload = {
              success: true,
              data: {
                priceUsd,
                price: priceUsd,
                timestamp: Date.now(),
                source: url,
              },
              priceUsd,
              price: priceUsd,
            };
            cachedTrobPayload = payload;
            lastTrobFetchTime = Date.now();
            return payload;
          }
        }
      } catch {
        // try next endpoint
      }
    }

    // Benchmark fallback
    return {
      success: true,
      data: {
        priceUsd: BENCHMARK_PRICE,
        price: BENCHMARK_PRICE,
        timestamp: Date.now(),
        source: 'benchmark_fallback',
      },
      priceUsd: BENCHMARK_PRICE,
      price: BENCHMARK_PRICE,
    };
  })().finally(() => {
    inFlightPromise = null;
  });

  return inFlightPromise;
}

export async function GET() {
  try {
    const payload = await fetchLiveTrobPrice();
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: true,
        data: {
          priceUsd: BENCHMARK_PRICE,
          price: BENCHMARK_PRICE,
          timestamp: Date.now(),
          source: 'error_fallback',
        },
        priceUsd: BENCHMARK_PRICE,
        price: BENCHMARK_PRICE,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
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
