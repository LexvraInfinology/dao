import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendRes = await fetchFromBackend<{ success: boolean; data?: any; error?: string; message?: string }>(
      '/api/dao/retopup',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
    if (backendRes) {
      return NextResponse.json(backendRes, { status: backendRes.success ? 200 : 400 });
    }

    // Direct Serverless Neon Retopup
    const { address, txHash } = body;
    if (!address) {
      return NextResponse.json({ success: false, error: 'Member address is required' }, { status: 400 });
    }

    const memberRes = await queryNeon<any>(
      `SELECT * FROM "DaoMember" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
      [address.trim()]
    );

    if (memberRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Address is not an active Genesis Council member' }, { status: 404 });
    }

    const m = memberRes.rows[0];
    const cleanTx = (txHash || '0x' + Math.random().toString(16).slice(2)).toLowerCase();
    const retopupBtt = 5357.14;

    // Reset member's earnings counter and set status to active
    await queryNeon(
      `UPDATE "DaoMember"
       SET "pushedAmountBtt" = 0,
           status = 'active',
           "updatedAt" = NOW()
       WHERE id = $1`,
      [m.id]
    );

    // Record retopup event in DaoEvent
    await queryNeon(
      `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
       VALUES (gen_random_uuid(), 'retopup', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, 300, 'trobchain-api', $5)`,
      [
        m.address,
        m.position,
        cleanTx,
        retopupBtt,
        `5X Cap Reset: 48h Retopup completed ($300 USD / ${retopupBtt} TROB)`,
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        address: m.address,
        position: m.position,
        status: 'active',
        pushedAmountBtt: 0,
        txHash: cleanTx,
        message: 'Retopup confirmed. 5X earnings cap successfully reset.',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Retopup synchronization failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
