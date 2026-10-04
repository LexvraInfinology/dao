import { NextRequest, NextResponse } from 'next/server';
import { queryNeon } from '../../_lib/neonDb';
import { signJwt } from '../../_lib/jwt';
import { toTrobBase58, toTronHex } from '@/utils/trobAddress';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { message, signature } = (await req.json()) as {
      message?: string;
      signature?: string;
    };

    if (!message || !signature) {
      return NextResponse.json(
        { success: false, error: 'message and signature are required' },
        { status: 400 }
      );
    }

    // Extract address and nonce from SIWE message
    const addressMatch = message.match(/(?:0x[a-fA-F0-9]{40}|T[1-9A-HJ-NP-Za-km-z]{33})/);
    const nonceMatch = message.match(/Nonce:\s*([a-zA-Z0-9]+)/i);

    if (!addressMatch || !nonceMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid SIWE message format' },
        { status: 400 }
      );
    }

    const rawAddress = addressMatch[0].trim();
    const nonce = nonceMatch[1].trim();

    const canonicalAddr = rawAddress.startsWith('T')
      ? rawAddress
      : toTrobBase58(rawAddress);
    const hexAddr = toTronHex(rawAddress);

    // Validate nonce in Neon DB
    const nonceRes = await queryNeon<any>(
      `SELECT id, address, nonce, "expiresAt"
       FROM "AuthNonce"
       WHERE nonce = $1
         AND LOWER(address) IN (LOWER($2), LOWER($3), LOWER($4))
         AND "expiresAt" > NOW()
       LIMIT 1`,
      [nonce, rawAddress, canonicalAddr, hexAddr]
    );

    if (nonceRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired authentication nonce' },
        { status: 401 }
      );
    }

    // Invalidate used nonce
    await queryNeon(`DELETE FROM "AuthNonce" WHERE nonce = $1`, [nonce]);

    // Check user and dao membership in Neon DB
    const userRes = await queryNeon<any>(
      `SELECT u.id, u.address, u."userId", u."sponsorAddress", u."isQualified",
              m.position as "daoPosition", m.status as "daoStatus", m."nftTokenId"
       FROM "User" u
       LEFT JOIN "DaoMember" m ON LOWER(m.address) = LOWER(u.address)
       WHERE LOWER(u.address) IN (LOWER($1), LOWER($2), LOWER($3))
       LIMIT 1`,
      [rawAddress, canonicalAddr, hexAddr]
    );

    const user = userRes.rows[0];

    const token = signJwt({
      address: canonicalAddr,
      rawAddress,
      chainId: 1000,
    });

    const isMember = Boolean(user && user.daoPosition && user.daoStatus === 'active');

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          address: canonicalAddr,
          chainId: 1000,
          isRegistered: Boolean(user),
          userId: user?.userId ?? null,
          sponsor: user?.sponsorAddress ?? null,
          isQualified: user?.isQualified ?? false,
          daoMember: isMember,
          daoPosition: user?.daoPosition ?? null,
          nftBadgesCount: user?.nftTokenId ? 1 : 0,
        },
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication verification failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
