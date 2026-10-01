import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '100';

  // 1. Try local/remote Express backend if configured
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/members?page=${page}&limit=${limit}`
  );
  if (backendRes && backendRes.success) {
    return NextResponse.json(backendRes);
  }

  // 2. Direct Serverless Fallback to Neon Database (Vercel native)
  try {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const { rows } = await queryNeon<any>(
      `SELECT position, address, "nftTokenId", "entryAmountBtt", "pushedAmountBtt", status, "joinedAt"
       FROM "DaoMember"
       ORDER BY position ASC
       LIMIT ${limitNum} OFFSET ${offset}`
    );

    const countRes = await queryNeon<{ count: string }>('SELECT count(*) as count FROM "DaoMember"');
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    return NextResponse.json({
      success: true,
      data: {
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
        bttPriceUsd: 0.0572,
        trobPriceUsd: 0.0572,
        page: pageNum,
        limit: limitNum,
      },
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
