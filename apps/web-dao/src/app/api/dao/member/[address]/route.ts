import { NextRequest, NextResponse } from 'next/server';
import { queryNeon } from '../../../_lib/neonDb';
import { getOnChainMemberPosition, getOnChainUnderfundedReservation } from '../../../_lib/txVerifier';
import { toTrobBase58, toTronHex } from '@/utils/trobAddress';
import { calculateMemberEarnedUsd } from '@/utils/daoEconomics';
import { toUtcIso } from '../../../_lib/dateUtils';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: { address: string } }
) {
  try {
    const address = context?.params?.address;
    if (!address) {
      return NextResponse.json({ success: false, error: 'Address required' }, { status: 400 });
    }

    // Blockchain smart contract is the absolute Single Source of Truth.
    // We do not proxy through unverified backend caches.

    const bttPriceUsd = 0.0572;
    const entryAmountUsd = 300;
    const earningsCapUsd = 1500;
    const entryAmountBtt = Math.round((entryAmountUsd / bttPriceUsd) * 100) / 100;
    const earningsCapBtt = Math.round((earningsCapUsd / bttPriceUsd) * 100) / 100;

    // 2. Direct Serverless Neon Lookup & On-Chain Verification
    try {
      const cleanAddr = address.trim();
      const base58Addr = toTrobBase58(cleanAddr);
      const hexAddr = toTronHex(cleanAddr);

      let onChainPos = await getOnChainMemberPosition(cleanAddr);
      if (onChainPos === 0 && base58Addr !== cleanAddr) {
        onChainPos = await getOnChainMemberPosition(base58Addr);
      }
      if (onChainPos === 0 && hexAddr !== cleanAddr) {
        onChainPos = await getOnChainMemberPosition(hexAddr);
      }

      let isUnderfundedReservation = false;
      let reservedPos = 0;

      // Check Neon DB first or alongside on-chain position
      const { rows } = await queryNeon<any>(
        `SELECT * FROM "DaoMember" 
         WHERE (LOWER(address) IN (LOWER($1), LOWER($2), LOWER($3)) OR (position = $4 AND $4 > 0))
         ORDER BY CASE WHEN LOWER(address) IN (LOWER($1), LOWER($2), LOWER($3)) THEN 0 ELSE 1 END
         LIMIT 1`,
        [cleanAddr, base58Addr, hexAddr, onChainPos]
      );

      let m = rows[0];

      // Check on-chain reservation mapping from EquoraDAOv2 unconditionally
      const onChainRes = (await getOnChainUnderfundedReservation(cleanAddr))
        || (base58Addr !== cleanAddr ? await getOnChainUnderfundedReservation(base58Addr) : null)
        || (hexAddr !== cleanAddr ? await getOnChainUnderfundedReservation(hexAddr) : null);

    if (onChainRes && onChainRes.isReserved) {
      isUnderfundedReservation = true;
      reservedPos = onChainRes.reservedSeat;
      onChainPos = reservedPos;
      if (m && m.status !== 'underfunded') {
        const prevDep = onChainRes.previousDepositSun / 1e6;
        await queryNeon(
          `UPDATE "DaoMember"
           SET status = 'underfunded',
               "entryAmountBtt" = $1,
               "retopupDeadline" = COALESCE("retopupDeadline", NOW() + INTERVAL '48 hours'),
               "updatedAt" = NOW()
           WHERE id = $2`,
          [prevDep, m.id]
        );
        m.status = 'underfunded';
        m.entryAmountBtt = prevDep;
      }
    } else if (m && m.status === 'underfunded' && onChainPos > 0) {
      // Member has completed top-up on-chain! Unlock to active
      await queryNeon(
        `UPDATE "DaoMember"
         SET status = 'active',
             "retopupDeadline" = NULL,
             "entryAmountUsdAtJoin" = 300,
             "updatedAt" = NOW()
         WHERE id = $1`,
        [m.id]
      );
      m.status = 'active';
    } else if (m && m.status === 'underfunded') {
      isUnderfundedReservation = true;
      reservedPos = m.position;
      onChainPos = reservedPos;
    }

    // If onChainPos was 0 due to network/RPC latency, but DB has active record, use DB position
    if (onChainPos === 0 && m && m.position > 0) {
      onChainPos = m.position;
    }

    // If neither on-chain nor DB record exists, address is not a member
    if (onChainPos === 0 && !isUnderfundedReservation && !m) {
      return NextResponse.json({
        success: true,
        data: {
          isMember: false,
          position: null,
          nftTokenId: null,
          status: 'unclaimed',
          joinedAt: undefined,
          pushedAmountBtt: 0,
          pushedAmountTrob: 0,
          pushedAmountUsdEstimate: 0,
          earningsCapBtt,
          earningsCapTrob: earningsCapBtt,
          earningsCapUsd,
          capProgressPct: 0,
          isCapped: false,
          entryAmountBtt,
          entryAmountTrob: entryAmountBtt,
          entryAmountUsdEstimate: entryAmountUsd,
          directReferralsCount: 0,
          isQualified: false,
          userId: null,
        },
      });
    }

    // If member has underfunded/provisional deposit status, lock governance & rewards
    if ((m && m.status === 'underfunded') || isUnderfundedReservation) {
      const entryTrob = onChainRes?.isReserved
        ? onChainRes.previousDepositSun / 1e6
        : parseFloat(m?.entryAmountBtt || '0');
      const entryUsd = parseFloat(m?.entryAmountUsdAtJoin || '0') || Math.round(entryTrob * 0.055 * 100) / 100;
      
      let retopupDeadline = m?.retopupDeadline ? toUtcIso(m.retopupDeadline) : null;
      if (!retopupDeadline) {
        // Start 48-hour retopup window
        retopupDeadline = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
        if (m?.id) {
          await queryNeon(
            `UPDATE "DaoMember" SET "retopupDeadline" = $1, "updatedAt" = NOW() WHERE id = $2`,
            [retopupDeadline, m.id]
          );
        }
      }
      const diffMs = new Date(retopupDeadline).getTime() - Date.now();
      const retopupTimeRemainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
      const isExpired = retopupTimeRemainingSeconds === 0;

      if (isExpired && m?.id && m.status !== 'vacant') {
        await queryNeon(
          `UPDATE "DaoMember" SET status = 'vacant', "updatedAt" = NOW() WHERE id = $1`,
          [m.id]
        ).catch(() => {});
      }

      const pos = m?.position || onChainPos || reservedPos;

      return NextResponse.json({
        success: true,
        data: {
          isMember: true,
          position: pos,
          nftTokenId: m?.nftTokenId || pos,
          status: isExpired ? 'expired' : 'underfunded',
          joinedAt: m?.joinedAt,
          entryAmountBtt: entryTrob,
          entryAmountTrob: entryTrob,
          entryAmountUsdEstimate: entryUsd,
          pushedAmountBtt: 0,
          pushedAmountTrob: 0,
          pushedAmountUsdEstimate: 0,
          earningsCapBtt,
          earningsCapTrob: earningsCapBtt,
          earningsCapUsd,
          capProgressPct: 0,
          isCapped: false,
          isQualified: false,
          underfunded: true,
          retopupDeadline,
          retopupTimeRemainingSeconds,
          isExpired,
          notice: `Incomplete Deposit: Council Seat #${pos} was activated with only ${entryTrob} TROB (~$${entryUsd}). A minimum of $300 USD is strictly required to unlock Council Governance, Matrix Pools & VIP Lounge.`,
          userId: m?.id,
        },
      });
    }

    // If DB record missing but confirmed on-chain, auto-sync 1:1 using canonical Base58 address
    if (!m && onChainPos > 0) {
      const canonicalAddr = base58Addr || cleanAddr;
      const userCheck = await queryNeon<any>(
        `SELECT id, address FROM "User" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
        [canonicalAddr]
      );
      if (userCheck.rows.length === 0) {
        const maxIdRes = await queryNeon<any>(`SELECT COALESCE(MAX("userId"), 0) + 1 AS next_id FROM "User"`);
        const nextId = parseInt(maxIdRes.rows[0]?.next_id || '10001', 10);
        await queryNeon(
          `INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, NOW(), NOW(), NOW())
           ON CONFLICT (address) DO NOTHING`,
          [canonicalAddr, nextId]
        );
      }
      const inserted = await queryNeon<any>(
        `INSERT INTO "DaoMember" (id, address, position, "joinedAt", "txHash", "blockNumber", "entryAmountBtt", "entryAmountUsdAtJoin", "nftTokenId", "priceSource", "pushedAmountBtt", status, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, NOW(), 'onchain-verified', 1, $3, 300, $2, 'blockchain-onchain', $4, 'active', NOW(), NOW())
         ON CONFLICT (position) DO UPDATE SET address = $1, status = 'active', "updatedAt" = NOW()
         RETURNING *`,
        [canonicalAddr, onChainPos, entryAmountBtt, Math.round((entryAmountBtt / onChainPos) * 100) / 100]
      );
      m = inserted.rows[0];
    }

    if (m) {
      const pushedBtt = parseFloat(m.pushedAmountBtt || '0');
      const entryBtt = parseFloat(m.entryAmountBtt || String(entryAmountBtt));
      const capBtt = entryBtt * 5;
      const isUnderfunded = m.status === 'underfunded';
      const exactPushedUsd = isUnderfunded ? 0 : (m.status === 'capped' ? earningsCapUsd : calculateMemberEarnedUsd(onChainPos || m.position, m.status, 93));
      const isCapped = !isUnderfunded && (m.status === 'capped' || (capBtt > 0 && pushedBtt >= capBtt) || exactPushedUsd >= earningsCapUsd);

      let retopupDeadline = toUtcIso(m.retopupDeadline);
      let retopupTimeRemainingSeconds: number | null = null;
      let isExpired = false;

      if (isCapped && !retopupDeadline) {
        // Start 48-hour retopup window on cap hit
        retopupDeadline = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
        await queryNeon(
          `UPDATE "DaoMember"
           SET "retopupDeadline" = $1, "cappedAt" = NOW(), status = 'capped', "updatedAt" = NOW()
           WHERE id = $2`,
          [retopupDeadline, m.id]
        );
      }

      if (retopupDeadline) {
        const diffMs = new Date(retopupDeadline).getTime() - Date.now();
        retopupTimeRemainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
        if (retopupTimeRemainingSeconds === 0) {
          isExpired = true;
          if (m.status !== 'vacant') {
            await queryNeon(
              `UPDATE "DaoMember" SET status = 'vacant', "updatedAt" = NOW() WHERE id = $1`,
              [m.id]
            );
          }
        }
      }

      const isMember = !isExpired && m.status !== 'vacant' && m.status !== 'defaulted';
      const capProgressPct = isUnderfunded ? 0 : isCapped ? 100 : Math.min(100, Math.round((exactPushedUsd / earningsCapUsd) * 100));

      return NextResponse.json({
        success: true,
        data: {
          isMember,
          position: isMember ? onChainPos : null,
          nftTokenId: m.nftTokenId || onChainPos,
          status: isExpired ? 'vacant' : (m.status || (isCapped ? 'capped' : 'ACTIVE')),
          joinedAt: m.joinedAt,
          pushedAmountBtt: isCapped ? Math.max(pushedBtt, capBtt) : (isUnderfunded ? 0 : pushedBtt),
          pushedAmountTrob: isCapped ? Math.max(pushedBtt, capBtt) : (isUnderfunded ? 0 : pushedBtt),
          pushedAmountUsdEstimate: exactPushedUsd,
          earningsCapBtt: capBtt,
          earningsCapTrob: capBtt,
          earningsCapUsd,
          capProgressPct,
          isCapped,
          underfunded: isUnderfunded,
          retopupDeadline,
          retopupTimeRemainingSeconds,
          entryAmountBtt: entryBtt,
          entryAmountTrob: entryBtt,
          entryAmountUsdEstimate: entryAmountUsd,
          directReferralsCount: 0,
          isQualified: isMember,
          userId: m.id,
        },
      });
    }
  } catch (dbErr) {
    console.warn('[member route] Error:', dbErr);
  }

    // Non-member response
    return NextResponse.json({
      success: true,
      data: {
        isMember: false,
        position: null,
        nftTokenId: null,
        status: 'unclaimed',
        joinedAt: undefined,
        pushedAmountBtt: 0,
        pushedAmountTrob: 0,
        pushedAmountUsdEstimate: 0,
        earningsCapBtt,
        earningsCapTrob: earningsCapBtt,
        earningsCapUsd,
        capProgressPct: 0,
        isCapped: false,
        entryAmountBtt,
        entryAmountTrob: entryAmountBtt,
        entryAmountUsdEstimate: entryAmountUsd,
        directReferralsCount: 0,
        isQualified: false,
        userId: null,
      },
    });
  } catch (error: any) {
    console.error('[API member/[address]] FATAL ERROR:', error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error), stack: error?.stack },
      { status: 500 }
    );
  }
}
