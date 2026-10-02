import { getActiveDaoAddress, toTrobBase58 } from '@/utils/trobAddress';
import { queryNeon } from './neonDb';
import { broadcastNativePayout } from './payoutRelayer';
import type { TransactionItem } from '@/hooks/useApi';
import { EXPLORER_API_URL } from '@/config/env';

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
      const caller = (detail.from_addr || tx.from_addr || '').trim();
      const isoTime = detail.timestamp || tx.timestamp || new Date().toISOString();

      if (isJoin) {
        // Parse joinDAO
        const joinEvt = events.find((e) => e.name === 'DAOPositionJoined');
        const payoutEvts = events.filter((e) => e.name === 'DAOPayoutPushed');

        const pos = joinEvt?.args?.position ? parseInt(joinEvt.args.position, 10) : 1;
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
          });
        }
      }
    }

    cachedParsedItems = parsedItems;

    // Asynchronously reconcile discovered on-chain members into Neon DB without blocking response
    syncOnChainMembersToDb(discoveredMembers).catch((err) => {
      console.warn('[BlockchainSync] DB sync error:', err);
    });

    return filterItems(cachedParsedItems, filterAddress);
  } catch (err) {
    console.error('[BlockchainSync] Failed to process on-chain transactions:', err);
    return filterItems(cachedParsedItems, filterAddress);
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
      // 1. Ensure User record exists
      await queryNeon(
        `INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
         ON CONFLICT (address) DO NOTHING`,
        [m.user, m.position, m.timestamp]
      );

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

        // Broadcast top-level visible native cashback transfer
        let cashbackTxId: string | null = null;
        try {
          cashbackTxId = await broadcastNativePayout(m.user, cashbackTrob);
        } catch (e) {
          console.warn(`[BlockchainSync] Payout broadcast note for Seat #${m.position}:`, e);
        }

        // Insert instant cashback event
        await queryNeon(
          `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
           VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, $4, NOW(), $5, $6, 'blockchain-onchain', $7)`,
          [
            m.user,
            m.position,
            cashbackTxId || `${m.txHash}-cashback`,
            m.timestamp,
            cashbackTrob,
            parseFloat((300 / m.position).toFixed(2)),
            `Instant Cashback (Seat #${m.position})`,
          ]
        );

        // If Seat > 1, broadcast dividend push to prior active members
        if (m.position > 1) {
          const priors = await queryNeon<any>(
            `SELECT id, address, position, "pushedAmountBtt" FROM "DaoMember" WHERE position < $1 AND LOWER(status) = 'active'`,
            [m.position]
          );
          for (const pr of priors.rows) {
            let divTxId: string | null = null;
            try {
              divTxId = await broadcastNativePayout(pr.address, cashbackTrob);
            } catch {}
            await queryNeon(
              `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
               VALUES (gen_random_uuid(), 'pushed', $1, $2, NULL, $3, 1, $4, NOW(), $5, $6, 'blockchain-onchain', $7)`,
              [
                pr.address,
                m.position,
                divTxId || `${m.txHash}-pushed-${pr.position}`,
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
