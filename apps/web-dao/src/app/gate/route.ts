import { NextRequest, NextResponse } from 'next/server';
import { getMatrixBaseUrl } from '@/config/matrixTree';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  const isLocal =
    req.nextUrl.hostname === 'localhost' ||
    req.nextUrl.hostname === '127.0.0.1' ||
    req.nextUrl.port === '3000';

  const base = isLocal ? 'http://localhost:3001' : getMatrixBaseUrl();
  const target = `${base.replace(/\/+$/, '')}/gate${search}`;

  return NextResponse.redirect(target, 307);
}
