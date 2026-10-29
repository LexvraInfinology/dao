import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '../../_lib/jwt';
import { queryNeon } from '../../_lib/neonDb';
import { toTrobBase58 } from '@/utils/trobAddress';

export const dynamic = 'force-dynamic';

function getAuthenticatedAddress(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const decoded = verifyJwt<{ address: string }>(token);
  return decoded?.address || null;
}

export async function GET(req: NextRequest) {
  try {
    const address = getAuthenticatedAddress(req);
    if (!address) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const canonicalAddr = toTrobBase58(address).toLowerCase();

    const existing = await queryNeon<any>(
      `SELECT * FROM "UserSettings" WHERE LOWER("userAddress") = LOWER($1) LIMIT 1`,
      [canonicalAddr]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ success: true, data: existing.rows[0] });
    }

    // Default settings
    const defaults = {
      id: canonicalAddr,
      userAddress: canonicalAddr,
      notifDaoActivity: true,
      notifGovernance: true,
      notifCouncilSeat: true,
      notifMatrixBridge: true,
      notifProtocolUpdates: true,
      notifSecurityAlerts: true,
      notifMarketingEvents: false,
      privDaoProfileVisible: true,
      privWalletVisible: true,
      privSeatActivity: true,
      privGovernanceActivity: true,
      privEarningsVisible: true,
    };

    return NextResponse.json({ success: true, data: defaults });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve settings';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const address = getAuthenticatedAddress(req);
    if (!address) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const canonicalAddr = toTrobBase58(address);
    const body = (await req.json()) as Record<string, boolean>;

    const allowed = [
      'notifDaoActivity',
      'notifGovernance',
      'notifCouncilSeat',
      'notifMatrixBridge',
      'notifProtocolUpdates',
      'notifSecurityAlerts',
      'notifMarketingEvents',
      'privDaoProfileVisible',
      'privWalletVisible',
      'privSeatActivity',
      'privGovernanceActivity',
      'privEarningsVisible',
    ];

    const updates: Record<string, boolean> = {};
    for (const key of allowed) {
      if (typeof body[key] === 'boolean') {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid settings fields provided' }, { status: 400 });
    }

    // Upsert into UserSettings
    const fields = Object.keys(updates);
    const setClauses = fields.map((f, i) => `"${f}" = $${i + 2}`).join(', ');
    const values = fields.map((f) => updates[f]);

    await queryNeon(
      `INSERT INTO "UserSettings" (id, "userAddress", ${fields.map((f) => `"${f}"`).join(', ')}, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, ${fields.map((_, i) => `$${i + 2}`).join(', ')}, NOW(), NOW())
       ON CONFLICT ("userAddress") DO UPDATE
       SET ${setClauses}, "updatedAt" = NOW()`,
      [canonicalAddr, ...values]
    );

    const updated = await queryNeon<any>(
      `SELECT * FROM "UserSettings" WHERE LOWER("userAddress") = LOWER($1) LIMIT 1`,
      [canonicalAddr]
    );

    return NextResponse.json({ success: true, data: updated.rows[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update settings';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
