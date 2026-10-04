import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { getOnChainDaoTransactions, syncOnChainMembersState } from '../../_lib/blockchainSync';
import { TROB_PRICE_API_URL } from '@/config/env';

export const dynamic = 'force-dynamic';

// In-memory cache for fast dynamic responses (3s cache for members, 30s for trob price)
let cachedMembersPayload: any = null;
let cachedMembersTime = 0;
let cachedTrobPrice = 0.057097;
let cachedTrobPriceTime = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '100';

  const now = Date.now();
  if (page === '1' && limit === '100' && cachedMembersPayload && now - cachedMembersTime < 3000) {
    return NextResponse.json({ success: true, data: cachedMembersPayload });
  }

  // Trigger real-time on-chain state sync in background
  syncOnChainMembersState().catch(() => {});

  // 1. Try local/remote Express backend if configured
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/members?page=${page}&limit=${limit}`
  );
  if (backendRes && backendRes.success) {
    if (page === '1' && limit === '100') {
      cachedMembersPayload = backendRes.data;
      cachedMembersTime = now;
    }
    return NextResponse.json(backendRes);
  }

  // 2. Direct Serverless Fallback to Neon Database (Vercel native)
  try {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // Use cached TROB price or fetch with strict 1.2s timeout
    if (now - cachedTrobPriceTime > 30_000 || cachedTrobPrice <= 0) {
      try {
        const pRes = await fetch(TROB_PRICE_API_URL, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(1200),
        });
        if (pRes.ok) {
          const pJson = await pRes.json();
          const pVal = Number(pJson?.data?.priceUsd ?? pJson?.priceUsd);
          if (Number.isFinite(pVal) && pVal > 0) {
            cachedTrobPrice = pVal;
            cachedTrobPriceTime = now;
          }
        }
      } catch {}
    }

    const { rows } = await queryNeon<any>(
      `SELECT position, address, "nftTokenId", "entryAmountBtt", "pushedAmountBtt", status, "joinedAt"
       FROM "DaoMember"
       WHERE LOWER(status) IN ('active', 'capped')
       ORDER BY position ASC
       LIMIT $1 OFFSET $2`,
      [limitNum, offset]
    );

    const countRes = await queryNeon<{ count: string }>(
      `SELECT count(*) as count FROM "DaoMember" WHERE LOWER(status) IN ('active', 'capped')`
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const data = {
      members: rows.map((r) => ({
        position: r.position,
        address: r.address,
        nftTokenId: r.nftTokenId,
        entryAmountBtt: parseFloat(r.entryAmountBtt || '0'),
        entryAmountTrob: parseFloat(r.entryAmountBtt || '0'),
        pushedAmountBtt: parseFloat(r.pushedAmountBtt || '0'),
        pushedAmountTrob: parseFloat(r.pushedAmountBtt || '0'),
        status: r.status || 'active',
        joinedAt: r.joinedAt,
      })),
      total,
      bttPriceUsd: cachedTrobPrice,
      trobPriceUsd: cachedTrobPrice,
      page: pageNum,
      limit: limitNum,
    };

    if (page === '1' && limit === '100') {
      cachedMembersPayload = data;
      cachedMembersTime = Date.now();
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (dbErr) {
    console.warn('[members route] Neon direct query fallback error:', dbErr);
  }

  return NextResponse.json({
    success: true,
    data: {
      members: [],
      total: 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    },
  });
}
