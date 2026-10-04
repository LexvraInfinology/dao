import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { verifyOnChainTransaction } from '../../_lib/txVerifier';
import { getActiveDaoAddress } from '@/utils/trobAddress';

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

    if (!txHash || typeof txHash !== 'string' || txHash.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Verified on-chain transaction hash (txHash) is required for retopup.',
      }, { status: 400 });
    }
    const cleanTx = txHash.trim().replace(/^0x/, '').toLowerCase();

    // Strictly verify on-chain transaction receipt from TrobChain FullNode
    const txReceipt = await verifyOnChainTransaction(cleanTx, {
      expectedSender: address,
      expectedContract: getActiveDaoAddress(),
    });

    if (!txReceipt.valid) {
      return NextResponse.json({
        success: false,
        error: txReceipt.error || 'Transaction verification failed on blockchain.',
      }, { status: 400 });
    }

    const cleanAddr = address.trim();
    const { toTrobBase58, toTronHex } = await import('@/utils/trobAddress');
    const base58Addr = toTrobBase58(cleanAddr);
    const hexAddr = toTronHex(cleanAddr);

    const memberRes = await queryNeon<any>(
      `SELECT * FROM "DaoMember" 
       WHERE LOWER(address) IN (LOWER($1), LOWER($2), LOWER($3))
         AND LOWER(status) IN ('active', 'capped', 'underfunded')
       LIMIT 1`,
      [cleanAddr, base58Addr, hexAddr]
    );

    if (memberRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Address is not a registered Genesis Council member' }, { status: 404 });
    }

    const m = memberRes.rows[0];
    const isUnderfunded = m.status === 'underfunded';

    // 1. Check if 48-Hour retopup window has expired (only for capped members)
    if (!isUnderfunded && m.retopupDeadline && new Date(m.retopupDeadline).getTime() < Date.now()) {
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
    const retopupTrob = Math.round((entryAmountUsd / bttPriceUsd) * 100) / 100;
    const pos = m.position || 1;

    // 2. Reset member's earnings counter to 0, unlock underfunded status to 'active', update entry amounts if underfunded
    await queryNeon(
      `UPDATE "DaoMember"
       SET "pushedAmountBtt" = 0,
           status = 'active',
           "retopupDeadline" = NULL,
           "cappedAt" = NULL,
           "retopupCount" = COALESCE("retopupCount", 0) + 1,
           "entryAmountBtt" = CASE WHEN status = 'underfunded' THEN $2 ELSE "entryAmountBtt" END,
           "entryAmountUsdAtJoin" = CASE WHEN status = 'underfunded' THEN 300 ELSE "entryAmountUsdAtJoin" END,
           "updatedAt" = NOW()
       WHERE id = $1`,
      [m.id, retopupTrob]
    );

    // 3. Record retopup event in DaoEvent
    const eventReason = isUnderfunded
      ? `Underfunded Council Seat Activated: Full $300 Entry Retopup completed (${retopupTrob} TROB) • Seat #${pos}`
      : `5X Cap Reset: 48h Retopup completed ($300 USD / ${retopupTrob} TROB) • Seat #${pos}`;

    await queryNeon(
      `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
       VALUES (gen_random_uuid(), 'retopup', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, 300, 'trobchain-api', $5)`,
      [
        m.address,
        pos,
        cleanTx,
        retopupTrob,
        eventReason,
      ]
    );

    // 4. Distribute the $300 retopup fee equally to ALL active uncapped members (including retopup caller)
    const allMembersRes = await queryNeon<any>(
      `SELECT id, address, position, "pushedAmountBtt", "entryAmountBtt"
       FROM "DaoMember"
       WHERE LOWER(status) = 'active'
       ORDER BY position ASC`
    );

    const eligibleRecipients = allMembersRes.rows.filter((row: any) => {
      const currentPushed = parseFloat(row.pushedAmountBtt || '0');
      const entryBtt = parseFloat(row.entryAmountBtt || '5357.14');
      const capBtt = entryBtt * 5;
      return currentPushed < capBtt;
    });

    interface MemberPayout {
      id: string;
      address: string;
      position: number;
      entryBtt: number;
      capBtt: number;
      currentPushed: number;
      payoutTrob: number;
      newPushed: number;
      isNowCapped: boolean;
    }

    const memberPayouts: MemberPayout[] = eligibleRecipients.map((r: any) => {
      const currentPushed = parseFloat(r.pushedAmountBtt || '0');
      const entryBtt = parseFloat(r.entryAmountBtt || '5357.14');
      return {
        id: r.id,
        address: r.address,
        position: r.position,
        entryBtt,
        capBtt: entryBtt * 5,
        currentPushed,
        payoutTrob: 0,
        newPushed: currentPushed,
        isNowCapped: false,
      };
    });

    if (memberPayouts.length > 0) {
      const baseShare = retopupTrob / memberPayouts.length;
      let surplusTrob = 0;

      for (const item of memberPayouts) {
        const headroom = Math.max(0, item.capBtt - item.currentPushed);
        if (baseShare <= headroom) {
          item.payoutTrob = baseShare;
          item.newPushed = item.currentPushed + baseShare;
          item.isNowCapped = item.newPushed >= item.capBtt;
        } else {
          if (headroom > 0) {
            item.payoutTrob = headroom;
            item.newPushed = item.capBtt;
          }
          item.isNowCapped = true;
          surplusTrob += (baseShare - headroom);
        }
      }

      // Iterative surplus redistribution: split surplus equally among remaining uncapped members
      let surplusRemaining = surplusTrob;
      for (let round = 0; round < 5 && surplusRemaining > 0.0001; round++) {
        const remainingUncapped = memberPayouts.filter(p => !p.isNowCapped);
        if (remainingUncapped.length === 0) break;

        const extraShare = surplusRemaining / remainingUncapped.length;
        let nextSurplus = 0;

        for (const item of remainingUncapped) {
          const headroom = Math.max(0, item.capBtt - item.newPushed);
          if (extraShare <= headroom) {
            item.payoutTrob += extraShare;
            item.newPushed += extraShare;
            if (item.newPushed >= item.capBtt) {
              item.isNowCapped = true;
            }
          } else {
            if (headroom > 0) {
              item.payoutTrob += headroom;
              item.newPushed = item.capBtt;
            }
            item.isNowCapped = true;
            nextSurplus += (extraShare - headroom);
          }
        }
        surplusRemaining = nextSurplus;
      }

      // Apply updates and broadcast payouts
      for (const item of memberPayouts) {
        if (item.payoutTrob <= 0) continue;

        let retopupDeadline: string | null = null;
        if (item.isNowCapped) {
          const deadlineDate = new Date(Date.now() + 48 * 3600 * 1000);
          retopupDeadline = deadlineDate.toISOString();
        }

        await queryNeon(
          `UPDATE "DaoMember"
           SET "pushedAmountBtt" = $1,
               status = CASE WHEN $2 THEN 'capped' ELSE status END,
               "cappedAt" = CASE WHEN $2 THEN NOW() ELSE "cappedAt" END,
               "retopupDeadline" = CASE WHEN $2 THEN $3 ELSE "retopupDeadline" END,
               "updatedAt" = NOW()
           WHERE id = $4`,
          [item.newPushed, item.isNowCapped, retopupDeadline, item.id]
        );

        const actualUsd = parseFloat((item.payoutTrob * bttPriceUsd).toFixed(2));
        await queryNeon(
          `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
           VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, $5, 'blockchain-onchain', $6)`,
          [
            item.address,
            pos,
            `${cleanTx}-retopup-push-${item.position}`,
            item.payoutTrob,
            actualUsd,
            `Dividend push from Seat #${pos} (Retopup Distribution)${item.isNowCapped ? ' (5X Cap Reached)' : ''}`
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        address: m.address,
        position: pos,
        status: 'active',
        pushedAmountBtt: 0,
        retopupAmountUsd: entryAmountUsd,
        retopupTrob,
        distributedToMembers: memberPayouts.filter(p => p.payoutTrob > 0).length,
        retopupCount: (m.retopupCount || 0) + 1,
        txHash: cleanTx,
        message: `Retopup confirmed! Your 5X Cap ($1,500) has reset to zero, and your $300 fee has been distributed equally to all active council members.`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Retopup synchronization failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
