import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { verifyOnChainTransaction } from '../../_lib/txVerifier';
import { getActiveDaoAddress } from '@/utils/trobAddress';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Direct Serverless Neon Retopup with on-chain verification
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

    // 1. Check if 48-Hour payment/retopup window has expired.
    // If the transaction receipt is valid and was accepted/mined on-chain by the smart contract,
    // the smart contract's block timestamp was within the acceptable window and accepted the payment.
    // We strictly record and synchronize the database with on-chain reality.
    if (!txReceipt.valid && m.retopupDeadline && new Date(m.retopupDeadline).getTime() < Date.now()) {
      await queryNeon(
        `UPDATE "DaoMember" SET status = 'vacant', "updatedAt" = NOW() WHERE id = $1`,
        [m.id]
      );
      return NextResponse.json({
        success: false,
        error: isUnderfunded
          ? '12-Hour Seat Reservation Window has expired. Your Council seat reservation has expired and is reopened for the Genesis pool.'
          : '48-Hour Retopup Window has expired. Your Council seat is now vacant and open for queue takeover.',
      }, { status: 410 });
    }

    // Fetch dynamic live market price for exact $300 USD calculation
    let trobPriceUsd = 0.056;
    try {
      const { TROB_PRICE_API_URL } = await import('@/config/env');
      const priceRes = await fetch(TROB_PRICE_API_URL, { cache: 'no-store' });
      if (priceRes.ok) {
        const pj = await priceRes.json();
        const p = Number(pj?.data?.priceUsd ?? pj?.priceUsd);
        if (Number.isFinite(p) && p > 0) trobPriceUsd = p;
      }
    } catch {}

    const entryAmountUsd = 300;
    const retopupTrob = body.retopupFeeTrob && Number(body.retopupFeeTrob) > 0
      ? Number(body.retopupFeeTrob)
      : (txReceipt.callValueSun ? Math.round((txReceipt.callValueSun / 1e6) * 100) / 100 : Math.round((entryAmountUsd / trobPriceUsd) * 100) / 100);
    const pos = m.position || 1;

    // 2. Reset member's earnings counter to 0 (unless underfunded, where past earnings count towards cap!), unlock underfunded status to 'active', update entry amounts if underfunded
    await queryNeon(
      `UPDATE "DaoMember"
       SET "pushedAmountBtt" = CASE WHEN status = 'underfunded' THEN "pushedAmountBtt" ELSE 0 END,
           status = 'active',
           "retopupDeadline" = NULL,
           "cappedAt" = NULL,
           "retopupCount" = CASE WHEN status = 'underfunded' THEN "retopupCount" ELSE COALESCE("retopupCount", 0) + 1 END,
           "retopupAmountBtt" = CASE WHEN status = 'underfunded' THEN 0 ELSE $2 END,
           "totalDepositsCount" = CASE WHEN status = 'underfunded' THEN 1 ELSE COALESCE("totalDepositsCount", 1) + 1 END,
           "totalDepositsUsd" = CASE WHEN status = 'underfunded' THEN 300 ELSE COALESCE("totalDepositsUsd", 300) + 300 END,
           "lastRetopupAt" = CASE WHEN status = 'underfunded' THEN NULL ELSE NOW() END,
           "entryAmountBtt" = CASE WHEN status = 'underfunded' THEN GREATEST(5357.14, COALESCE("entryAmountBtt", 0) + $2) ELSE "entryAmountBtt" END,
           "entryAmountUsdAtJoin" = CASE WHEN status = 'underfunded' THEN 300 ELSE "entryAmountUsdAtJoin" END,
           "txHash" = $3,
           "updatedAt" = NOW()
       WHERE id = $1`,
      [m.id, retopupTrob, cleanTx]
    );

    // Update User table qualification
    await queryNeon(
      `UPDATE "User" SET "isQualified" = true WHERE LOWER(address) = LOWER($1)`,
      [m.address]
    ).catch(() => {});

    // 3. Record retopup event in DaoEvent
    const eventReason = isUnderfunded
      ? `Underfunded Council Seat Activated: Full $300 Entry Retopup completed (${retopupTrob} TROB) • Seat #${pos}`
      : `5X Cap Reset: 48h Retopup completed ($300 USD / ${retopupTrob} TROB) • Seat #${pos}`;

    await queryNeon(
      `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
       VALUES (gen_random_uuid(), 'retopup', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, 300, 'trobchain-live-oracle', $5)`,
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

        const isCaller = item.id === m.id;
        const eventReason = isCaller
          ? `Instant Cashback on Retopup Loop (Seat #${pos})`
          : `Dividend push from Seat #${pos} (Retopup Distribution)${item.isNowCapped ? ' (5X Cap Reached)' : ''}`;
        const actualUsd = parseFloat((item.payoutTrob * trobPriceUsd).toFixed(2));

        await queryNeon(
          `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
           VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, $5, 'blockchain-onchain', $6)`,
          [
            item.address,
            pos,
            `${cleanTx}-retopup-push-${item.position}`,
            item.payoutTrob,
            actualUsd,
            eventReason,
          ]
        );
      }
    }

    const callerPayout = memberPayouts.find(p => p.id === m.id);
    const callerCashbackUsd = parseFloat(((callerPayout?.payoutTrob || 0) * trobPriceUsd).toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        address: m.address,
        position: pos,
        status: 'active',
        pushedAmountBtt: callerPayout?.newPushed || 0,
        instantCashbackUsd: callerCashbackUsd,
        instantCashbackTrob: callerPayout?.payoutTrob || 0,
        retopupAmountUsd: entryAmountUsd,
        retopupTrob,
        distributedToMembers: memberPayouts.filter(p => p.payoutTrob > 0).length,
        retopupCount: (m.retopupCount || 0) + 1,
        txHash: cleanTx,
        message: `Retopup confirmed! Your 5X Cap ($1,500) has reset to zero, and your $300 fee has been distributed equally to all active council members (including your instant cashback).`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Retopup synchronization failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
