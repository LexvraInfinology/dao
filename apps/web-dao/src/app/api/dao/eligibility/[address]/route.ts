import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const backendRes = await fetchFromBackend<{ success: boolean; data?: any; error?: string }>(
      `/api/dao/eligibility/${address}`
    );

    if (backendRes) {
      return NextResponse.json(backendRes);
    }

    return NextResponse.json({
      success: false,
      error: 'Eligibility verification service unavailable',
    }, { status: 503 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to check eligibility';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
