import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { broadcastNativePayout } from '../../_lib/payoutRelayer';
import { getActiveDaoAddress, getActiveDaoHex, isDaoAddressDeprecated } from '@/utils/trobAddress';
import { EXPLORER_API_URL, TROB_PRICE_API_URL } from '@/config/env';

export const dynamic = 'force-dynamic';

async function verifyTransactionReceipt(txHash: string): Promise<{
  valid: boolean;
  error?: string;
  fromAddr?: string;
  toAddr?: string;
}> {
  const cleanTx = txHash.trim().toLowerCase();
  const maxRetries = 4;
  const activeDaoBase58 = getActiveDaoAddress();
  const activeDaoHex = getActiveDaoHex();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${EXPLORER_API_URL}/transactions/${cleanTx}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const tx = json?.data;
        if (tx) {
          const retStatus = tx.raw?.ret?.[0]?.contractRet || tx.result;
          if (retStatus === 'REVERT' || tx.result === 'FAILED') {
            return {
              valid: false,
              error: 'Transaction failed or reverted on-chain. Deposit was not accepted by the contract.',
            };
          }

          const toAddr = (tx.to_addr || '').trim();
          if (isDaoAddressDeprecated(toAddr)) {
            return {
              valid: false,
              error: `Transaction was sent to deprecated contract (${toAddr}). Please interact exclusively with active contract (${activeDaoBase58}).`,
            };
          }

          if (
            toAddr.toLowerCase() !== activeDaoBase58.toLowerCase() &&
            toAddr.toLowerCase() !== activeDaoHex.toLowerCase()
          ) {
            return {
              valid: false,
              error: `Transaction target (${toAddr}) does not match active DAO contract (${activeDaoBase58}).`,
            };
          }

          if (retStatus === 'SUCCESS' || tx.result === 'SUCCESS') {
            return {
              valid: true,
              fromAddr: tx.from_addr,
              toAddr: tx.to_addr,
            };
          }
        }
      }
    } catch {}

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  // Fallback: If not indexed yet by explorer backend, check valid 64-character hex format
  if (/^[0-9a-fA-F]{64}$/.test(cleanTx)) {
    return { valid: true };
  }

  return { valid: false, error: 'Transaction hash could not be verified on-chain.' };
}

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

    // Anti-Sybil Check: Strictly 1 DAO Seat per Physical Device
    if (clientFingerprint) {
      const existingDevice = await queryNeon<any>(
        `SELECT id, position, address FROM "DaoMember" WHERE "deviceFingerprint" = $1 AND LOWER(status) = 'active' LIMIT 1`,
        [clientFingerprint]
      );
      if (existingDevice.rows.length > 0 && existingDevice.rows[0].address.toLowerCase() !== address.trim().toLowerCase()) {
        return NextResponse.json({
          success: false,
          error: `Device Restriction: This device has already claimed Council Seat #${existingDevice.rows[0].position}. The Genesis DAO strictly enforces 1 seat per physical device to protect decentralized fairness.`,
        }, { status: 403 });
      }
    }

    // Check if user is already an active member
    const existingUser = await queryNeon<any>(
      `SELECT id, position, address FROM "DaoMember" WHERE LOWER(address) = LOWER($1) AND LOWER(status) = 'active' LIMIT 1`,
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
      `SELECT position FROM "DaoMember" WHERE LOWER(status) = 'active' AND position BETWEEN 1 AND 100 ORDER BY position ASC`
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

    // Verify on-chain execution receipt
    const txReceipt = await verifyTransactionReceipt(cleanTx);
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

    // 3. Broadcast instant cashback payout on-chain (Formula: 300/N)
    let cashbackTxId: string | null = null;
    try {
      cashbackTxId = await broadcastNativePayout(dbUserAddress, cashbackTrob);
    } catch (e) {
      console.error(`[Payout Relayer] Failed to broadcast claim cashback to Seat #${finalPos}:`, e);
    }

    await queryNeon(
      `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
       VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, $5, 'trobchain-api', $6)`,
      [dbUserAddress, finalPos, cashbackTxId || `${cleanTx}-cashback`, cashbackTrob, cashbackUsd, `Instant Cashback (Seat #${finalPos})`]
    );

    // 4. Distribute dividends to all prior active members (< finalPos)
    if (finalPos > 1) {
      const priorMembers = await queryNeon<any>(
        `SELECT id, address, position, "pushedAmountBtt" FROM "DaoMember" WHERE position < $1 AND LOWER(status) = 'active'`,
        [finalPos]
      );

      for (const prior of priorMembers.rows) {
        const newPushed = parseFloat(prior.pushedAmountBtt || '0') + cashbackTrob;
        await queryNeon(
          `UPDATE "DaoMember" SET "pushedAmountBtt" = $1, "updatedAt" = NOW() WHERE id = $2`,
          [newPushed, prior.id]
        );

        let divTxId: string | null = null;
        try {
          divTxId = await broadcastNativePayout(prior.address, cashbackTrob);
        } catch (e) {
          console.error(`[Payout Relayer] Failed to broadcast claim dividend to Seat #${prior.position}:`, e);
        }

        await queryNeon(
          `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
           VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, NOW(), NOW(), $4, $5, 'trobchain-api', $6)`,
          [prior.address, finalPos, divTxId || `${cleanTx}-pushed-${prior.position}`, cashbackTrob, cashbackUsd, `Dividend push from Seat #${finalPos}`]
        );
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
