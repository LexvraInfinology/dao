import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '100';

  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/members?page=${page}&limit=${limit}`
  );
  if (backendRes && backendRes.success) {
    return NextResponse.json(backendRes);
  }

  return NextResponse.json({
    success: true,
    data: {
      members: [],
      total: 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    },
  });
}
