import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { checkServerlessEligibility } from '../../_lib/eligibility';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address } = body as { address?: string };

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ success: false, error: 'Wallet address is required.' }, { status: 400 });
    }

    const backendRes = await fetchFromBackend<{ success: boolean; data?: any; error?: string; message?: string }>(
      '/api/dao/stake-resources',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    if (backendRes && backendRes.success && backendRes.data) {
      return NextResponse.json(backendRes);
    }

    const eligibility = await checkServerlessEligibility(address);
    return NextResponse.json({
      success: true,
      eligible: eligibility.eligibleToDeposit,
      data: eligibility,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stake resources request failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
