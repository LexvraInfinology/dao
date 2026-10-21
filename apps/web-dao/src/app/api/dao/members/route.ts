import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { getOnChainDaoTransactions, syncOnChainMembersState } from '../../_lib/blockchainSync';
import { TROB_PRICE_API_URL } from '@/config/env';

import { calculateMemberEarnedUsd, calculateMemberCycleAndLifetime, CONTRACT_TROB_PEG } from '@/utils/daoEconomics';
import { toUtcIso } from '../../_lib/dateUtils';

// Dynamic Next.js API route
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

  // Automatically transition expired seats (12h underfunded or 48h capped) to vacant in Neon DB
  try {
    const expiredRes = await queryNeon<any>(
      `UPDATE "DaoMember"
       SET status = 'vacant', "updatedAt" = NOW()
       WHERE LOWER(status) = 'capped'
         AND "retopupDeadline" IS NOT NULL
         AND "retopupDeadline" < NOW()
       RETURNING id, position, status`
    );
    if (expiredRes?.rowCount && expiredRes.rowCount > 0) {
      cachedMembersPayload = null;
      cachedMembersTime = 0;
    }
  } catch {}

  const now = Date.now();
  if (page === '1' && limit === '100' && cachedMembersPayload && now - cachedMembersTime < 10000) {
    return NextResponse.json({ success: true, data: cachedMembersPayload });
  }

  // Trigger real-time on-chain state sync in background
  syncOnChainMembersState().catch(() => {});

  // 1. Direct Serverless Neon Database query (instant, primary source of truth)
  try {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const { rows } = await queryNeon<any>(
      `SELECT position, address, "nftTokenId", "entryAmountBtt", "pushedAmountBtt", status, "joinedAt", "retopupDeadline", "retopupCount", "totalDepositsCount", "totalDepositsUsd", "retopupAmountBtt"
       FROM "DaoMember"
       WHERE LOWER(status) NOT IN ('vacant', 'blank')
       ORDER BY position ASC
       LIMIT $1 OFFSET $2`,
      [limitNum, offset]
    );

    const countRes = await queryNeon<{ count: string }>(
      `SELECT count(*) as count FROM "DaoMember" WHERE LOWER(status) NOT IN ('vacant', 'blank')`
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    if (rows && rows.length > 0) {
      const data = {
        members: rows.map((r) => {
          const pushedAmt = parseFloat(r.pushedAmountBtt || '0');
          const effStatus = r.status || 'active';
          const isCapped = effStatus === 'capped';
          const isUnderfunded = effStatus === 'underfunded';
          const retopupCount = parseInt(r.retopupCount || '0', 10);
          const eco = calculateMemberCycleAndLifetime(
            r.position,
            effStatus,
            total || 87,
            retopupCount,
            pushedAmt,
            CONTRACT_TROB_PEG
          );
          const dl = (isCapped || isUnderfunded) ? toUtcIso(r.retopupDeadline) : null;
          return {
            position: r.position,
            address: r.address,
            nftTokenId: r.nftTokenId,
            entryAmountBtt: parseFloat(r.entryAmountBtt || '0'),
            entryAmountTrob: parseFloat(r.entryAmountBtt || '0'),
            retopupAmountBtt: parseFloat(r.retopupAmountBtt || '0'),
            totalDepositsCount: parseInt(r.totalDepositsCount || (1 + retopupCount).toString(), 10),
            totalDepositsUsd: parseFloat(r.totalDepositsUsd || ((1 + retopupCount) * 300).toString()),
            pushedAmountBtt: isUnderfunded ? 0 : (isCapped ? Math.max(pushedAmt, 26785.71) : pushedAmt),
            pushedAmountTrob: isUnderfunded ? 0 : (isCapped ? Math.max(pushedAmt, 26785.71) : pushedAmt),
            pushedAmountUsdEstimate: eco.lifetimeUsd,
            currentCycleUsd: eco.currentCycleUsd,
            currentCycleCapPct: eco.currentCycleCapPct,
            retopupCount,
            status: effStatus,
            joinedAt: r.joinedAt,
            retopupDeadline: dl,
          };
        }),
        total,
        bttPriceUsd: 0.056,
        trobPriceUsd: 0.056,
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
    }
  } catch (dbErr) {
    console.warn('[members route] Neon direct query note:', dbErr);
  }

  // 2. Secondary fallback to Express backend
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/members?page=${page}&limit=${limit}`
  );
  if (
    backendRes &&
    backendRes.success &&
    Array.isArray(backendRes.data?.members) &&
    backendRes.data.members.length > 0
  ) {
    return NextResponse.json(backendRes);
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
