import { NextRequest, NextResponse } from 'next/server';
import { getMatrixBaseUrl } from '@/config/matrixTree';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  const isLocal =
    req.nextUrl.hostname === 'localhost' ||
    req.nextUrl.hostname === '127.0.0.1';

  const base = process.env.NEXT_PUBLIC_MATRIX_URL
    ? process.env.NEXT_PUBLIC_MATRIX_URL.replace(/\/+$/, '')
    : isLocal
      ? `http://${req.nextUrl.hostname}:3001`
      : getMatrixBaseUrl();

  const target = `${base.replace(/\/+$/, '')}/gate${search}`;

  return NextResponse.redirect(target, 307);
}
