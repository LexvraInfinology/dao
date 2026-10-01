import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const backendRes = await fetchFromBackend<{ success: boolean; data?: any; error?: string }>(
      '/api/dao/resource-params'
    );

    if (backendRes) {
      return NextResponse.json(backendRes);
    }

    return NextResponse.json({
      success: false,
      error: 'Resource parameters service unavailable',
    }, { status: 503 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch resource params';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
