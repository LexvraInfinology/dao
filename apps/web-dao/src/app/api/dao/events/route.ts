import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    // 1. Try Express backend if configured
    const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
      `/api/dao/events?limit=${limit}`
    );
    if (backendRes && backendRes.success && Array.isArray(backendRes.data) && backendRes.data.length > 0) {
      return NextResponse.json(backendRes);
    }

    // 2. Direct Serverless Neon Database Query
    const { rows } = await queryNeon<any>(
      `SELECT id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "amountBtt", "amountUsdEst", "priceSource", reason
       FROM "DaoEvent"
       ORDER BY "timestamp" DESC, "createdAt" DESC
       LIMIT ${limit}`
    );

    const enriched = rows.map((evt) => ({
      ...evt,
      amountBtt: parseFloat(evt.amountBtt || '0'),
      amountTrob: parseFloat(evt.amountBtt || '0'),
      amountUsdEst: parseFloat(evt.amountUsdEst || '0'),
      reason:
        evt.reason ||
        (evt.eventType === 'joined'
          ? `Council Seat Activated${evt.incomingPosition ? ` (#${evt.incomingPosition})` : ''}`
          : evt.eventType === 'pushed'
          ? `Instant 300/N Cashback${evt.incomingPosition ? ` (Seat #${evt.incomingPosition})` : ''}`
          : evt.eventType === 'retopup'
          ? '5X Cap Retopup'
          : evt.eventType),
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch dao events';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
