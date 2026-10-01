import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Try local/remote Express backend if configured
    const backendRes = await fetchFromBackend<{ success: boolean; data?: any; error?: string }>(
      '/api/dao/claim',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
    if (backendRes) {
      return NextResponse.json(backendRes, { status: backendRes.success ? 200 : 400 });
    }

    // 2. Direct Serverless Fallback to Neon Database (Vercel native)
    const { address, position, txHash } = body;
    if (!address || !position) {
      return NextResponse.json({ success: false, error: 'Address and position are required' }, { status: 400 });
    }

    const pos = parseInt(position, 10);
    const existing = await queryNeon<any>(
      `SELECT id FROM "DaoMember" WHERE position = ${pos} OR address = '${address}' LIMIT 1`
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          position: pos,
          address,
          instantCashbackBtt: (300 / pos).toFixed(2),
        },
      });
    }

    const cleanTx = (txHash || '0x' + Math.random().toString(16).slice(2)).toLowerCase();
    const entryAmount = 5244.75;
    const cashback = parseFloat((300 / pos).toFixed(2));

    await queryNeon(
      `INSERT INTO "DaoMember" (id, address, position, "joinedAt", "txHash", "blockNumber", "entryAmountBtt", "entryAmountUsdAtJoin", "nftTokenId", "priceSource", "pushedAmountBtt", status, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), '${address}', ${pos}, NOW(), '${cleanTx}', 1, ${entryAmount}, 300, ${pos}, 'trobchain-api', ${cashback}, 'active', NOW(), NOW())`
    );

    return NextResponse.json({
      success: true,
      data: {
        position: pos,
        address,
        instantCashbackBtt: cashback.toString(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Claim verification failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
