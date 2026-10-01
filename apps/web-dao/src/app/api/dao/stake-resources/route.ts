import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendRes = await fetchFromBackend<{ success: boolean; data?: any; error?: string; message?: string }>(
      '/api/dao/stake-resources',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    if (backendRes) {
      return NextResponse.json(backendRes);
    }

    return NextResponse.json({
      success: false,
      error: 'Resource staking service unavailable',
    }, { status: 503 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Resource staking failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
