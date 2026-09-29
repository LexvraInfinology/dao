import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get('limit') || '20';

  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/events?limit=${limit}`
  );
  if (backendRes && backendRes.success && Array.isArray(backendRes.data) && backendRes.data.length > 0) {
    const enriched = backendRes.data.map((evt: any) => ({
      ...evt,
      reason: evt.reason || (
        evt.eventType === 'joined'
          ? `Council Seat Activated${evt.incomingPosition ? ` (#${evt.incomingPosition})` : ''}`
          : evt.eventType === 'pushed'
          ? `Instant 300/N Cashback${evt.incomingPosition ? ` (Seat #${evt.incomingPosition})` : ''}`
          : evt.eventType === 'fallback_claimed'
          ? 'Dividend Reward Claimed'
          : evt.eventType
      ),
    }));
    return NextResponse.json({ success: true, data: enriched });
  }

  return NextResponse.json({
    success: true,
    data: [],
  });
}
