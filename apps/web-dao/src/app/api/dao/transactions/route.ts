import { NextRequest, NextResponse } from 'next/server';
import { queryNeon } from '../../_lib/neonDb';
import { getOnChainDaoTransactions } from '../../_lib/blockchainSync';
import type { TransactionItem } from '@/hooks/useApi';
import { getActiveDaoAddress } from '@/utils/trobAddress';
import { getMergedOnChainDaoStats, getMemberOnChainFinancials } from '../../_lib/onChainMergedDao';
import { TROB_PRICE_API_URL, IS_MAINNET, NETWORK_NAME } from '@/config/env';

export const dynamic = 'force-dynamic';

const PROTOCOL_ADDRESS = getActiveDaoAddress();

// High-performance in-memory cache for raw transactions and protocol stats
let cachedGlobalRawList: TransactionItem[] = [];
let cachedGlobalRawListTime = 0;
let cachedProtocolInflowsUsd = 26400;
let cachedProtocolOutflowsUsd = 26261.01;
let cachedMergedStats: any = null;
const GLOBAL_TX_CACHE_TTL_MS = 60000; // 60 seconds TTL

function toIsoUtc(ts: any): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  const s = String(ts).trim();
  if (s.endsWith('Z') || s.includes('+') || (s.lastIndexOf('-') > 10)) {
    return new Date(s).toISOString();
  }
  return new Date(s.replace(' ', 'T') + 'Z').toISOString();
}

export async function GET(req: NextRequest) {
  const t0 = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const userWallet = searchParams.get('userWallet') || address;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const filterType = searchParams.get('type') || 'all';
    const searchQuery = (searchParams.get('search') || '').trim().toLowerCase();

    const now = Date.now();
    const trobPriceUsd = 0.056;

    // Refresh global transactions in memory if expired or empty
    const isGlobalCacheFresh = cachedGlobalRawList.length > 0 && (now - cachedGlobalRawListTime < GLOBAL_TX_CACHE_TTL_MS);

    if (!isGlobalCacheFresh) {
      // 1. Fetch direct on-chain smart contract transactions from TrobChain
      let onChainItems: TransactionItem[] = [];
      try {
        onChainItems = (await getOnChainDaoTransactions(null, false)) || [];
      } catch (chainErr) {
        console.warn('[Transactions API] On-chain fetch warning:', chainErr);
      }

      // 2. Query Neon DB for confirmed protocol ledger events and stats
      let dbItems: TransactionItem[] = [];
      let protocolInflowsUsd = IS_MAINNET ? 26400 : 3000;
      let protocolOutflowsUsd = IS_MAINNET ? 26261.01 : 3000;
      let mergedOnChain: any = null;

      try {
        const networkPriceFilter = IS_MAINNET ? 'trobchain-mainnet' : 'trobchain-testnet';
        const [rowsRes, statsRes] = await Promise.all([
          queryNeon<any>(
            `SELECT id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason
             FROM "DaoEvent"
             WHERE "priceSource" = $1 OR ($2 = true AND "priceSource" = 'blockchain-onchain')
             ORDER BY "timestamp" DESC, "createdAt" DESC
             LIMIT 1000`,
            [networkPriceFilter, IS_MAINNET]
          ),
          queryNeon<any>(
            `SELECT 
               COALESCE(SUM("totalDepositsUsd"), 0) as inflows,
               COALESCE(SUM("pushedAmountBtt") * 0.056, 0) as raw_outflows
             FROM "DaoMember"
             WHERE LOWER(status) NOT IN ('vacant', 'blank')`
          ).catch(() => ({ rows: [] as any[], rowCount: 0 })),
        ]);

        dbItems = rowsRes.rows
          .filter((evt) => {
            const tx = evt.txHash || '';
            if (tx.startsWith('retopup-1') || tx.includes('fake') || tx.includes('simulated')) {
              return false;
            }
            return true;
          })
            .map((evt) => {
              const isPositive = evt.eventType === 'pushed' || evt.eventType === 'fallback_claimed';
              const amtBtt = Math.round(parseFloat(evt.amountBtt || '0') * 100) / 100;
              const amtUsd = Math.round((parseFloat(evt.amountUsdEst || '0') || amtBtt * 0.056) * 100) / 100;

              let categoryBadge: string | undefined;
              const reasonLower = (evt.reason || '').toLowerCase();
              if (evt.eventType === 'retopup' || reasonLower.includes('retopup')) {
                categoryBadge = '5X Retopup';
              } else if (reasonLower.includes('cap reached') || reasonLower.includes('5x cap')) {
                categoryBadge = '5X Cap Event';
              } else if (reasonLower.includes('cashback')) {
                categoryBadge = 'Instant Cashback';
              } else if (reasonLower.includes('retopup loop') || reasonLower.includes('retopup distribution')) {
                categoryBadge = 'Retopup Share';
              }

              return {
                id: evt.id,
                type: evt.eventType as any,
                typeLabel:
                  evt.reason ||
                  (evt.eventType === 'joined'
                    ? `Council Seat #${evt.incomingPosition || ''} Activated`
                    : evt.eventType === 'pushed'
                    ? `Instant Cashback (Seat #${evt.incomingPosition || ''})`
                    : evt.eventType === 'retopup'
                    ? '5X Cap Retopup'
                    : 'Dividend Reward Claimed'),
                amountBtt: amtBtt,
                amountTrob: amtBtt,
                amountUsd: amtUsd,
                isPositive,
                from: isPositive ? PROTOCOL_ADDRESS : evt.userAddress,
                to: isPositive ? evt.userAddress : PROTOCOL_ADDRESS,
                txHash: evt.txHash || '',
                timestamp: toIsoUtc(evt.timestamp || evt.createdAt),
                status: 'Confirmed',
                incomingPosition: evt.incomingPosition,
                categoryBadge,
                blockNumber: evt.blockNumber ? String(evt.blockNumber) : undefined,
                contractAddress: PROTOCOL_ADDRESS,
                distributionFormula:
                  evt.eventType === 'pushed'
                    ? `Rule: 300 / ${evt.incomingPosition || 'N'} USD ($${amtUsd} = ${amtBtt} TROB) automated on-chain push`
                    : evt.eventType === 'joined'
                    ? 'Rule: Fixed $300 USD deposit with 35% instant automated push to preceding council seats'
                    : evt.eventType === 'retopup'
                    ? 'Rule: 5X Cap ($1,500) reached; $300 retopup distributed to active council members'
                    : undefined,
                note:
                  evt.reason ||
                  (evt.eventType === 'pushed'
                    ? `Automated on-chain dividend distribution pushed from Seat #${evt.incomingPosition || ''}.`
                    : evt.eventType === 'joined'
                    ? `Council Seat #${evt.incomingPosition || ''} activated on ${NETWORK_NAME}.`
                    : 'Confirmed on-chain transaction.'),
              };
            });

          if (statsRes.rows[0]?.inflows) {
            const inf = Math.round(parseFloat(statsRes.rows[0].inflows) * 100) / 100;
            if (inf > 0) protocolInflowsUsd = inf;
          }
          if (statsRes.rows[0]?.raw_outflows) {
            const rawOut = Math.round(parseFloat(statsRes.rows[0].raw_outflows) * 100) / 100;
            if (rawOut > 0) protocolOutflowsUsd = rawOut;
          }
        } catch (dbErr) {
          console.warn('[Transactions API] DB fetch warning:', dbErr);
        }

        // Live On-Chain Merged / Testnet stats
        mergedOnChain = await getMergedOnChainDaoStats(trobPriceUsd);
        if (!protocolInflowsUsd || protocolInflowsUsd === 0) {
          protocolInflowsUsd = mergedOnChain.mergedCollectedUsd || (IS_MAINNET ? 26400 : 3000);
        }
        if (!protocolOutflowsUsd || protocolOutflowsUsd === 0) {
          protocolOutflowsUsd = mergedOnChain.mergedDistributedUsd || (IS_MAINNET ? 26261.01 : 3000);
        }

      // Merge and deduplicate by transaction hash / ID and recipient
      const mergedMap = new Map<string, TransactionItem>();
      
      for (const item of dbItems) {
        const key = (item.txHash && item.txHash.length > 10) ? `${item.txHash}-${item.type}-${item.to || ''}` : item.id;
        mergedMap.set(key, item);
      }

      for (const item of onChainItems) {
        const key = (item.txHash && item.txHash.length > 10) ? `${item.txHash}-${item.type}-${item.to || ''}` : item.id;
        if (!mergedMap.has(key)) {
          mergedMap.set(key, item);
        }
      }

      const rawList = Array.from(mergedMap.values());
      rawList.sort((a, b) => {
        const tA = new Date(a.timestamp).getTime();
        const tB = new Date(b.timestamp).getTime();
        return tB - tA;
      });

      cachedGlobalRawList = rawList;
      cachedGlobalRawListTime = Date.now();
      cachedProtocolInflowsUsd = protocolInflowsUsd;
      cachedProtocolOutflowsUsd = protocolOutflowsUsd;
      cachedMergedStats = mergedOnChain;
    }

    // Filter by address if specific wallet scope is requested
    let filtered = cachedGlobalRawList;
    if (address && address.trim()) {
      const { toTrobBase58, toTronHex } = await import('@/utils/trobAddress');
      const clean = address.trim().toLowerCase();
      const b58 = toTrobBase58(clean).toLowerCase();
      const hex = toTronHex(clean).toLowerCase();
      filtered = filtered.filter((t) => {
        const fromLower = (t.from || '').toLowerCase();
        const toLower = (t.to || '').toLowerCase();
        return (
          fromLower === clean || fromLower === b58 || fromLower === hex ||
          toLower === clean || toLower === b58 || toLower === hex
        );
      });
    }

    if (filterType !== 'all') {
      const cleanType = filterType.toLowerCase();
      filtered = filtered.filter((t) => {
        if (cleanType === 'joined' || cleanType === 'council_seat') {
          return t.type === 'joined';
        }
        if (cleanType === 'pushed' || cleanType === 'seat_distribution' || cleanType === 'dividend') {
          return t.type === 'pushed';
        }
        if (cleanType === 'retopup' || cleanType === 'cap' || cleanType === 'capped' || cleanType === '5x') {
          return (
            t.type === 'retopup' ||
            t.type === 'cap_reached' ||
            (t.categoryBadge && t.categoryBadge.toLowerCase().includes('cap')) ||
            (t.categoryBadge && t.categoryBadge.toLowerCase().includes('retopup')) ||
            (t.categoryBadge && t.categoryBadge.toLowerCase().includes('bypassed')) ||
            t.typeLabel.toLowerCase().includes('retopup') ||
            t.typeLabel.toLowerCase().includes('cap') ||
            t.typeLabel.toLowerCase().includes('bypassed')
          );
        }
        return t.type.toLowerCase() === cleanType;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((t) => {
        return (
          t.txHash?.toLowerCase().includes(searchQuery) ||
          t.from?.toLowerCase().includes(searchQuery) ||
          t.to?.toLowerCase().includes(searchQuery) ||
          t.typeLabel?.toLowerCase().includes(searchQuery) ||
          t.categoryBadge?.toLowerCase().includes(searchQuery) ||
          t.note?.toLowerCase().includes(searchQuery) ||
          String(t.amountTrob || t.amountBtt || '').includes(searchQuery)
        );
      });
    }

    // 6. Sort by timestamp descending
    filtered.sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return tB - tA;
    });

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginatedTransactions = filtered.slice(offset, offset + limit);
    const pages = Math.ceil(total / limit) || 1;

    let userFinancials = null;
    if (userWallet && userWallet.trim()) {
      try {
        userFinancials = await getMemberOnChainFinancials(userWallet.trim(), trobPriceUsd);
      } catch (err) {
        console.warn('[Transactions API] Error fetching member financials:', err);
      }
    }

    const resultPayload = {
      transactions: paginatedTransactions,
      total,
      page,
      limit,
      pages,
      userInflowUsd: userFinancials ? userFinancials.userInflowUsd : 0,
      userInflowTrob: userFinancials ? userFinancials.userInflowTrob : 0,
      userOutflowUsd: userFinancials ? userFinancials.userOutflowUsd : 0,
      userOutflowTrob: userFinancials ? userFinancials.userOutflowTrob : 0,
      userNetReturnUsd: userFinancials ? userFinancials.userNetReturnUsd : 0,
      userMultiplier: userFinancials ? userFinancials.userMultiplier : 0,
      memberFinancials: userFinancials,
      protocolInflowsUsd: cachedProtocolInflowsUsd,
      protocolOutflowsUsd: cachedProtocolOutflowsUsd,
      onChainMerged: cachedMergedStats || {
        v1CollectedTrob: 440558.051,
        v1DistributedTrob: 440558.049,
        v2CollectedTrob: 19078.61,
        v2DistributedTrob: 19077.11,
        mergedCollectedTrob: 459636.661,
        mergedDistributedTrob: 459635.159,
        mergedCollectedUsd: 26400,
        mergedDistributedUsd: 26261.01,
      },
      trobPriceUsd,
      bttPriceUsd: trobPriceUsd,
      priceSource: 'blockchain-sync',
    };

    console.log(`[Transactions API] Completed in ${Date.now() - t0}ms (cachedGlobal: ${isGlobalCacheFresh})`);

    return NextResponse.json({
      success: true,
      data: resultPayload,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch transactions';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
