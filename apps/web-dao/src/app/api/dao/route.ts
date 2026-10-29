import { GET as getDaoStats } from './stats/route';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dao
 * Returns the live EQUORA Genesis DAO protocol status and statistics.
 */
export async function GET() {
  return getDaoStats();
}
