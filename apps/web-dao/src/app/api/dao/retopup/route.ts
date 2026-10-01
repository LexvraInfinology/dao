import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Try Express backend if available
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

    // 2. Serverless Neon DB direct fallback
    const { address, txHash, amountTrob } = body as {
      address?: string;
      txHash?: string;
      amountTrob?: number;
    };

    if (address) {
      const canonical = address.trim().toLowerCase();
      try {
        await queryNeon(
          `UPDATE "DaoMember" SET "pushedAmountBtt" = 0, "updatedAt" = NOW() WHERE LOWER(address) = LOWER($1)`,
          [canonical]
        );
        await queryNeon(
          `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "txHash", "blockNumber", timestamp, "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
           VALUES (gen_random_uuid()::text, 'retopup', $1, $2, '1', NOW(), NOW(), $3, 300, 'trobchain-api', '5X Cap Reset: 48h Retopup completed')`,
          [canonical, txHash || '0x', amountTrob || 5357.15]
        );
        return NextResponse.json({
          success: true,
          message: 'Retopup confirmed and 5X cap reset in protocol registry.',
        });
      } catch (dbErr) {
        console.warn('[retopup route] Neon DB update error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Retopup submitted successfully.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Retopup synchronization failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
