import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '../../_lib/jwt';
import { queryNeon } from '../../_lib/neonDb';
import { toTrobBase58, toTronHex } from '@/utils/trobAddress';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyJwt<{ address: string; chainId?: number }>(token);
    if (!decoded || !decoded.address) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session token' }, { status: 401 });
    }

    const addr = decoded.address.trim();
    const base58Addr = toTrobBase58(addr);
    const hexAddr = toTronHex(addr);

    const userRes = await queryNeon<any>(
      `SELECT u.id, u.address, u."userId", u."sponsorAddress", u."isQualified",
              m.position as "daoPosition", m.status as "daoStatus", m."nftTokenId"
       FROM "User" u
       LEFT JOIN "DaoMember" m ON LOWER(m.address) = LOWER(u.address)
       WHERE LOWER(u.address) IN (LOWER($1), LOWER($2), LOWER($3))
       LIMIT 1`,
      [addr, base58Addr, hexAddr]
    );

    const user = userRes.rows[0];
    const isMember = Boolean(user && user.daoPosition && user.daoStatus !== 'vacant' && user.daoStatus !== 'blank');

    return NextResponse.json({
      success: true,
      data: {
        address: user?.address || base58Addr || addr,
        chainId: decoded.chainId || 1000,
        isRegistered: Boolean(user),
        userId: user?.userId ?? null,
        sponsor: user?.sponsorAddress ?? null,
        isQualified: user?.isQualified ?? false,
        daoMember: isMember,
        daoPosition: user?.daoPosition ?? null,
        nftBadgesCount: user?.nftTokenId ? 1 : 0,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve session';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
