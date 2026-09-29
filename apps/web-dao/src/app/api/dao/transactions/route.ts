import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address') || '';
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';

  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/transactions?address=${address}&page=${page}&limit=${limit}`
  );
  if (backendRes && backendRes.success) {
    return NextResponse.json(backendRes);
  }

  return NextResponse.json({
    success: true,
    data: {
      transactions: [],
      total: 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: 1,
      bttPriceUsd: 0.056001,
      priceSource: 'trobchain',
    },
  });
}
