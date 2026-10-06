import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api
 * Root API directory and status for EQUORA Genesis DAO
 */
export async function GET() {
  const host = 'equorafidao.com';
  const apiHost = 'api.equorafidao.com';
  return NextResponse.json({
    message: 'EQUORA Protocol Web DAO API is up and running...',
    service: '@equora/web-dao',
    version: '1.0.0',
    protocol: 'https',
    httpsAvailable: true,
    baseUrl: `https://${host}`,
    apiBackendUrl: `https://${apiHost}`,
    endpoints: {
      dao: `https://${host}/api/dao`,
      stats: `https://${host}/api/dao/stats`,
      members: `https://${host}/api/dao/members`,
      seats: `https://${host}/api/seats`,
      daoSeats: `https://${host}/api/dao/seats`,
      transactions: `https://${host}/api/transactions`,
      daoTransactions: `https://${host}/api/dao/transactions`,
      events: `https://${host}/api/dao/events`,
      price: `https://${host}/api/price/trob`,
      resourceParams: `https://${host}/api/dao/resource-params`,
      eligibility: `https://${host}/api/dao/eligibility/[address]`,
      member: `https://${host}/api/dao/member/[address]`,
      lounge: `https://${host}/api/dao/lounge/[address]`,
      profile: `https://${host}/api/dao/profile/[address]`,
      claim: `https://${host}/api/dao/claim`,
      retopup: `https://${host}/api/dao/retopup`,
      verifyWhatsapp: `https://${host}/api/dao/verify-whatsapp`,
      stakeResources: `https://${host}/api/dao/stake-resources`,
      authNonce: `https://${host}/api/auth/nonce`,
      authVerify: `https://${host}/api/auth/verify`,
      authSession: `https://${host}/api/auth/session`,
    },
    chainId: 1000,
  });
}
