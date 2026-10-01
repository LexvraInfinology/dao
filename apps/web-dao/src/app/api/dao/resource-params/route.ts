import { NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';

export const dynamic = 'force-dynamic';

const DEFAULT_RESOURCE_PARAMS = {
  params: {
    energyPerTx: 46009,
    bandwidthPerTx: 378,
    energyPerTrob: 2150,
    bandwidthPerTrob: 80,
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
  dao: {
    targetTxPerDay: 50,
    dailyEnergyRequired: 2300450,
    dailyBandwidthRequired: 18900,
    energyStakeTrob: 1070,
    bandwidthStakeTrob: 237,
    totalStakeTrob: 1307,
  },
  matrix: {
    targetTxPerDay: 5,
    dailyEnergyRequired: 230045,
    dailyBandwidthRequired: 1890,
    energyStakeTrob: 107,
    bandwidthStakeTrob: 24,
    totalStakeTrob: 131,
  },
  officialSrAddress: 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY',
  minWalletCreationDate: '2026-10-01T00:00:00.000Z',
};

export async function GET() {
  try {
    const backendRes = await fetchFromBackend<{ success: boolean; data?: any; error?: string }>(
      '/api/dao/resource-params'
    );

    if (backendRes && backendRes.success && backendRes.data) {
      return NextResponse.json(backendRes);
    }

    return NextResponse.json({
      success: true,
      data: DEFAULT_RESOURCE_PARAMS,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      success: true,
      data: DEFAULT_RESOURCE_PARAMS,
    });
  }
}
