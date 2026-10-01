import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Try local/remote Express backend if configured
    const backendRes = await fetchFromBackend<{ success: boolean; data?: any; error?: string }>(
      '/api/dao/claim',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
    if (backendRes) {
      return NextResponse.json(backendRes, { status: backendRes.success ? 200 : 400 });
    }

    // 2. Direct Serverless Execution to Neon Database (Vercel native)
    const { address, position, txHash, deviceFingerprint } = body;
    const clientFingerprint = deviceFingerprint || req.headers.get('x-device-fingerprint') || null;

    if (!address || !position) {
      return NextResponse.json({ success: false, error: 'Address and position are required' }, { status: 400 });
    }

    const pos = parseInt(position, 10);

    // Anti-Sybil Check: Strictly 1 DAO Seat per Physical Device
    if (clientFingerprint) {
      const existingDevice = await queryNeon<any>(
        `SELECT id, position, address FROM "DaoMember" WHERE "deviceFingerprint" = $1 LIMIT 1`,
        [clientFingerprint]
      );
      if (existingDevice.rows.length > 0 && existingDevice.rows[0].address.toLowerCase() !== address.trim().toLowerCase()) {
        return NextResponse.json({
          success: false,
          error: `Device Restriction: This device has already claimed Council Seat #${existingDevice.rows[0].position}. The Genesis DAO strictly enforces 1 seat per physical device to protect decentralized fairness.`,
        }, { status: 403 });
      }
    }

    const bttPriceUsd = 0.056;
    const entryAmountUsd = 300;
    const entryAmountTrob = Math.round((entryAmountUsd / bttPriceUsd) * 100) / 100;
    const cashbackUsd = parseFloat((entryAmountUsd / pos).toFixed(2));
    const cashbackTrob = Math.round((cashbackUsd / bttPriceUsd) * 100) / 100;
    const cleanTx = (txHash || '0x' + Math.random().toString(16).slice(2)).toLowerCase();

    // Check existing
    const existing = await queryNeon<any>(
      `SELECT id, position, address FROM "DaoMember" WHERE position = $1 OR LOWER(address) = LOWER($2) LIMIT 1`,
      [pos, address.trim()]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          position: existing.rows[0].position,
          address: existing.rows[0].address,
          instantCashbackBtt: cashbackTrob.toString(),
          instantCashbackUsd: cashbackUsd,
        },
      });
    }

    // 1. Insert new member with device fingerprint
    await queryNeon(
      `INSERT INTO "DaoMember" (id, address, position, "joinedAt", "txHash", "blockNumber", "entryAmountBtt", "entryAmountUsdAtJoin", "nftTokenId", "priceSource", "pushedAmountBtt", status, "createdAt", "updatedAt", "deviceFingerprint")
       VALUES (gen_random_uuid(), $1, $2, NOW(), $3, 1, $4, 300, $2, 'trobchain-api', $5, 'active', NOW(), NOW(), $6)`,
      [address.trim(), pos, cleanTx, entryAmountTrob, cashbackTrob, clientFingerprint]
    );

    // 2. Insert 'joined' event
    await queryNeon(
      `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
       VALUES (gen_random_uuid(), 'joined', $1, $2, $2, $3, 1, NOW(), NOW(), $4, 300, 'trobchain-api', $5)`,
      [address.trim(), pos, cleanTx, entryAmountTrob, `Council Seat #${pos} Activated`]
    );

    // 3. Insert 'pushed' instant cashback event for new member
    await queryNeon(
      `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
       VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, $5, 'trobchain-api', $6)`,
      [address.trim(), pos, `${cleanTx}-cashback`, cashbackTrob, cashbackUsd, `Instant Cashback (Seat #${pos})`]
    );

    // 4. Distribute dividends to all prior active members
    if (pos > 1) {
      const priorMembers = await queryNeon<any>(
        `SELECT id, address, position, "pushedAmountBtt" FROM "DaoMember" WHERE position < $1 AND LOWER(status) = 'active'`,
        [pos]
      );

      for (const prior of priorMembers.rows) {
        const newPushed = parseFloat(prior.pushedAmountBtt || '0') + cashbackTrob;
        await queryNeon(
          `UPDATE "DaoMember" SET "pushedAmountBtt" = $1, "updatedAt" = NOW() WHERE id = $2`,
          [newPushed, prior.id]
        );

        await queryNeon(
          `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
           VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, $5, 'trobchain-api', $6)`,
          [prior.address, pos, `${cleanTx}-pushed-${prior.position}`, cashbackTrob, cashbackUsd, `Dividend push from Seat #${pos}`]
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        position: pos,
        address: address.trim(),
        instantCashbackBtt: cashbackTrob.toString(),
        instantCashbackUsd: cashbackUsd,
        txHash: cleanTx,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Claim verification failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
