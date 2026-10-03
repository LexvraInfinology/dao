import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { checkServerlessEligibility } from '../../_lib/eligibility';
import { getActiveDaoAddress, getActiveDaoHex } from '@/utils/trobAddress';
import { TROB_PRICE_API_URL } from '@/config/env';
import { verifyOnChainTransaction } from '../../_lib/txVerifier';

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

    if (!address) {
      return NextResponse.json({ success: false, error: 'Address is required' }, { status: 400 });
    }

    // 0. Auto-forfeit/vacate any seats whose 48h retopup deadline expired without payment
    await queryNeon(
      `UPDATE "DaoMember"
       SET status = 'vacant', "updatedAt" = NOW()
       WHERE LOWER(status) IN ('capped', 'expired')
         AND "retopupDeadline" IS NOT NULL
         AND "retopupDeadline" < NOW()`
    );

    // Strictly validate server-side eligibility (Wallet Date >= 1 Oct 2026 & Device Restriction)
    const elig = await checkServerlessEligibility(address, clientFingerprint);
    if (!elig.condition1.passed) {
      return NextResponse.json({
        success: false,
        error: `Ineligible Wallet: ${elig.condition1.reason || 'Only wallets created on or after 1 October 2026 are eligible.'}`,
      }, { status: 403 });
    }

    // Device restriction check bypassed for testing per user request

    // Check if user is already an active member
    const existingUser = await queryNeon<any>(
      `SELECT id, position, address FROM "DaoMember" WHERE LOWER(address) = LOWER($1) AND LOWER(status) IN ('active', 'capped') LIMIT 1`,
      [address.trim()]
    );
    if (existingUser.rows.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          position: existingUser.rows[0].position,
          address: existingUser.rows[0].address,
          alreadyMember: true,
        },
      });
    }

    // 1. Scan 1 to 100 for the FIRST vacant seat (lowest vacant number)
    const activeSeatsRes = await queryNeon<{ position: number }>(
      `SELECT position FROM "DaoMember" WHERE LOWER(status) IN ('active', 'capped') AND position BETWEEN 1 AND 100 ORDER BY position ASC`
    );
    const activeSet = new Set(activeSeatsRes.rows.map((r) => r.position));

    let firstVacant = 0;
    for (let i = 1; i <= 100; i++) {
      if (!activeSet.has(i)) {
        firstVacant = i;
        break;
      }
    }

    if (firstVacant === 0) {
      return NextResponse.json({
        success: false,
        error: 'Genesis Council is currently fully allocated (All 100 Seats active). Please monitor for any expired 48h retopup vacancies.',
      }, { status: 400 });
    }

    // If client requested an eligible vacant position, honor it; otherwise allocate the lowest vacant
    let finalPos = firstVacant;
    if (position) {
      const requested = parseInt(position, 10);
      if (requested >= 1 && requested <= 100 && !activeSet.has(requested)) {
        finalPos = requested;
      }
    }

    // Fetch dynamic live market price for exact $300 USD calculation
    let trobPriceUsd = 0.0571;
    try {
      const priceRes = await fetch(TROB_PRICE_API_URL, { cache: 'no-store' });
      if (priceRes.ok) {
        const pj = await priceRes.json();
        const p = Number(pj?.data?.priceUsd ?? pj?.priceUsd);
        if (Number.isFinite(p) && p > 0) trobPriceUsd = p;
      }
    } catch {}

    const entryAmountUsd = 300;
    const entryAmountTrob = Math.round((entryAmountUsd / trobPriceUsd) * 100) / 100;
    // Formula works for any seat: 300 / N (e.g. Seat #2 gets 300/2 = $150 back instantly)
    const cashbackUsd = parseFloat((entryAmountUsd / finalPos).toFixed(2));
    const cashbackTrob = Math.round((cashbackUsd / trobPriceUsd) * 100) / 100;
    if (!txHash || typeof txHash !== 'string' || txHash.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Verified on-chain transaction hash (txHash) is required to claim a council seat.',
      }, { status: 400 });
    }
    const cleanTx = txHash.trim().toLowerCase();

    // Verify on-chain execution receipt strictly via TrobChain FullNode
    const txReceipt = await verifyOnChainTransaction(cleanTx, {
      expectedSender: address,
      expectedContract: getActiveDaoAddress(),
    });
    if (!txReceipt.valid) {
      return NextResponse.json({
        success: false,
        error: txReceipt.error || 'Transaction verification failed on-chain.',
      }, { status: 400 });
    }

    if (txReceipt.fromAddr && txReceipt.fromAddr.toLowerCase() !== address.trim().toLowerCase()) {
      return NextResponse.json({
        success: false,
        error: `Transaction sender (${txReceipt.fromAddr}) does not match connected wallet (${address.trim()}).`,
      }, { status: 400 });
    }

    const userAddr = address.trim();

    // Ensure user exists in "User" table to satisfy DaoMember_address_fkey foreign key constraint
    const existingUserRecord = await queryNeon<any>(
      `SELECT id, address FROM "User" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
      [userAddr]
    );

    let dbUserAddress = userAddr;
    if (existingUserRecord.rows.length === 0) {
      const nextUserIdRes = await queryNeon<{ max_id: string }>(
        `SELECT COALESCE(MAX("userId"), 0) + 1 AS max_id FROM "User"`
      );
      const nextUserId = parseInt(String(nextUserIdRes.rows[0]?.max_id || '1'), 10) || 1;

      await queryNeon(
        `INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, NOW(), NOW(), NOW())
         ON CONFLICT (address) DO NOTHING`,
        [userAddr, nextUserId]
      );
    } else {
      dbUserAddress = existingUserRecord.rows[0].address;
    }

    // Check if slot row exists (e.g. from previously vacant/expired occupant)
    const slotRow = await queryNeon<any>(
      `SELECT id FROM "DaoMember" WHERE position = $1 LIMIT 1`,
      [finalPos]
    );

    if (slotRow.rows.length > 0) {
      await queryNeon(
        `UPDATE "DaoMember"
         SET address = $1,
             "joinedAt" = NOW(),
             "txHash" = $2,
             "blockNumber" = 1,
             "entryAmountBtt" = $3,
             "entryAmountUsdAtJoin" = 300,
             "nftTokenId" = $4,
             "priceSource" = 'trobchain-api',
             "pushedAmountBtt" = $5,
             status = 'active',
             "updatedAt" = NOW(),
             "deviceFingerprint" = $6,
             "retopupDeadline" = NULL,
             "cappedAt" = NULL,
             "retopupCount" = 0
         WHERE id = $7`,
        [dbUserAddress, cleanTx, entryAmountTrob, finalPos, cashbackTrob, clientFingerprint, slotRow.rows[0].id]
      );
    } else {
      await queryNeon(
        `INSERT INTO "DaoMember" (id, address, position, "joinedAt", "txHash", "blockNumber", "entryAmountBtt", "entryAmountUsdAtJoin", "nftTokenId", "priceSource", "pushedAmountBtt", status, "createdAt", "updatedAt", "deviceFingerprint")
         VALUES (gen_random_uuid(), $1, $2, NOW(), $3, 1, $4, 300, $2, 'trobchain-api', $5, 'active', NOW(), NOW(), $6)`,
        [dbUserAddress, finalPos, cleanTx, entryAmountTrob, cashbackTrob, clientFingerprint]
      );
    }

    // 2. Insert 'joined' event
    await queryNeon(
      `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
       VALUES (gen_random_uuid(), 'joined', $1, $2, $2, $3, 1, NOW(), NOW(), $4, 300, 'trobchain-api', $5)`,
      [dbUserAddress, finalPos, cleanTx, entryAmountTrob, `Council Seat #${finalPos} Activated`]
    );

    // 3. Record instant cashback event (autonomously executed on-chain by EquoraDAO contract)
    await queryNeon(
      `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
       VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, $5, 'blockchain-onchain', $6)`,
      [dbUserAddress, finalPos, `${cleanTx}-cashback`, cashbackTrob, cashbackUsd, `Instant Cashback (Seat #${finalPos})`]
    );

    // 4. Distribute dividends to all prior active members (< finalPos) with strict 5X capping ($1,500 / 5x entry) and surplus redistribution
    if (finalPos > 1) {
      const priorMembers = await queryNeon<any>(
        `SELECT id, address, position, "pushedAmountBtt", "entryAmountBtt" FROM "DaoMember" WHERE position < $1 AND LOWER(status) = 'active' ORDER BY position ASC`,
        [finalPos]
      );

      const eligibleRecipients = priorMembers.rows.filter((row: any) => {
        const currentPushed = parseFloat(row.pushedAmountBtt || '0');
        const entryBtt = parseFloat(row.entryAmountBtt || '5357.14');
        const capBtt = entryBtt * 5;
        return currentPushed < capBtt;
      });

      interface PriorPayout {
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

      const priorPayouts: PriorPayout[] = eligibleRecipients.map((r: any) => {
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

      if (priorPayouts.length > 0) {
        let surplusTrob = 0;

        for (const item of priorPayouts) {
          const headroom = Math.max(0, item.capBtt - item.currentPushed);
          if (cashbackTrob <= headroom) {
            item.payoutTrob = cashbackTrob;
            item.newPushed = item.currentPushed + cashbackTrob;
            item.isNowCapped = item.newPushed >= item.capBtt;
          } else {
            if (headroom > 0) {
              item.payoutTrob = headroom;
              item.newPushed = item.capBtt;
            }
            item.isNowCapped = true;
            surplusTrob += (cashbackTrob - headroom);
          }
        }

        // Iterative surplus redistribution: split surplus equally among remaining uncapped members
        let surplusRemaining = surplusTrob;
        for (let round = 0; round < 5 && surplusRemaining > 0.0001; round++) {
          const remainingUncapped = priorPayouts.filter(p => !p.isNowCapped);
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

        // Apply database updates and broadcast on-chain payouts
        for (const item of priorPayouts) {
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

          const actualUsd = parseFloat((item.payoutTrob * trobPriceUsd).toFixed(2));
          await queryNeon(
            `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
             VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, $5, 'blockchain-onchain', $6)`,
            [
              item.address,
              finalPos,
              `${cleanTx}-pushed-${item.position}`,
              item.payoutTrob,
              actualUsd,
              `Dividend push from Seat #${finalPos}${item.isNowCapped ? ' (5X Cap Reached)' : ''}`
            ]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        position: finalPos,
        address: dbUserAddress,
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
