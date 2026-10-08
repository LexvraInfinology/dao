import { Interface, formatUnits } from 'ethers';
import { FULLNODE_RPC_URL, TROB_PRICE_API_URL } from '@/config/env';
import { getActiveDaoHex, toTronHex, toTrobBase58 } from '@/utils/trobAddress';
import { queryNeon } from './neonDb';
import { toUtcIso } from './dateUtils';
import { getOnChainUnderfundedReservation } from './txVerifier';

let cachedTrobPrice = 0.037757;
let cachedTrobPriceTime = 0;

async function getLiveTrobPrice(): Promise<number> {
  const now = Date.now();
  if (now - cachedTrobPriceTime < 30_000 && cachedTrobPrice > 0) {
    return cachedTrobPrice;
  }
  try {
    const res = await fetch(TROB_PRICE_API_URL, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      const p = Number(data?.data?.priceUsd ?? data?.priceUsd);
      if (Number.isFinite(p) && p > 0) {
        cachedTrobPrice = p;
        cachedTrobPriceTime = now;
      }
    }
  } catch {}
  return cachedTrobPrice;
}

export interface SyncedMemberState {
  isMember: boolean;
  position: number | null;
  nftTokenId: number | null;
  address: string;
  status: 'active' | 'capped' | 'underfunded' | 'vacant' | 'unclaimed';
  isCapped: boolean;
  retopupDeadline: string | null;
  retopupTimeRemainingSeconds: number | null;
  retopupCount: number;
  entryAmountTrob: number;
  entryAmountUsd: number;
  totalEarnedTrob: number;
  currentCycleUsd: number;
  lifetimeUsd: number;
  capProgressPct: number;
  source: 'onchain' | 'database';
  joinedAt?: string;
  txHash?: string;
  userId?: string | number | null;
  fallbackClaimableTrob?: number;
  poolClaimableTrob?: number;
  unearnedDebtTrob?: number;
}

const iface = new Interface([
  'function getMemberDetails(address) view returns (bool isMember, uint256 position, uint256 nftTokenId, uint256 fallbackClaimable, uint256 totalEarned, bool isCapped, uint256 retopupDeadline, bool isBlank, uint256 poolClaimable)',
  'function memberPosition(address) view returns (uint256)',
  'function daoMembers(uint256) view returns (address)',
]);

/**
 * Checks on-chain smart contract FIRST as the absolute single source of truth.
 * Automatically updates Neon database (DaoMember) to match on-chain state instantly.
 * If data is not on-chain (e.g. underfunded provisional reservations or RPC issues),
 * seamlessly falls back to the database.
 */
export async function getAndSyncMemberState(
  addressOrPosition: string | number
): Promise<SyncedMemberState> {
  const isPosInput = typeof addressOrPosition === 'number' || /^\d+$/.test(String(addressOrPosition).trim());
  const inputPos = isPosInput ? parseInt(String(addressOrPosition).trim(), 10) : 0;
  const inputAddr = !isPosInput ? String(addressOrPosition).trim() : '';

  let resolvedAddr = inputAddr;
  let resolvedHex = inputAddr ? toTronHex(inputAddr) : '';
  let resolvedB58 = inputAddr ? toTrobBase58(inputAddr) : '';

  const daoHex = getActiveDaoHex();

  // 1. If position was provided, find the member address
  if (inputPos > 0 && !resolvedAddr) {
    try {
      // Check on-chain daoMembers(index)
      const res = await fetch(`${FULLNODE_RPC_URL}/wallet/triggerconstantcontract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_address: daoHex,
          contract_address: daoHex,
          function_selector: 'daoMembers(uint256)',
          parameter: (inputPos - 1).toString(16).padStart(64, '0'),
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.constant_result?.[0]) {
          const raw = json.constant_result[0];
          const clean = '41' + raw.slice(-40);
          if (clean !== '410000000000000000000000000000000000000000') {
            resolvedHex = clean;
            resolvedB58 = toTrobBase58(clean);
            resolvedAddr = resolvedB58;
          }
        }
      }
    } catch {}

    // Fallback lookup from DB if contract index did not return
    if (!resolvedAddr) {
      try {
        const dbRes = await queryNeon<any>(
          `SELECT address FROM "DaoMember" WHERE position = $1 LIMIT 1`,
          [inputPos]
        );
        if (dbRes.rows[0]?.address) {
          resolvedAddr = dbRes.rows[0].address;
          resolvedHex = toTronHex(resolvedAddr);
          resolvedB58 = toTrobBase58(resolvedAddr);
        }
      } catch {}
    }
  }

  // ─── 2. CHECK ON-CHAIN FIRST ────────────────────────────────────────────────
  let onChainDetails: {
    isMember: boolean;
    position: number;
    totalEarnedTrob: number;
    isCapped: boolean;
    retopupDeadlineIso: string | null;
    isBlank: boolean;
    fallbackClaimableTrob: number;
    poolClaimableTrob: number;
  } | null = null;

  if (resolvedHex) {
    try {
      const detailRes = await fetch(`${FULLNODE_RPC_URL}/wallet/triggerconstantcontract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_address: resolvedHex,
          contract_address: daoHex,
          function_selector: 'getMemberDetails(address)',
          parameter: resolvedHex.replace(/^41/, '').padStart(64, '0'),
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(3500),
      });

      if (detailRes.ok) {
        const detailJson = await detailRes.json();
        if (detailJson.constant_result?.[0]) {
          const decoded = iface.decodeFunctionResult('getMemberDetails', '0x' + detailJson.constant_result[0]);
          const dlSec = Number(decoded.retopupDeadline);
          onChainDetails = {
            isMember: Boolean(decoded.isMember),
            position: Number(decoded.position),
            totalEarnedTrob: parseFloat(formatUnits(decoded.totalEarned, 6)),
            isCapped: Boolean(decoded.isCapped),
            retopupDeadlineIso: dlSec > 0 ? new Date(dlSec * 1000).toISOString() : null,
            isBlank: Boolean(decoded.isBlank),
            fallbackClaimableTrob: parseFloat(formatUnits(decoded.fallbackClaimable, 6)),
            poolClaimableTrob: parseFloat(formatUnits(decoded.poolClaimable, 6)),
          };
        }
      }
    } catch (err) {
      console.warn('[onChainMemberSync] On-chain RPC error:', err);
    }
  }

  // ─── 3. IF FOUND ON-CHAIN: SYNC TO DATABASE INSTANTLY ───────────────────────
  if (onChainDetails && onChainDetails.isMember && onChainDetails.position > 0) {
    const pos = onChainDetails.position;
    const canonicalAddr = resolvedB58 || resolvedAddr;
    const isCapped = onChainDetails.isCapped;
    const isBlank = onChainDetails.isBlank;
    const deadlineIso = onChainDetails.retopupDeadlineIso;
    const isDeadlinePassed = Boolean(deadlineIso && new Date(deadlineIso).getTime() <= Date.now());
    const onChainStatus: 'active' | 'capped' | 'vacant' = (isBlank || (isCapped && isDeadlinePassed)) ? 'vacant' : (isCapped ? 'capped' : 'active');
    const earnedTrob = onChainDetails.totalEarnedTrob;

    // Check existing DB record
    let dbMember: any = null;
    try {
      const dbCheck = await queryNeon<any>(
        `SELECT m.id, m.status, m."retopupDeadline", m."retopupCount", m."pushedAmountBtt", m."entryAmountBtt", m."joinedAt", m."txHash", u."userId"
         FROM "DaoMember" m
         LEFT JOIN "User" u ON LOWER(u.address) = LOWER(m.address)
         WHERE m.position = $1 OR LOWER(m.address) = LOWER($2)
         ORDER BY CASE WHEN m.position = $1 THEN 0 ELSE 1 END
         LIMIT 1`,
        [pos, canonicalAddr]
      );
      dbMember = dbCheck.rows[0] || null;
    } catch {}

    let retopupCount = parseInt(dbMember?.retopupCount || '0', 10);

    // Auto-detect on-chain retopup: if DB was previously capped, but on-chain is now active/uncapped
    if (dbMember) {
      const prevWasCapped = dbMember.status === 'capped';
      if (prevWasCapped && !isCapped && onChainStatus === 'active') {
        retopupCount = Math.max(retopupCount + 1, 1);
      }
    }

    // Automatically update DB according to on-chain truth
    try {
      if (dbMember) {
        await queryNeon(
          `UPDATE "DaoMember"
           SET status = $1,
               address = $2,
               "retopupDeadline" = $3,
               "cappedAt" = CASE WHEN $4 THEN COALESCE("cappedAt", NOW()) ELSE NULL END,
               "retopupCount" = $5,
               "totalDepositsCount" = CASE WHEN status = 'underfunded' THEN 1 ELSE 1 + $5 END,
               "totalDepositsUsd" = CASE WHEN status = 'underfunded' THEN 300.00 ELSE 300.00 + ($5 * 300.00) END,
               "lastRetopupAt" = CASE WHEN $5 > 0 THEN COALESCE("lastRetopupAt", NOW()) ELSE NULL END,
               "entryAmountBtt" = CASE WHEN status = 'underfunded' THEN 5357.14 ELSE "entryAmountBtt" END,
               "entryAmountUsdAtJoin" = CASE WHEN status = 'underfunded' THEN 300.00 ELSE "entryAmountUsdAtJoin" END,
               "pushedAmountBtt" = $6,
               "updatedAt" = NOW()
           WHERE id = $7`,
          [
            onChainStatus,
            canonicalAddr,
            isCapped ? deadlineIso : null,
            isCapped,
            retopupCount,
            earnedTrob,
            dbMember.id,
          ]
        );
        await queryNeon(
          `UPDATE "User" SET "isQualified" = true WHERE LOWER(address) = LOWER($1)`,
          [canonicalAddr]
        ).catch(() => {});
      } else {
        // Auto-insert member into User and DaoMember
        const maxIdRes = await queryNeon<any>(`SELECT COALESCE(MAX("userId"), 0) + 1 AS next_id FROM "User"`);
        const nextId = parseInt(maxIdRes.rows[0]?.next_id || '10001', 10);
        await queryNeon(
          `INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, NOW(), NOW(), NOW())
           ON CONFLICT (address) DO NOTHING`,
          [canonicalAddr, nextId]
        );
        await queryNeon(
          `INSERT INTO "DaoMember" (
             id, address, position, "joinedAt", "txHash", "blockNumber",
             "entryAmountBtt", "entryAmountUsdAtJoin", "nftTokenId",
             "priceSource", "pushedAmountBtt", status, "retopupDeadline", "retopupCount", "createdAt", "updatedAt"
           )
           VALUES (
             gen_random_uuid(), $1, $2, NOW(), 'onchain-live-synced', 1,
             5357.14, 300, $2, 'trobchain-mainnet', $3, $4, $5, $6, NOW(), NOW()
           )
           ON CONFLICT (position) DO UPDATE
           SET address = $1, status = $4, "retopupDeadline" = $5, "retopupCount" = $6, "pushedAmountBtt" = $3, "updatedAt" = NOW()`,
          [canonicalAddr, pos, earnedTrob, onChainStatus, isCapped ? deadlineIso : null, retopupCount]
        );
      }
    } catch (dbErr) {
      console.warn('[onChainMemberSync] DB update error:', dbErr);
    }

    // Compute cycle earnings vs lifetime according to smart contract parameters
    const CAP_TROB = 26785.714285;
    const CONTRACT_PEG = 0.056;
    const cycleEarnedUsd = isCapped ? 1500 : Math.min(1499.99, Math.round((earnedTrob * CONTRACT_PEG) * 100) / 100);
    const capPct = isCapped ? 100 : Math.min(99.9, Math.round((earnedTrob / CAP_TROB) * 1000) / 10);
    const lifetimeUsd = Math.round(((retopupCount * 1500) + cycleEarnedUsd) * 100) / 100;

    let timeRemainingSec: number | null = null;
    if (isCapped && deadlineIso) {
      timeRemainingSec = Math.max(0, Math.floor((new Date(deadlineIso).getTime() - Date.now()) / 1000));
    }

    return {
      isMember: onChainStatus !== 'vacant',
      position: pos,
      nftTokenId: pos,
      address: canonicalAddr,
      status: onChainStatus,
      isCapped: onChainStatus === 'capped',
      retopupDeadline: onChainStatus === 'capped' ? deadlineIso : null,
      retopupTimeRemainingSeconds: onChainStatus === 'capped' ? timeRemainingSec : null,
      retopupCount,
      entryAmountTrob: (onChainStatus === 'active' || onChainStatus === 'capped') ? 5357.14 : parseFloat(dbMember?.entryAmountBtt || '5357.14'),
      entryAmountUsd: 300,
      totalEarnedTrob: earnedTrob,
      currentCycleUsd: cycleEarnedUsd,
      lifetimeUsd,
      capProgressPct: capPct,
      source: 'onchain',
      joinedAt: dbMember?.joinedAt,
      txHash: dbMember?.txHash,
      userId: dbMember?.userId ? String(dbMember.userId) : String(pos),
      fallbackClaimableTrob: onChainDetails.fallbackClaimableTrob,
      poolClaimableTrob: onChainDetails.poolClaimableTrob,
    };
  }

  // ─── 4. FALLBACK: IF DATA NOT ON-CHAIN, TAKE FROM DATABASE ──────────────────
  try {
    let dbMember: any = null;
    if (resolvedAddr) {
      const res = await queryNeon<any>(
        `SELECT * FROM "DaoMember" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
        [resolvedAddr]
      );
      dbMember = res.rows[0];
    }
    if (!dbMember && inputPos > 0) {
      const res = await queryNeon<any>(
        `SELECT * FROM "DaoMember" WHERE position = $1 LIMIT 1`,
        [inputPos]
      );
      dbMember = res.rows[0];
    }

    // Check if user has an underfunded reservation on-chain
    const reservation = resolvedAddr ? await getOnChainUnderfundedReservation(resolvedAddr) : null;
    if (reservation && reservation.isReserved) {
      const prevDep = reservation.previousDepositSun / 1e6;
      const pos = reservation.reservedSeat;
      return {
        isMember: true,
        position: pos,
        nftTokenId: pos,
        address: resolvedB58 || resolvedAddr,
        status: 'underfunded',
        isCapped: false,
        retopupDeadline: dbMember?.retopupDeadline ? toUtcIso(dbMember.retopupDeadline) : null,
        retopupTimeRemainingSeconds: dbMember?.retopupDeadline
          ? Math.max(0, Math.floor((new Date(toUtcIso(dbMember.retopupDeadline)!).getTime() - Date.now()) / 1000))
          : null,
        retopupCount: 0,
        entryAmountTrob: prevDep,
        entryAmountUsd: Math.round(prevDep * 0.056 * 100) / 100,
        totalEarnedTrob: 0,
        currentCycleUsd: 0,
        lifetimeUsd: 0,
        capProgressPct: 0,
        source: 'database',
        joinedAt: dbMember?.joinedAt,
        txHash: dbMember?.txHash,
        userId: dbMember?.id,
        unearnedDebtTrob: reservation.unearnedDebtSun / 1e6,
      };
    }

    if (dbMember) {
      let currentStatus = dbMember.status || 'active';
      const isUnderfunded = currentStatus === 'underfunded';
      const isCapped = currentStatus === 'capped';
      const retopupCount = parseInt(dbMember.retopupCount || '0', 10);
      const pushedBtt = parseFloat(dbMember.pushedAmountBtt || '0');
      const dl = (isCapped || isUnderfunded) ? toUtcIso(dbMember.retopupDeadline) : null;
      const dlSec = dl ? Math.max(0, Math.floor((new Date(dl).getTime() - Date.now()) / 1000)) : null;

      // Automatically transition seat to vacant if 48h retopup deadline has passed for capped members
      if (isCapped && dlSec !== null && dlSec <= 0) {
        await queryNeon(
          `UPDATE "DaoMember" SET status = 'vacant', "updatedAt" = NOW() WHERE id = $1`,
          [dbMember.id]
        ).catch(() => {});
        currentStatus = 'vacant';
      }

      if (currentStatus === 'vacant' || currentStatus === 'blank') {
        return {
          isMember: false,
          position: dbMember.position,
          nftTokenId: dbMember.nftTokenId || dbMember.position,
          address: dbMember.address,
          status: 'vacant',
          isCapped: false,
          retopupDeadline: null,
          retopupTimeRemainingSeconds: 0,
          retopupCount,
          entryAmountTrob: 0,
          entryAmountUsd: 0,
          totalEarnedTrob: 0,
          currentCycleUsd: 0,
          lifetimeUsd: 0,
          capProgressPct: 0,
          source: 'database',
          joinedAt: dbMember.joinedAt,
          txHash: dbMember.txHash,
          userId: dbMember.id,
        };
      }

      const CAP_TROB = 26785.714285;
      const CONTRACT_PEG = 0.056;
      const cycleEarnedUsd = isUnderfunded ? 0 : (isCapped ? 1500 : Math.min(1499.99, Math.round(pushedBtt * CONTRACT_PEG * 100) / 100));
      const capPct = isUnderfunded ? 0 : (isCapped ? 100 : Math.min(99.9, Math.round((pushedBtt / CAP_TROB) * 1000) / 10));
      const lifetimeUsd = isUnderfunded ? 0 : Math.round(((retopupCount * 1500) + cycleEarnedUsd) * 100) / 100;

      return {
        isMember: true,
        position: dbMember.position,
        nftTokenId: dbMember.nftTokenId || dbMember.position,
        address: dbMember.address,
        status: currentStatus,
        isCapped,
        retopupDeadline: dl,
        retopupTimeRemainingSeconds: dlSec,
        retopupCount,
        entryAmountTrob: parseFloat(dbMember.entryAmountBtt || '0'),
        entryAmountUsd: parseFloat(dbMember.entryAmountUsdAtJoin || '300'),
        totalEarnedTrob: pushedBtt,
        currentCycleUsd: cycleEarnedUsd,
        lifetimeUsd,
        capProgressPct: capPct,
        source: 'database',
        joinedAt: dbMember.joinedAt,
        txHash: dbMember.txHash,
        userId: dbMember.id,
      };
    }
  } catch (err) {
    console.warn('[onChainMemberSync] DB fallback error:', err);
  }

  return {
    isMember: false,
    position: null,
    nftTokenId: null,
    address: resolvedAddr,
    status: 'unclaimed',
    isCapped: false,
    retopupDeadline: null,
    retopupTimeRemainingSeconds: null,
    retopupCount: 0,
    entryAmountTrob: 0,
    entryAmountUsd: 0,
    totalEarnedTrob: 0,
    currentCycleUsd: 0,
    lifetimeUsd: 0,
    capProgressPct: 0,
    source: 'database',
  };
}
