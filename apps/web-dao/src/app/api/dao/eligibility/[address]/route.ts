import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';
import { checkServerlessEligibility } from '../../../_lib/eligibility';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    if (!address) {
      return NextResponse.json({ success: false, error: 'Address is required' }, { status: 400 });
    }

    // Try Express backend if configured
    const backendRes = await fetchFromBackend<{ success: boolean; data?: any; error?: string }>(
      `/api/dao/eligibility/${address}`
    );

    if (backendRes && backendRes.success && backendRes.data) {
      return NextResponse.json(backendRes);
    }

    // Serverless Direct Execution
    const eligibility = await checkServerlessEligibility(address);
    return NextResponse.json({
      success: true,
      data: eligibility,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to check eligibility';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
