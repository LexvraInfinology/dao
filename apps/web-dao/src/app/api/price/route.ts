import { GET as getTrobPrice } from './trob/route';

export const dynamic = 'force-dynamic';

/**
 * GET /api/price
 * Convenience alias for GET /api/price/trob
 */
export async function GET() {
  return getTrobPrice();
}
