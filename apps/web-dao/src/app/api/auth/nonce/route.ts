import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { queryNeon } from '../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { address } = (await req.json()) as { address?: string };
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    const canonicalAddress = address.trim().toLowerCase();
    const nonce = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 300 * 1000); // 5 minutes TTL

    await queryNeon(
      `INSERT INTO "AuthNonce" (id, address, nonce, "expiresAt", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
      [canonicalAddress, nonce, expiresAt.toISOString()]
    );

    return NextResponse.json({
      success: true,
      data: { nonce },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate nonce';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
