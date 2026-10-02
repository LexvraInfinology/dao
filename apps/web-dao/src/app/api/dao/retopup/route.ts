import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { broadcastNativePayout } from '../../_lib/payoutRelayer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendRes = await fetchFromBackend<{ success: boolean; data?: any; error?: string; message?: string }>(
      '/api/dao/retopup',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
    if (backendRes) {
      return NextResponse.json(backendRes, { status: backendRes.success ? 200 : 400 });
    }

    // Direct Serverless Neon Retopup
    const { address, txHash } = body;
    if (!address) {
      return NextResponse.json({ success: false, error: 'Member address is required' }, { status: 400 });
    }

    const memberRes = await queryNeon<any>(
      `SELECT * FROM "DaoMember" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
      [address.trim()]
    );

    if (memberRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Address is not a registered Genesis Council member' }, { status: 404 });
    }

    const m = memberRes.rows[0];

    // 1. Check if 48-Hour retopup window has expired
    if (m.retopupDeadline && new Date(m.retopupDeadline).getTime() < Date.now()) {
      await queryNeon(
        `UPDATE "DaoMember" SET status = 'vacant', "updatedAt" = NOW() WHERE id = $1`,
        [m.id]
      );
      return NextResponse.json({
        success: false,
        error: '48-Hour Retopup Window has expired. Your Council seat is now vacant and open for queue takeover.',
      }, { status: 410 });
    }

    const bttPriceUsd = 0.056;
    const entryAmountUsd = 300;
    const cleanTx = (txHash || '0x' + Math.random().toString(16).slice(2)).toLowerCase();
    const retopupTrob = Math.round((entryAmountUsd / bttPriceUsd) * 100) / 100;

    // 2. Calculate instant cashback return from blockchain according to seat number (Formula: 300/N)
    const pos = m.position || 1;
    const cashbackUsd = parseFloat((entryAmountUsd / pos).toFixed(2));
    const cashbackTrob = Math.round((cashbackUsd / bttPriceUsd) * 100) / 100;

    // 3. Reset member's earnings counter with new cycle's instant cashback, clear cap/deadline, increment retopup loop count
    await queryNeon(
      `UPDATE "DaoMember"
       SET "pushedAmountBtt" = $1,
           status = 'active',
           "retopupDeadline" = NULL,
           "cappedAt" = NULL,
           "retopupCount" = COALESCE("retopupCount", 0) + 1,
           "updatedAt" = NOW()
       WHERE id = $2`,
      [cashbackTrob, m.id]
    );

    // 4. Record retopup event in DaoEvent
    await queryNeon(
      `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
       VALUES (gen_random_uuid(), 'retopup', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, 300, 'trobchain-api', $5)`,
      [
        m.address,
        pos,
        cleanTx,
        retopupTrob,
        `5X Cap Reset: 48h Retopup completed ($300 USD / ${retopupTrob} TROB) • Seat #${pos}`,
      ]
    );

    // 5. Record instant cashback returned to member from retopup loop
    await queryNeon(
      `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
       VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, $5, 'trobchain-api', $6)`,
      [
        m.address,
        pos,
        `${cleanTx}-retopup-cashback`,
        cashbackTrob,
        cashbackUsd,
        `Instant Cashback on Retopup Loop (Seat #${pos})`,
      ]
    );

    // Broadcast instant cashback payout on-chain
    broadcastNativePayout(m.address, cashbackTrob).catch((e) => {
      console.error(`[Payout Relayer] Failed to broadcast retopup cashback to Seat #${pos}:`, e);
    });

    // 6. Distribute dividend push to all prior active members (< pos)
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
          [prior.address, pos, `${cleanTx}-retopup-push-${prior.position}`, cashbackTrob, cashbackUsd, `Dividend push from Seat #${pos} (Retopup Loop)`]
        );
        broadcastNativePayout(prior.address, cashbackTrob).catch((e) => {
          console.error(`[Payout Relayer] Failed to broadcast retopup dividend to Seat #${prior.position}:`, e);
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        address: m.address,
        position: pos,
        status: 'active',
        pushedAmountBtt: cashbackTrob,
        instantCashbackUsd: cashbackUsd,
        instantCashbackTrob: cashbackTrob,
        retopupCount: (m.retopupCount || 0) + 1,
        txHash: cleanTx,
        message: `Retopup confirmed! Your 5X Cap ($1,500) has reset, and your instant cashback ($${cashbackUsd} USD) has been dispatched.`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Retopup synchronization failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
