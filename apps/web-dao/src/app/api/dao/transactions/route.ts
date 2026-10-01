import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import type { TransactionItem } from '@/hooks/useApi';

export const dynamic = 'force-dynamic';

const PROTOCOL_ADDRESS = process.env.NEXT_PUBLIC_DAO_ADDRESS || 'THfWLrRy139LHhfxPLHFuiEqMeiw81FiQD';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const filterType = searchParams.get('type') || 'all';

    // 1. Try Express backend if configured
    const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
      `/api/dao/transactions?${searchParams.toString()}`
    );
    if (backendRes && backendRes.success && backendRes.data?.transactions?.length > 0) {
      return NextResponse.json(backendRes);
    }

    // 2. Direct Serverless Neon Database Query
    const offset = (page - 1) * limit;
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (address && address.trim()) {
      params.push(address.trim().toLowerCase());
      whereClauses.push(`LOWER("userAddress") = $${params.length}`);
    }

    if (filterType !== 'all') {
      params.push(filterType.toLowerCase());
      whereClauses.push(`LOWER("eventType") = $${params.length}`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await queryNeon<{ count: string }>(
      `SELECT COUNT(*) as count FROM "DaoEvent" ${whereSql}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const rowsRes = await queryNeon<any>(
      `SELECT id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "amountBtt", "amountUsdEst", "priceSource", reason
       FROM "DaoEvent"
       ${whereSql}
       ORDER BY "timestamp" DESC, "createdAt" DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const transactions: TransactionItem[] = rowsRes.rows.map((evt) => {
      const isPositive = evt.eventType === 'pushed' || evt.eventType === 'fallback_claimed';
      const amtBtt = parseFloat(evt.amountBtt || '0');
      const amtUsd = parseFloat(evt.amountUsdEst || '0');

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
        timestamp: evt.timestamp ? new Date(evt.timestamp).toISOString() : new Date().toISOString(),
        status: 'Confirmed',
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        total,
        page,
        limit,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch transactions';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
