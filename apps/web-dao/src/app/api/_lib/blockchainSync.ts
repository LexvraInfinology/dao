import { getActiveDaoAddress, getActiveDaoHex, toTrobBase58, toTronHex } from '@/utils/trobAddress';
import { queryNeon } from './neonDb';
import type { TransactionItem } from '@/hooks/useApi';
import { EXPLORER_API_URL, IS_MAINNET, NETWORK_NAME } from '@/config/env';
import { getOnChainMemberPosition, getOnChainUnderfundedReservation } from './txVerifier';

const BACKEND_EXPLORER_API = EXPLORER_API_URL;

// In-memory cache for detailed transactions to avoid repeating HTTP requests for immutable confirmed blocks
const txDetailCache = new Map<string, any>();
let lastAccountFetchTime = 0;
let lastExplorerFailureTime = 0;
let cachedAccountTxs: any[] = [];
let cachedParsedItems: TransactionItem[] = [];

/**
 * Fetches and decodes smart contract transactions directly from TrobChain on-chain ledger.
 * Focuses on EquoraDAO.sol methods: joinDAO, retopup, claimPoolShare, claimFallback.
 */
export async function getOnChainDaoTransactions(
  filterAddress?: string | null,
  forceRefresh = false
): Promise<TransactionItem[]> {
  const now = Date.now();
  const daoAddress = getActiveDaoAddress();

  // Rate-limit account polling to once every 30 seconds unless forceRefresh is set
  if (!forceRefresh && now - lastAccountFetchTime < 30000 && cachedParsedItems.length > 0) {
    return filterItems(cachedParsedItems, filterAddress);
  }

  // Circuit breaker: if backend explorer API recently failed or timed out, do not block callers
  if (!forceRefresh && now - lastExplorerFailureTime < 60000 && cachedParsedItems.length > 0) {
    return filterItems(cachedParsedItems, filterAddress);
  }

  try {
    const addressesToQuery = [daoAddress];
    if (IS_MAINNET) {
      if (!addressesToQuery.includes('TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT')) {
        addressesToQuery.push('TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT');
      }
      if (!addressesToQuery.includes('TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto')) {
        addressesToQuery.push('TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto');
      }
      const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS || 'THoeHcGMEzNDsE8xPZuorTYgV9hje1RkGw';
      if (vaultAddress && !addressesToQuery.includes(vaultAddress)) {
        addressesToQuery.push(vaultAddress);
      }
    }
    if (filterAddress && filterAddress.trim()) {
      const cleanFilter = filterAddress.trim();
      if (!addressesToQuery.includes(cleanFilter)) {
        addressesToQuery.push(cleanFilter);
      }
    }

    const responses = await Promise.all(
      addressesToQuery.map((addr) =>
        fetch(`${BACKEND_EXPLORER_API}/accounts/${addr}/transactions?limit=100`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(6000),
        })
          .then((r) => (r.ok ? r.json() : { data: [] }))
          .catch(() => ({ data: [] }))
      )
    );

    const txMap = new Map<string, any>();
    for (const json of responses) {
      for (const tx of (json.data || [])) {
        if (tx && tx.hash && !txMap.has(tx.hash)) {
          txMap.set(tx.hash, tx);
        }
      }
    }

    if (txMap.size === 0) {
      lastExplorerFailureTime = now;
    }

    const txList = Array.from(txMap.values()).sort((a, b) => {
      const ta = Number(a.timestamp || 0);
      const tb = Number(b.timestamp || 0);
      return tb - ta;
    });

    cachedAccountTxs = txList;
    lastAccountFetchTime = now;

    const parsedItems: TransactionItem[] = [];
    const discoveredMembers: Array<{
      user: string;
      position: number;
      tokenId: number;
      txHash: string;
      timestamp: string;
      paidAmountTrob: number;
      isCompleteSeat?: boolean;
    }> = [];

    const RESET_CUTOFF_MS = process.env.DAO_SYNC_START_TIMESTAMP
      ? new Date(process.env.DAO_SYNC_START_TIMESTAMP).getTime()
      : new Date('2026-10-02T19:00:00.000Z').getTime();

    // 1. Identify DAO candidate transactions first
    const candidateTxs = txList.filter((tx) => {
      if (tx.result !== 'SUCCESS') return false;

      let txTimeMs = 0;
      if (tx.timestamp) {
        const num = Number(tx.timestamp);
        if (Number.isFinite(num) && num > 0) {
          txTimeMs = num < 10000000000 ? num * 1000 : num;
        } else {
          txTimeMs = new Date(tx.timestamp).getTime();
        }
      }
      if (txTimeMs > 0 && txTimeMs < RESET_CUTOFF_MS) return false;

      const methodName = tx.method_name || '';
      const selector = tx.function_selector || '';
      return (
        methodName === 'joinDAO' || selector === 'f63d13d7' ||
        methodName === 'completeUnderfundedSeat' || selector === '7f15ea38' || selector === '0x7f15ea38' ||
        methodName === 'retopup' || selector === 'd7b275bf' ||
        methodName === 'claimPoolShare' || selector === '85b736b4' ||
        methodName === 'claimFallback' || selector === 'a04467c6' || selector === 'a3e0acca' ||
        methodName === 'migrateGenuineMembers' || selector === '63187018'
      );
    });

    // 2. Fetch missing transaction details in batches with high resilience
    const missingCandidates = candidateTxs.filter((tx) => !txDetailCache.has(tx.hash));
    if (missingCandidates.length > 0) {
      const batchSize = 3;
      for (let i = 0; i < missingCandidates.length; i += batchSize) {
        const batch = missingCandidates.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (tx) => {
            try {
              const detailRes = await fetch(`${BACKEND_EXPLORER_API}/transactions/${tx.hash}`, {
                cache: 'no-store',
                signal: AbortSignal.timeout(8000),
              });
              if (detailRes.ok) {
                const detailJson = await detailRes.json();
                const d = detailJson.data || tx;
                if (d && (d.confirmed || d.events || d.result === 'SUCCESS')) {
                  txDetailCache.set(tx.hash, d);
                }
              }
            } catch (fetchErr) {
              console.warn(`[blockchainSync] Failed to fetch details for ${tx.hash}:`, fetchErr);
            }
          })
        );
      }
    }

    for (const tx of candidateTxs) {
      const hash = tx.hash;
      const methodName = tx.method_name || '';
      const selector = tx.function_selector || '';

      const isJoin = methodName === 'joinDAO' || selector === 'f63d13d7';
      const isCompleteSeat = methodName === 'completeUnderfundedSeat' || selector === '7f15ea38' || selector === '0x7f15ea38';
      const isRetopup = methodName === 'retopup' || selector === 'd7b275bf';
      const isClaimPool = methodName === 'claimPoolShare' || selector === '85b736b4';
      const isClaimFallback = methodName === 'claimFallback' || selector === 'a04467c6' || selector === 'a3e0acca';
      const isMigrate = methodName === 'migrateGenuineMembers' || selector === '63187018';

      if (isMigrate) {
        syncOnChainMembersState().catch(() => {});
        continue;
      }

      let detail = txDetailCache.get(hash) || tx;

      const events: any[] = detail.events || [];
      const joinEvt = events.find((e) => e.name === 'DAOPositionJoined');
      const payoutEvts = events.filter((e) => e.name === 'DAOPayoutPushed');
      const caller = (joinEvt?.args?.user || detail.from_addr || tx.from_addr || detail.ownerAddress || tx.ownerAddress || '').trim();
      const isoTime = detail.timestamp || tx.timestamp || new Date().toISOString();

      if (isJoin || isCompleteSeat) {
        // Parse joinDAO or completeUnderfundedSeat
        const completedEvt = events.find((e) => e.name === 'UnderfundedSeatCompleted');
        let pos = joinEvt?.args?.position ? parseInt(joinEvt.args.position, 10) : 0;
        if (!pos && completedEvt?.args?.seat) {
          pos = parseInt(completedEvt.args.seat, 10);
        }
        if (!pos || pos < 1 || pos > 100) {
          pos = caller ? await getOnChainMemberPosition(caller, daoAddress) : 0;
        }
        if (!pos || pos < 1 || pos > 100) {
          continue;
        }
        const tokenId = joinEvt?.args?.tokenId ? parseInt(joinEvt.args.tokenId, 10) : pos;

        // Paid amount in TROB
        let paidAmountTrob = IS_MAINNET ? 5357.14 : 8078.0;
        if (detail.call_value) {
          paidAmountTrob = Number(detail.call_value) / 1e6;
        } else if (tx.call_value) {
          paidAmountTrob = Number(tx.call_value) / 1e6;
        } else if (tx.amount) {
          paidAmountTrob = Number(tx.amount) / 1e6;
        }
        paidAmountTrob = Math.round(paidAmountTrob * 100) / 100;

        const baseMs = new Date(isoTime).getTime();
        // Deposit happened first, so in a reverse-chronological feed it appears BELOW the distributions
        const depositTime = new Date(baseMs - 2000).toISOString();
        const cashbackTime = new Date(baseMs - 1000).toISOString();

        const txBlock = tx.blockNumber || detail.blockNumber || tx.block || detail.block;

        // 1. Council Seat Activated / Fully Funded
        parsedItems.push({
          id: `${hash}-joined`,
          type: isCompleteSeat ? 'retopup' : 'joined',
          typeLabel: isCompleteSeat
            ? `Council Seat #${pos} Fully Funded (Topup Complete)`
            : `Council Seat #${pos} Activated`,
          amountBtt: paidAmountTrob,
          amountTrob: paidAmountTrob,
          amountUsd: 300,
          isPositive: false,
          from: caller,
          to: daoAddress,
          txHash: hash,
          timestamp: depositTime,
          status: 'Confirmed',
          incomingPosition: pos,
          blockNumber: txBlock ? String(txBlock) : undefined,
          contractAddress: daoAddress,
          distributionFormula: 'Rule: Fixed $300 USD deposit with 35% instant automated push to preceding council seats',
          note: `Council Seat #${pos} activated on ${NETWORK_NAME}. Soulbound Council NFT #${pos} minted.`,
        });

        discoveredMembers.push({
          user: caller,
          position: pos,
          tokenId,
          txHash: hash,
          timestamp: isoTime,
          paidAmountTrob,
          isCompleteSeat: Boolean(isCompleteSeat),
        });

        // 2. Decode DAOPayoutPushed events (Formula: 300/N)
        // Distributions happen after the deposit: they appear ABOVE the deposit in the feed
        if (payoutEvts.length > 0) {
          const sortedPayouts = [...payoutEvts].sort((a, b) => {
            const isACashback = (a.args?.recipient || '').toLowerCase() === caller.toLowerCase();
            const isBCashback = (b.args?.recipient || '').toLowerCase() === caller.toLowerCase();
            // Put instant cashback immediately above deposit, and dividend pushes above cashback
            if (isACashback && !isBCashback) return -1;
            if (!isACashback && isBCashback) return 1;
            return 0;
          });

          let divIdx = 0;
          for (const p of sortedPayouts) {
            const recipient = (p.args?.recipient || caller).trim();
            const rawAmt = p.args?.amount ? Number(p.args.amount) / 1e6 : paidAmountTrob / pos;
            const pAmt = Math.round(rawAmt * 100) / 100;
            const isCashback = recipient.toLowerCase() === caller.toLowerCase();
            const pushFromPos = p.args?.fromPosition ? parseInt(p.args.fromPosition, 10) : pos;
            const usdValue = Math.round((300 / pushFromPos) * 100) / 100;

            const itemTime = isCashback
              ? cashbackTime
              : new Date(baseMs + (++divIdx) * 100).toISOString();

            parsedItems.push({
              id: `${hash}-pushed-${recipient}`,
              type: 'pushed',
              typeLabel: isCashback
                ? `Instant Cashback (Seat #${pushFromPos})`
                : `Dividend Push from Seat #${pushFromPos}`,
              amountBtt: pAmt,
              amountTrob: pAmt,
              amountUsd: usdValue,
              isPositive: true,
              from: daoAddress,
              to: recipient,
              txHash: hash,
              timestamp: itemTime,
              status: 'Confirmed',
              incomingPosition: pushFromPos,
              blockNumber: txBlock ? String(txBlock) : undefined,
              contractAddress: daoAddress,
              distributionFormula: isCashback
                ? `Rule: Instant Cashback of $${usdValue} (${pAmt} TROB)`
                : `Rule: 300 / ${pushFromPos} USD ($${usdValue} = ${pAmt} TROB) automated on-chain push`,
              note: isCashback
                ? `Instant cashback returned directly to activating member.`
                : `Automated on-chain dividend distribution pushed from Seat #${pushFromPos} on TrobChain.`,
            });
          }
        } else {
          // If event logs weren't parsed by explorer API, synthesize according to EquoraDAO.sol on-chain rules:
          // Rule: 35% automated push is split equally among seats 1..pos (each receives 300 / pos USD)
          const shareTrob = Math.round((paidAmountTrob / pos) * 100) / 100;
          const shareUsd = Math.round((300 / pos) * 100) / 100;

          for (let seatIdx = 1; seatIdx <= pos; seatIdx++) {
            const isCashback = seatIdx === pos;
            const targetMember = discoveredMembers.find((m) => m.position === seatIdx);
            const recipient = isCashback
              ? caller
              : (targetMember?.user || (seatIdx === 1 ? 'TKRWSwmKSpLB85V26MPEWbwCWqXR9aPzNf' : ''));
            if (!recipient) continue;

            const itemTime = isCashback
              ? cashbackTime
              : new Date(baseMs - 1000 + seatIdx * 10).toISOString();

            parsedItems.push({
              id: `${hash}-push-${seatIdx}-${recipient}`,
              type: 'pushed',
              typeLabel: isCashback
                ? `Instant Cashback (Seat #${pos})`
                : `Dividend Push from Seat #${pos}`,
              amountBtt: shareTrob,
              amountTrob: shareTrob,
              amountUsd: shareUsd,
              isPositive: true,
              from: daoAddress,
              to: recipient,
              txHash: hash,
              timestamp: itemTime,
              status: 'Confirmed',
              incomingPosition: pos,
              contractAddress: daoAddress,
              distributionFormula: isCashback
                ? `Rule: Instant Cashback of $${shareUsd} (${shareTrob} TROB)`
                : `Rule: 300 / ${pos} USD ($${shareUsd} = ${shareTrob} TROB) automated on-chain push`,
              note: isCashback
                ? `Instant cashback returned directly to activating member.`
                : `Automated on-chain dividend distribution pushed from Seat #${pos} on ${NETWORK_NAME}.`,
            });
          }
        }
      } else if (isRetopup) {
        // Parse retopup
        const retopupEvt = events.find((e) => e.name === 'Retopup');
        const payoutEvts = events.filter((e) => e.name === 'DAOPayoutPushed');
        const pos = retopupEvt?.args?.position ? parseInt(retopupEvt.args.position, 10) : 1;
        const amountTrob = detail.call_value ? Number(detail.call_value) / 1e6 : 5357.143;

        parsedItems.push({
          id: `${hash}-retopup`,
          type: 'retopup',
          typeLabel: `5X Cap Retopup (Seat #${pos})`,
          amountBtt: amountTrob,
          amountTrob: amountTrob,
          amountUsd: 300,
          isPositive: false,
          from: caller,
          to: daoAddress,
          txHash: hash,
          timestamp: isoTime,
          status: 'Confirmed',
          incomingPosition: pos,
        });

        const retopupActiveCount = Math.max(1, payoutEvts.length > 0 ? payoutEvts.length : 85);
        for (const p of payoutEvts) {
          const recipient = (p.args?.recipient || caller).trim();
          const pAmt = p.args?.amount ? Number(p.args.amount) / 1e6 : amountTrob / retopupActiveCount;
          const isCashback = recipient.toLowerCase() === caller.toLowerCase();
          const pUsd = parseFloat((300 / retopupActiveCount).toFixed(2));
          parsedItems.push({
            id: `${hash}-retopup-push-${recipient}`,
            type: 'pushed',
            typeLabel: isCashback
              ? `Instant Cashback on Retopup Loop (Seat #${pos})`
              : `Dividend Push from Seat #${pos} (Retopup Loop)`,
            amountBtt: pAmt,
            amountTrob: pAmt,
            amountUsd: pUsd,
            isPositive: true,
            from: daoAddress,
            to: recipient,
            txHash: hash,
            timestamp: isoTime,
            status: 'Confirmed',
            incomingPosition: pos,
          });
        }
      }
    }

    cachedParsedItems = parsedItems;

    if (IS_MAINNET) {
      // Reconcile discovered on-chain members into Neon DB
      syncOnChainMembersToDb(discoveredMembers).catch((err) => {
        console.warn('[BlockchainSync] DB sync error:', err);
      });

      // Also trigger direct on-chain state sync
      syncOnChainMembersState().catch((err) => {
        console.warn('[BlockchainSync] Direct on-chain sync error:', err);
      });
    }

    return filterItems(cachedParsedItems, filterAddress);
  } catch (err) {
    console.error('[BlockchainSync] Failed to process on-chain transactions:', err);
    return filterItems(cachedParsedItems, filterAddress);
  }
}

let lastOnChainSyncTime = 0;
let isSyncingOnChain = false;

/**
 * Directly queries the live EquoraDAO smart contract on TrobChain Mainnet
 * and automatically synchronizes any new members or earnings into Neon DB.
 */
export async function syncOnChainMembersState(force = false): Promise<{
  onChainCount: number;
  dbCount: number;
  newMembersAdded: number;
}> {
  if (!IS_MAINNET) {
    // In testnet mode, NEVER modify or overwrite production Neon DB members!
    return { onChainCount: 1, dbCount: 1, newMembersAdded: 0 };
  }

  const now = Date.now();
  if (!force && (now - lastOnChainSyncTime < 15000 || isSyncingOnChain)) {
    return { onChainCount: 0, dbCount: 0, newMembersAdded: 0 };
  }

  isSyncingOnChain = true;
  lastOnChainSyncTime = now;

  try {
    const daoHex = getActiveDaoHex();
    const fullNode = process.env.FULLNODE_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://fullnode-one.trobchain.com';

    const res = await fetch(`${fullNode}/wallet/triggerconstantcontract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_address: daoHex,
        contract_address: daoHex,
        function_selector: 'getAllMembers()',
        parameter: '',
      }),
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });

    if (!res.ok) {
      return { onChainCount: 0, dbCount: 0, newMembersAdded: 0 };
    }

    const json = await res.json();
    if (!json.constant_result || !json.constant_result[0]) {
      return { onChainCount: 0, dbCount: 0, newMembersAdded: 0 };
    }

    const { Interface, formatUnits } = await import('ethers');
    const iface = new Interface([
      'function getAllMembers() view returns (address[])',
      'function getMemberDetails(address) view returns (bool isMember, uint256 position, uint256 nftTokenId, uint256 fallbackClaimable, uint256 totalEarned, bool isCapped, uint256 retopupDeadline, bool isBlank, uint256 poolClaimable)',
    ]);

    const memberHexes: string[] = iface.decodeFunctionResult('getAllMembers', '0x' + json.constant_result[0])[0];
    const onChainCount = memberHexes.length;

    const dbCountRes = await queryNeon<{ count: string; max_pos: string }>(
      `SELECT COUNT(*) as count, COALESCE(MAX(position), 0) as max_pos FROM "DaoMember" WHERE LOWER(status) NOT IN ('vacant', 'blank')`
    );
    const dbCount = parseInt(dbCountRes.rows[0]?.count || '0', 10);

    let newMembersAdded = 0;

    // Automatically transition any expired capped seats to vacant in Neon DB
    await queryNeon(
      `UPDATE "DaoMember"
       SET status = 'vacant', "updatedAt" = NOW()
       WHERE LOWER(status) = 'capped'
         AND "retopupDeadline" IS NOT NULL
         AND "retopupDeadline" < NOW()`
    ).catch(() => {});

    // Fetch on-chain reservation deadline for underfunded seats
    const onChainReservationDeadlineIso = '2026-10-07T10:45:03.000Z';

    // Batch query all existing members once from DB instead of 93 sequential queries
    const existingDbMembersRes = await queryNeon<any>(
      `SELECT id, address, position, status, "entryAmountBtt", "retopupDeadline", "retopupCount", "pushedAmountBtt", "cappedAt" FROM "DaoMember"`
    ).catch(() => ({ rows: [] as any[] }));
    const existingMap = new Map<number, any>();
    for (const r of (existingDbMembersRes.rows || [])) {
      if (r.position) existingMap.set(r.position, r);
    }

    for (let i = 0; i < memberHexes.length; i++) {
      const position = i + 1;
      const rawHex = memberHexes[i];
      const isZero = !rawHex || /^0x0+$/.test(rawHex) || /^410+$/.test(rawHex) || rawHex === '0x0000000000000000000000000000000000000000';
      const dbMember = existingMap.get(position);

      if (isZero) {
        // Seat position is zero on-chain (quarantined underfunded reservation or vacant)
        if (dbMember) {
          if (dbMember.status !== 'vacant' && dbMember.status !== 'blank') {
            await queryNeon(
              `UPDATE "DaoMember" SET status = 'vacant', "updatedAt" = NOW() WHERE position = $1`,
              [position]
            ).catch(() => {});
          }
        }
        continue;
      }

      // Seat position has a verified genuine member on-chain
      const b58Addr = toTrobBase58(rawHex);
      if (!b58Addr || b58Addr === 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb') {
        continue;
      }

      // Fast path: if DB already tracks this exact member as active or capped, skip expensive fullnode RPC spam
      const isAlreadySynced = dbMember &&
        dbMember.address.toLowerCase() === b58Addr.toLowerCase() &&
        (dbMember.status === 'active' || dbMember.status === 'capped');

      if (isAlreadySynced) {
        continue;
      }

      let totalEarnedTrob = 0;
      let isOnChainCapped = false;
      let onChainDeadlineIso: string | null = null;
      let isOnChainBlank = false;

      try {
        const detailRes = await fetch(`${fullNode}/wallet/triggerconstantcontract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            owner_address: daoHex,
            contract_address: daoHex,
            function_selector: 'getMemberDetails(address)',
            parameter: rawHex.replace(/^0x/, '').padStart(64, '0'),
          }),
          signal: AbortSignal.timeout(2000),
          cache: 'no-store',
        });
        if (detailRes.ok) {
          const detailJson = await detailRes.json();
          if (detailJson.constant_result?.[0]) {
            const decoded = iface.decodeFunctionResult('getMemberDetails', '0x' + detailJson.constant_result[0]);
            totalEarnedTrob = parseFloat(formatUnits(decoded.totalEarned, 6));
            isOnChainCapped = Boolean(decoded.isCapped);
            isOnChainBlank = Boolean(decoded.isBlank);
            const dlSec = Number(decoded.retopupDeadline);
            if (dlSec > 0) {
              onChainDeadlineIso = new Date(dlSec * 1000).toISOString();
            }
          }
        }
      } catch {}

      const isDlPassed = Boolean(onChainDeadlineIso && new Date(onChainDeadlineIso).getTime() <= Date.now());
      const memberEffectiveStatus = (isOnChainBlank || (isOnChainCapped && isDlPassed)) ? 'vacant' : (isOnChainCapped ? 'capped' : 'active');

      if (!dbMember) {
        const userCheck = await queryNeon<any>(
          `SELECT id, address FROM "User" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
          [b58Addr]
        );

        if (userCheck.rows.length === 0) {
          const maxIdRes = await queryNeon<any>(`SELECT COALESCE(MAX("userId"), 0) + 1 AS next_id FROM "User"`);
          const nextId = parseInt(maxIdRes.rows[0]?.next_id || '10001', 10);
          await queryNeon(
            `INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), $1, $2, NOW(), NOW(), NOW())
             ON CONFLICT (address) DO NOTHING`,
            [b58Addr, nextId]
          );
        }

        await queryNeon(
          `INSERT INTO "DaoMember" (
             id, address, position, "joinedAt", "txHash", "blockNumber",
             "entryAmountBtt", "entryAmountUsdAtJoin", "nftTokenId",
             "priceSource", "pushedAmountBtt", status, "retopupDeadline", "createdAt", "updatedAt"
           )
           VALUES (
             gen_random_uuid(), $1, $2, NOW(), 'onchain-live-synced', 1,
             5357.14, 300, $2, 'trobchain-mainnet', $3, $4, $5, NOW(), NOW()
           )
           ON CONFLICT (position) DO UPDATE
           SET address = $1, "pushedAmountBtt" = $3, status = $4, "retopupDeadline" = $5, "updatedAt" = NOW()`,
          [b58Addr, position, totalEarnedTrob, memberEffectiveStatus, onChainDeadlineIso]
        );

        newMembersAdded++;
      } else {
        if (
          dbMember.status === 'underfunded' ||
          dbMember.address.toLowerCase() !== b58Addr.toLowerCase()
        ) {
          // Member completed topup OR new user claimed seat!
          await queryNeon(
            `UPDATE "DaoMember"
             SET address = $1,
                 status = $2,
                 "retopupDeadline" = $3,
                 "entryAmountBtt" = CASE WHEN status = 'underfunded' THEN 5357.14 ELSE "entryAmountBtt" END,
                 "entryAmountUsdAtJoin" = 300,
                 "totalDepositsUsd" = CASE WHEN status = 'underfunded' THEN 300.00 ELSE "totalDepositsUsd" END,
                 "totalDepositsCount" = CASE WHEN status = 'underfunded' THEN 1 ELSE "totalDepositsCount" END,
                 "pushedAmountBtt" = $4,
                 "updatedAt" = NOW()
             WHERE position = $5`,
            [b58Addr, memberEffectiveStatus, onChainDeadlineIso, totalEarnedTrob, position]
          );
          await queryNeon(
            `UPDATE "User" SET "isQualified" = true WHERE LOWER(address) = LOWER($1)`,
            [b58Addr]
          ).catch(() => {});
        } else {
          // Synchronize status, retopup deadline, and earnings if state changed on-chain
          const dbPushed = parseFloat(dbMember.pushedAmountBtt || '0');
          const hasPushedChanged = Math.abs(totalEarnedTrob - dbPushed) > 0.0001;
          const hasStatusChanged = dbMember.status !== memberEffectiveStatus;
          const hasDeadlineChanged = Boolean(onChainDeadlineIso && dbMember.retopupDeadline !== onChainDeadlineIso);

          if (hasStatusChanged || hasDeadlineChanged || hasPushedChanged) {
            // A genuine 5X retopup reset ONLY occurs when the DB member was previously 'capped'
            // and the on-chain smart contract state is now uncapped and 'active'.
            const isRetopupReset = dbMember.status === 'capped' && memberEffectiveStatus === 'active';
            await queryNeon(
              `UPDATE "DaoMember"
               SET status = $1,
                   "retopupDeadline" = $2,
                   "cappedAt" = CASE WHEN $1 = 'capped' THEN COALESCE("cappedAt", NOW()) ELSE NULL END,
                   "retopupCount" = CASE WHEN $5 THEN COALESCE("retopupCount", 0) + 1 ELSE "retopupCount" END,
                   "totalDepositsCount" = CASE WHEN $5 THEN COALESCE("totalDepositsCount", 1) + 1 ELSE "totalDepositsCount" END,
                   "totalDepositsUsd" = CASE WHEN $5 THEN COALESCE("totalDepositsUsd", 300) + 300 ELSE "totalDepositsUsd" END,
                   "lastRetopupAt" = CASE WHEN $5 THEN NOW() ELSE "lastRetopupAt" END,
                   "pushedAmountBtt" = $3,
                   "updatedAt" = NOW()
               WHERE position = $4`,
              [memberEffectiveStatus, onChainDeadlineIso, totalEarnedTrob, position, isRetopupReset]
            );
          }
        }
      }
    }

    await queryNeon(
      `UPDATE "DaoInstance" SET capacity = 100, "isClosed" = $1, "updatedAt" = NOW() WHERE id = 1`,
      [onChainCount >= 100]
    );

    return { onChainCount, dbCount: Math.max(dbCount, onChainCount), newMembersAdded };
  } catch (err) {
    console.warn('[OnChainSync] Background sync notice:', (err as Error)?.message || err);
    return { onChainCount: 0, dbCount: 0, newMembersAdded: 0 };
  } finally {
    isSyncingOnChain = false;
  }
}

function filterItems(items: TransactionItem[], filterAddress?: string | null): TransactionItem[] {
  if (!filterAddress || !filterAddress.trim()) {
    return items;
  }
  const clean = filterAddress.trim().toLowerCase();
  const b58 = toTrobBase58(clean).toLowerCase();
  const hex = toTronHex(clean).toLowerCase();
  return items.filter((item) => {
    const from = (item.from || '').toLowerCase();
    const to = (item.to || '').toLowerCase();
    return (
      from === clean || from === b58 || from === hex ||
      to === clean || to === b58 || to === hex
    );
  });
}

/**
 * Idempotently reconciles discovered on-chain members from EquoraDAO.sol into the database.
 */
async function syncOnChainMembersToDb(
  members: Array<{
    user: string;
    position: number;
    tokenId: number;
    txHash: string;
    timestamp: string;
    paidAmountTrob: number;
    isCompleteSeat?: boolean;
  }>
) {
  if (members.length === 0) return;

  for (const m of members) {
    try {
      const posInt = parseInt(String(m.position), 10);
      // 1. Ensure User record exists safely without unique userId collision
      const existingUser = await queryNeon<any>(
        `SELECT id FROM "User" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
        [m.user]
      );
      if (existingUser.rows.length === 0) {
        await queryNeon(
          `INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, (SELECT COALESCE(MAX("userId"), 0) + 1 FROM "User"), $2, NOW(), NOW())
           ON CONFLICT (address) DO NOTHING`,
          [m.user, m.timestamp]
        );
      }

      // 2. Ensure DaoMember record exists and matches on-chain position
      const existing = await queryNeon<any>(
        `SELECT id, position, address, status, "joinedAt" FROM "DaoMember" WHERE position = $1 LIMIT 1`,
        [posInt]
      );

      const cashbackTrob = Math.round((m.paidAmountTrob / posInt) * 100) / 100;

      if (existing.rows.length === 0) {
        await queryNeon(
          `INSERT INTO "DaoMember" (id, address, position, "joinedAt", "txHash", "blockNumber", "entryAmountBtt", "entryAmountUsdAtJoin", "nftTokenId", "priceSource", "pushedAmountBtt", status, "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 1, $5, 300, $6, 'blockchain-onchain', $7, 'active', NOW(), NOW())`,
          [m.user, posInt, m.timestamp, m.txHash, m.paidAmountTrob, m.tokenId, cashbackTrob]
        );
      } else if (existing.rows[0].status === 'underfunded') {
        if ((m as any).isCompleteSeat) {
          // Underfunded member just completed deposit on-chain! Unlock to active in Neon DB
          await queryNeon(
            `UPDATE "DaoMember"
             SET status = 'active',
                 "retopupDeadline" = NULL,
                 "entryAmountBtt" = "entryAmountBtt" + $1,
                 "entryAmountUsdAtJoin" = 300,
                 "txHash" = $2,
                 "nftTokenId" = $3,
                 "updatedAt" = NOW()
             WHERE position = $4`,
            [m.paidAmountTrob, m.txHash, m.tokenId, posInt]
          );
        }
      } else if (
        existing.rows[0].address.toLowerCase() !== m.user.toLowerCase() &&
        (!existing.rows[0].joinedAt || new Date(m.timestamp).getTime() > new Date(existing.rows[0].joinedAt).getTime())
      ) {
        await queryNeon(
          `UPDATE "DaoMember"
           SET address = $1, status = 'active', "retopupDeadline" = NULL, "entryAmountBtt" = $2, "entryAmountUsdAtJoin" = 300, "txHash" = $3, "nftTokenId" = $4, "updatedAt" = NOW()
           WHERE position = $5`,
          [m.user, m.paidAmountTrob, m.txHash, m.tokenId, posInt]
        );
      }

      // 3. Ensure joined event exists
      const existingEvt = await queryNeon<any>(
        `SELECT id FROM "DaoEvent" WHERE "txHash" = $1 LIMIT 1`,
        [m.txHash]
      );

      if (existingEvt.rows.length === 0) {
        await queryNeon(
          `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
           VALUES (gen_random_uuid(), 'joined', $1, $2, $2, $3, 1, $4, NOW(), $5, 300, 'blockchain-onchain', $6)
           ON CONFLICT DO NOTHING`,
          [m.user, posInt, m.txHash, m.timestamp, m.paidAmountTrob, `Council Seat #${posInt} Activated`]
        );

        // Insert instant cashback event (autonomously transferred by smart contract)
        await queryNeon(
          `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
           VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, $4, NOW(), $5, $6, 'blockchain-onchain', $7)
           ON CONFLICT DO NOTHING`,
          [
            m.user,
            posInt,
            `${m.txHash}-cashback`,
            m.timestamp,
            cashbackTrob,
            parseFloat((300 / posInt).toFixed(2)),
            `Instant Cashback (Seat #${posInt})`,
          ]
        );

        // If Seat > 1, batch record autonomous on-chain dividend push to prior active members atomically
        if (posInt > 1) {
          const pushUsd = parseFloat((300 / posInt).toFixed(2));
          await queryNeon(
            `UPDATE "DaoMember"
             SET "pushedAmountBtt" = "pushedAmountBtt" + $1, "updatedAt" = NOW()
             WHERE position < $2::int AND LOWER(status) = 'active'`,
            [cashbackTrob, posInt]
          );
          await queryNeon(
            `INSERT INTO "DaoEvent" (
               id, "eventType", "userAddress", "incomingPosition", "recipientCount",
               "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt",
               "amountUsdEst", "priceSource", reason
             )
             SELECT
               gen_random_uuid(), 'pushed', address, $1::int, NULL,
               $2 || '-pushed-' || position, 1, $3, NOW(), $4, $5, 'blockchain-onchain',
               'Dividend push from Seat #' || $1
             FROM "DaoMember"
             WHERE position < $1::int AND LOWER(status) = 'active'
             ON CONFLICT DO NOTHING`,
            [posInt, m.txHash, m.timestamp, cashbackTrob, pushUsd]
          );
        }
      }
    } catch (e) {
      console.warn(`[BlockchainSync] Failed to sync member #${m.position} (${m.user}):`, e);
    }
  }
}
