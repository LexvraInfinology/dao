import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic';

let cachedTrobPayload: any = null;
let lastTrobFetchTime = 0;
let inFlightPromise: Promise<any> | null = null;

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.RPC_URL ||
  process.env.FULLNODE_URL ||
  'https://fullnode-one.trobchain.com';

const MATRIX_HEX = (
  process.env.NEXT_PUBLIC_MATRIX_HEX ||
  '41b48f1e72c64b776ce5864df74926b3b935fef308'
).toLowerCase();

const CALLER_HEX = '410000000000000000000000000000000000000000';

async function fetchOnChainOraclePrice(): Promise<number> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    const selector = ethers.id('trobPriceUsd6()').slice(2, 10);
    const res = await fetch(`${RPC_URL}/wallet/triggerconstantcontract`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        owner_address: CALLER_HEX,
        contract_address: MATRIX_HEX,
        function_selector: 'trobPriceUsd6()',
        parameter: '',
        visible: false,
      }),
    });
    clearTimeout(timeout);
    if (!res.ok) return 0;
    const json = await res.json();
    const hex = json?.constant_result?.[0];
    if (hex && hex.length >= 64) {
      const val = Number(BigInt('0x' + hex.slice(0, 64)));
      if (Number.isFinite(val) && val > 0) return val / 1_000_000;
    }
    void selector;
  } catch {
    // ignore and try other sources
  }
  return 0;
}

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

    const oraclePrice = await fetchOnChainOraclePrice();
    if (oraclePrice > 0) {
      const payload = {
        success: true,
        data: {
          priceUsd: oraclePrice,
          price: oraclePrice,
          timestamp: Date.now(),
          source: 'onchain_oracle',
        },
        priceUsd: oraclePrice,
        price: oraclePrice,
      };
      cachedTrobPayload = payload;
      lastTrobFetchTime = Date.now();
      return payload;
    }

    return null;
  })().finally(() => {
    inFlightPromise = null;
  });

  return inFlightPromise;
}

export async function GET() {
  try {
    const payload = await fetchLiveTrobPrice();
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Live TROB market & on-chain oracle unavailable',
        },
        {
          status: 503,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
          },
        }
      );
    }
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
        success: false,
        error: err?.message || 'Live TROB price lookup failed',
      },
      {
        status: 503,
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
