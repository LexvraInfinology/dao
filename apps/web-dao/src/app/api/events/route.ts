import { NextRequest } from 'next/server';
import { GET as getDaoEvents } from '../dao/events/route';

export const dynamic = 'force-dynamic';

/**
 * GET /api/events
 * Convenience alias for GET /api/dao/events
 */
export async function GET(req: NextRequest) {
  return getDaoEvents(req);
}
