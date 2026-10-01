import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';

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

    return NextResponse.json({
      success: false,
      error: 'Backend relayer unavailable. Please ensure the backend is running.',
    }, { status: 503 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Retopup synchronization failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
