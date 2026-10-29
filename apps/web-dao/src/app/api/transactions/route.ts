import { NextRequest } from 'next/server';
import { GET as getTransactions } from '../dao/transactions/route';

export const dynamic = 'force-dynamic';

/**
 * GET /api/transactions
 * Convenience alias route for GET /api/dao/transactions
 */
export async function GET(req: NextRequest) {
  return getTransactions(req);
}
