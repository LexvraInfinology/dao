import { NextRequest } from 'next/server';
import { GET as getMembers } from '../dao/members/route';

export const dynamic = 'force-dynamic';

/**
 * GET /api/seats
 * Convenience alias route for Council Seats (GET /api/dao/members)
 */
export async function GET(req: NextRequest) {
  return getMembers(req);
}
