import { getActiveDaoAddress, getActiveDaoHex, toTrobBase58 } from '@/utils/trobAddress';
import { queryNeon } from './neonDb';
import type { TransactionItem } from '@/hooks/useApi';
import { EXPLORER_API_URL } from '@/config/env';
import { getOnChainMemberPosition } from './txVerifier';

const BACKEND_EXPLORER_API = EXPLORER_API_URL;

// In-memory cache for detailed transactions to avoid repeating HTTP requests for immutable confirmed blocks
const txDetailCache = new Map<string, any>();
let lastAccountFetchTime = 0;
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

  // Rate-limit account polling to once every 4 seconds unless forceRefresh is set
  if (!forceRefresh && now - lastAccountFetchTime < 4000 && cachedParsedItems.length > 0) {
    return filterItems(cachedParsedItems, filterAddress);
  }

  try {
    const res = await fetch(
      `${BACKEND_EXPLORER_API}/accounts/${daoAddress}/transactions?limit=100`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      console.warn(`[BlockchainSync] Failed to fetch account txs (${res.status})`);
      return filterItems(cachedParsedItems, filterAddress);
    }

    const json = await res.json();
    const txList = (json.data || []) as any[];
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
    }> = [];

    const RESET_CUTOFF_MS = process.env.DAO_SYNC_START_TIMESTAMP
      ? new Date(process.env.DAO_SYNC_START_TIMESTAMP).getTime()
      : new Date('2026-10-02T19:00:00.000Z').getTime();

    for (const tx of txList) {
      if (tx.result !== 'SUCCESS') continue;

      // Skip historical transactions from before the fresh database reset
      let txTimeMs = 0;
      if (tx.timestamp) {
        const num = Number(tx.timestamp);
        if (Number.isFinite(num) && num > 0) {
          txTimeMs = num < 10000000000 ? num * 1000 : num;
        } else {
          txTimeMs = new Date(tx.timestamp).getTime();
        }
      }
      if (txTimeMs > 0 && txTimeMs < RESET_CUTOFF_MS) {
        continue;
      }

      const hash = tx.hash;
      const methodName = tx.method_name || '';
      const selector = tx.function_selector || '';

      // Check if this is a DAO interaction method
      const isJoin = methodName === 'joinDAO' || selector === 'f63d13d7';
      const isRetopup = methodName === 'retopup' || selector === 'd7b275bf';
      const isClaimPool = methodName === 'claimPoolShare' || selector === '85b736b4';
      const isClaimFallback = methodName === 'claimFallback' || selector === 'a04467c6';

      if (!isJoin && !isRetopup && !isClaimPool && !isClaimFallback) {
        continue;
      }

      // Fetch transaction details with events (cached if already confirmed)
      let detail = txDetailCache.get(hash);
      if (!detail) {
        try {
          const detailRes = await fetch(`${BACKEND_EXPLORER_API}/transactions/${hash}`, {
            cache: 'no-store',
          });
          if (detailRes.ok) {
            const detailJson = await detailRes.json();
            detail = detailJson.data || tx;
            if (detail.confirmed) {
              txDetailCache.set(hash, detail);
            }
          }
        } catch {}
      }

      if (!detail) detail = tx;

      const events: any[] = detail.events || [];
      const joinEvt = events.find((e) => e.name === 'DAOPositionJoined');
      const payoutEvts = events.filter((e) => e.name === 'DAOPayoutPushed');
      const caller = (joinEvt?.args?.user || detail.from_addr || tx.from_addr || detail.ownerAddress || tx.ownerAddress || '').trim();
      const isoTime = detail.timestamp || tx.timestamp || new Date().toISOString();

      if (isJoin) {
        // Parse joinDAO
        let pos = joinEvt?.args?.position ? parseInt(joinEvt.args.position, 10) : 0;
        if (!pos || pos < 1 || pos > 100) {
          pos = caller ? await getOnChainMemberPosition(caller, daoAddress) : 0;
        }
        if (!pos || pos < 1 || pos > 100) {
          continue;
        }
        const tokenId = joinEvt?.args?.tokenId ? parseInt(joinEvt.args.tokenId, 10) : pos;

        // Paid amount in TROB
        let paidAmountTrob = 5357.14;
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

        // 1. Council Seat Activated (Deposit transaction from user)
        parsedItems.push({
          id: `${hash}-joined`,
          type: 'joined',
          typeLabel: `Council Seat #${pos} Activated`,
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
        });

        discoveredMembers.push({
          user: caller,
          position: pos,
          tokenId,
          txHash: hash,
          timestamp: isoTime,
          paidAmountTrob,
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
            });
          }
        } else {
          // If event logs weren't parsed by explorer API, synthesize according to EquoraDAO.sol logic
          const cashbackTrob = Math.round((paidAmountTrob / pos) * 100) / 100;
          const cashbackUsd = Math.round((300 / pos) * 100) / 100;
          parsedItems.push({
            id: `${hash}-cashback`,
            type: 'pushed',
            typeLabel: `Instant Cashback (Seat #${pos})`,
            amountBtt: cashbackTrob,
            amountTrob: cashbackTrob,
            amountUsd: cashbackUsd,
            isPositive: true,
            from: daoAddress,
            to: caller,
            txHash: hash,
            timestamp: cashbackTime,
            status: 'Confirmed',
            incomingPosition: pos,
          });
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

        for (const p of payoutEvts) {
          const recipient = (p.args?.recipient || caller).trim();
          const pAmt = p.args?.amount ? Number(p.args.amount) / 1e6 : amountTrob / pos;
          const isCashback = recipient.toLowerCase() === caller.toLowerCase();
          parsedItems.push({
            id: `${hash}-retopup-push-${recipient}`,
            type: 'pushed',
            typeLabel: isCashback
              ? `Instant Cashback on Retopup Loop (Seat #${pos})`
              : `Dividend Push from Seat #${pos} (Retopup Loop)`,
            amountBtt: pAmt,
            amountTrob: pAmt,
            amountUsd: parseFloat((300 / pos).toFixed(2)),
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

    // Reconcile discovered on-chain members into Neon DB
    syncOnChainMembersToDb(discoveredMembers).catch((err) => {
      console.warn('[BlockchainSync] DB sync error:', err);
    });

    // Also trigger direct on-chain state sync
    syncOnChainMembersState().catch((err) => {
      console.warn('[BlockchainSync] Direct on-chain sync error:', err);
    });

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
  const now = Date.now();
  if (!force && (now - lastOnChainSyncTime < 4000 || isSyncingOnChain)) {
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
      `SELECT COUNT(*) as count, COALESCE(MAX(position), 0) as max_pos FROM "DaoMember" WHERE LOWER(status) IN ('active', 'capped')`
    );
    const dbCount = parseInt(dbCountRes.rows[0]?.count || '0', 10);
    const maxDbPos = parseInt(dbCountRes.rows[0]?.max_pos || '0', 10);

    let newMembersAdded = 0;

    if (onChainCount > dbCount || onChainCount > maxDbPos) {
      console.log(`[OnChainSync] Found ${onChainCount} on-chain members vs ${dbCount} in DB. Syncing...`);

      for (let i = 0; i < memberHexes.length; i++) {
        const rawHex = memberHexes[i];
        const b58Addr = toTrobBase58(rawHex);
        const position = i + 1;

        const existing = await queryNeon<any>(
          `SELECT id, address, position FROM "DaoMember" WHERE position = $1 LIMIT 1`,
          [position]
        );

        if (existing.rows.length === 0 || existing.rows[0].address.toLowerCase() !== b58Addr.toLowerCase()) {
          let totalEarnedTrob = 0;
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
              cache: 'no-store',
            });
            if (detailRes.ok) {
              const detailJson = await detailRes.json();
              if (detailJson.constant_result?.[0]) {
                const decoded = iface.decodeFunctionResult('getMemberDetails', '0x' + detailJson.constant_result[0]);
                totalEarnedTrob = parseFloat(formatUnits(decoded.totalEarned, 6));
              }
            }
          } catch {}

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
               "priceSource", "pushedAmountBtt", status, "createdAt", "updatedAt"
             )
             VALUES (
               gen_random_uuid(), $1, $2, NOW(), 'onchain-live-synced', 1,
               5084.75, 300, $2, 'trobchain-mainnet', $3, 'active', NOW(), NOW()
             )
             ON CONFLICT (position) DO UPDATE
             SET address = $1, "pushedAmountBtt" = $3, status = 'active', "updatedAt" = NOW()`,
            [b58Addr, position, totalEarnedTrob]
          );

          newMembersAdded++;
        }
      }

      await queryNeon(
        `UPDATE "DaoInstance" SET capacity = 100, "isClosed" = $1, "updatedAt" = NOW() WHERE id = 1`,
        [onChainCount >= 100]
      );
    }

    return { onChainCount, dbCount: Math.max(dbCount, onChainCount), newMembersAdded };
  } catch (err) {
    console.error('[OnChainSync] Error in syncOnChainMembersState:', err);
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
  return items.filter((item) => {
    return (
      item.from.toLowerCase() === clean ||
      item.to.toLowerCase() === clean
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
  }>
) {
  if (members.length === 0) return;

  for (const m of members) {
    try {
      // 1. Ensure User record exists safely without unique userId collision
      const existingUser = await queryNeon<any>(
        `SELECT id FROM "User" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
        [m.user]
      );
      if (existingUser.rows.length === 0) {
        const maxIdRes = await queryNeon<any>(`SELECT COALESCE(MAX("userId"), 0) + 1 AS next_id FROM "User"`);
        const nextId = parseInt(maxIdRes.rows[0]?.next_id || '10001', 10);
        await queryNeon(
          `INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
           ON CONFLICT (address) DO NOTHING`,
          [m.user, nextId, m.timestamp]
        );
      }

      // 2. Ensure DaoMember record exists and matches on-chain position
      const existing = await queryNeon<any>(
        `SELECT id, position, address, status, "joinedAt" FROM "DaoMember" WHERE position = $1 LIMIT 1`,
        [m.position]
      );

      const cashbackTrob = Math.round((m.paidAmountTrob / m.position) * 100) / 100;

      if (existing.rows.length === 0) {
        await queryNeon(
          `INSERT INTO "DaoMember" (id, address, position, "joinedAt", "txHash", "blockNumber", "entryAmountBtt", "entryAmountUsdAtJoin", "nftTokenId", "priceSource", "pushedAmountBtt", status, "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 1, $5, 300, $6, 'blockchain-onchain', $7, 'active', NOW(), NOW())`,
          [m.user, m.position, m.timestamp, m.txHash, m.paidAmountTrob, m.tokenId, cashbackTrob]
        );
      } else if (
        existing.rows[0].status !== 'vacant' &&
        existing.rows[0].status !== 'capped' &&
        existing.rows[0].address.toLowerCase() !== m.user.toLowerCase() &&
        (!existing.rows[0].joinedAt || new Date(m.timestamp).getTime() > new Date(existing.rows[0].joinedAt).getTime())
      ) {
        await queryNeon(
          `UPDATE "DaoMember"
           SET address = $1, "txHash" = $2, "nftTokenId" = $3, "updatedAt" = NOW()
           WHERE position = $4`,
          [m.user, m.txHash, m.tokenId, m.position]
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
           VALUES (gen_random_uuid(), 'joined', $1, $2, $2, $3, 1, $4, NOW(), $5, 300, 'blockchain-onchain', $6)`,
          [m.user, m.position, m.txHash, m.timestamp, m.paidAmountTrob, `Council Seat #${m.position} Activated`]
        );

        // Insert instant cashback event (autonomously transferred by smart contract)
        await queryNeon(
          `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
           VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, $4, NOW(), $5, $6, 'blockchain-onchain', $7)`,
          [
            m.user,
            m.position,
            `${m.txHash}-cashback`,
            m.timestamp,
            cashbackTrob,
            parseFloat((300 / m.position).toFixed(2)),
            `Instant Cashback (Seat #${m.position})`,
          ]
        );

        // If Seat > 1, record autonomous on-chain dividend push to prior active members
        if (m.position > 1) {
          const priors = await queryNeon<any>(
            `SELECT id, address, position, "pushedAmountBtt" FROM "DaoMember" WHERE position < $1 AND LOWER(status) = 'active'`,
            [m.position]
          );
          for (const pr of priors.rows) {
            await queryNeon(
              `UPDATE "DaoMember" SET "pushedAmountBtt" = "pushedAmountBtt" + $1, "updatedAt" = NOW() WHERE id = $2`,
              [cashbackTrob, pr.id]
            );
            await queryNeon(
              `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
               VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, $4, NOW(), $5, $6, 'blockchain-onchain', $7)`,
              [
                pr.address,
                m.position,
                `${m.txHash}-pushed-${pr.position}`,
                m.timestamp,
                cashbackTrob,
                parseFloat((300 / m.position).toFixed(2)),
                `Dividend push from Seat #${m.position}`,
              ]
            );
          }
        }
      }
    } catch (e) {
      console.warn(`[BlockchainSync] Failed to sync member #${m.position} (${m.user}):`, e);
    }
  }
}
