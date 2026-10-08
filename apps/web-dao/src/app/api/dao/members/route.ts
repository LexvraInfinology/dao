import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { getOnChainDaoTransactions, syncOnChainMembersState } from '../../_lib/blockchainSync';
import { TROB_PRICE_API_URL } from '@/config/env';

import { calculateMemberEarnedUsd, calculateMemberCycleAndLifetime } from '@/utils/daoEconomics';
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
  if (page === '1' && limit === '100' && cachedMembersPayload && now - cachedMembersTime < 3000) {
    return NextResponse.json({ success: true, data: cachedMembersPayload });
  }

  // Trigger real-time on-chain state sync in background
  syncOnChainMembersState().catch(() => {});

  // 1. Try local/remote Express backend if configured
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/members?page=${page}&limit=${limit}`
  );
  if (
    backendRes &&
    backendRes.success &&
    Array.isArray(backendRes.data?.members) &&
    backendRes.data.members.length > 0
  ) {
    const extraMap = new Map<number, {
      deadline: string | null;
      status: string;
      retopupCount: number;
      pushedBtt: number;
      totalDepositsCount: number;
      totalDepositsUsd: number;
      retopupAmountBtt: number;
    }>();
    try {
      const dlRes = await queryNeon<any>(
        `SELECT position, status, "retopupDeadline", "retopupCount", "pushedAmountBtt", "totalDepositsCount", "totalDepositsUsd", "retopupAmountBtt" FROM "DaoMember"`
      );
      for (const r of dlRes.rows) {
        if (r.position) {
          extraMap.set(r.position, {
            deadline: r.retopupDeadline ? toUtcIso(r.retopupDeadline) : null,
            status: r.status || 'active',
            retopupCount: parseInt(r.retopupCount || '0', 10),
            pushedBtt: parseFloat(r.pushedAmountBtt || '0'),
            totalDepositsCount: parseInt(r.totalDepositsCount || '1', 10),
            totalDepositsUsd: parseFloat(r.totalDepositsUsd || '300'),
            retopupAmountBtt: parseFloat(r.retopupAmountBtt || '0'),
          });
        }
      }
    } catch {}

    // Ensure underfunded members reflect their actual provisional deposit, and all members have exact historical USD earnings
    backendRes.data.members = backendRes.data.members.map((m: any) => {
      const extra = extraMap.get(m.position);
      const effStatus = extra?.status || m.status;
      const isUnderfunded = effStatus === 'underfunded';
      const trueDeposit = (m.position === 90 || m.position === 91) ? 5.0 : 1.5;
      const retopupCount = extra?.retopupCount ?? parseInt(m.retopupCount || '0', 10);
      const pushedBtt = extra?.pushedBtt ?? parseFloat(m.pushedAmountBtt || '0');

      const eco = calculateMemberCycleAndLifetime(
        m.position,
        effStatus,
        backendRes.data?.total || 93,
        retopupCount,
        pushedBtt,
        cachedTrobPrice
      );

      const dl = extra ? extra.deadline : (toUtcIso(m.retopupDeadline) || null);
      return {
        ...m,
        status: effStatus,
        entryAmountBtt: (isUnderfunded && m.entryAmountBtt > 300) ? trueDeposit : m.entryAmountBtt,
        entryAmountTrob: (isUnderfunded && m.entryAmountBtt > 300) ? trueDeposit : m.entryAmountBtt,
        retopupAmountBtt: extra?.retopupAmountBtt ?? 0,
        totalDepositsCount: extra?.totalDepositsCount ?? (1 + retopupCount),
        totalDepositsUsd: extra?.totalDepositsUsd ?? (300 + (retopupCount * 300)),
        pushedAmountBtt: isUnderfunded ? 0 : (effStatus === 'capped' ? Math.max(pushedBtt, 26785.71) : pushedBtt),
        pushedAmountTrob: isUnderfunded ? 0 : (effStatus === 'capped' ? Math.max(pushedBtt, 26785.71) : pushedBtt),
        pushedAmountUsdEstimate: eco.lifetimeUsd,
        currentCycleUsd: eco.currentCycleUsd,
        currentCycleCapPct: eco.currentCycleCapPct,
        retopupCount,
        retopupDeadline: (effStatus === 'capped' || effStatus === 'underfunded') ? dl : null,
      };
    });

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

    // Automatically transition expired capped seats to vacant so queue priority fills them first
    await queryNeon(
      `UPDATE "DaoMember"
       SET status = 'vacant', "updatedAt" = NOW()
       WHERE LOWER(status) = 'capped'
         AND "retopupDeadline" IS NOT NULL
         AND "retopupDeadline" < NOW()`
    ).catch(() => {});

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
          total || 93,
          retopupCount,
          pushedAmt,
          cachedTrobPrice
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
