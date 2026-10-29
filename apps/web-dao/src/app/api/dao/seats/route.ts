import { NextRequest } from 'next/server';
import { GET as getMembers } from '../members/route';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dao/seats
 * Convenience endpoint / alias returning the live 100 Council Seats data.
 */
export async function GET(req: NextRequest) {
  return getMembers(req);
}
