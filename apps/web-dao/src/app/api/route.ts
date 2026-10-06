import { NextRequest, NextResponse } from 'next/server';
import {
  BACKEND_API_URL,
  ACTIVE_DAO_CONTRACT_ADDRESS,
  CHAIN_ID,
  EXPLORER_BASE_URL,
  FULLNODE_RPC_URL,
} from '@/config/env';

export const dynamic = 'force-dynamic';

/**
 * GET /api
 * Service Discovery & Root API Directory for EQUORA Genesis DAO
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'equorafidao.com';
  const proto = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  const baseUrl = `${proto}://${host}`;
  const apiBackendUrl = BACKEND_API_URL; // 'https://api.equorafidao.com'

  return NextResponse.json({
    message: 'EQUORA Protocol Web DAO API is up and running...',
    service: '@equora/web-dao',
    version: '1.0.0',
    protocol: proto,
    httpsAvailable: true,
    baseUrl,
    apiBackendUrl,
    chainId: CHAIN_ID,
    contracts: {
      daoContract: ACTIVE_DAO_CONTRACT_ADDRESS,
      explorer: EXPLORER_BASE_URL,
      rpc: FULLNODE_RPC_URL,
    },
    endpoints: {
      dao: `${baseUrl}/api/dao`,
      stats: `${baseUrl}/api/dao/stats`,
      members: `${baseUrl}/api/dao/members`,
      seats: `${baseUrl}/api/seats`,
      daoSeats: `${baseUrl}/api/dao/seats`,
      transactions: `${baseUrl}/api/transactions`,
      daoTransactions: `${baseUrl}/api/dao/transactions`,
      events: `${baseUrl}/api/events`,
      daoEvents: `${baseUrl}/api/dao/events`,
      price: `${baseUrl}/api/price`,
      priceTrob: `${baseUrl}/api/price/trob`,
      resourceParams: `${baseUrl}/api/dao/resource-params`,
      eligibility: `${baseUrl}/api/dao/eligibility/[address]`,
      member: `${baseUrl}/api/dao/member/[address]`,
      lounge: `${baseUrl}/api/dao/lounge/[address]`,
      profile: `${baseUrl}/api/dao/profile/[address]`,
      claim: `${baseUrl}/api/dao/claim`,
      retopup: `${baseUrl}/api/dao/retopup`,
      verifyWhatsapp: `${baseUrl}/api/dao/verify-whatsapp`,
      stakeResources: `${baseUrl}/api/dao/stake-resources`,
      authNonce: `${baseUrl}/api/auth/nonce`,
      authVerify: `${baseUrl}/api/auth/verify`,
      authSession: `${baseUrl}/api/auth/session`,
      deploy: `${baseUrl}/api/deploy`,
      trobsafeApk: `${baseUrl}/api/trobsafe/apk`,
      trobsafeDownload: `${baseUrl}/api/trobsafe/download`,
      userSettings: `${baseUrl}/api/user/settings`,
    },
    backendEndpoints: {
      dao: `${apiBackendUrl}/api/dao`,
      stats: `${apiBackendUrl}/api/dao/stats`,
      members: `${apiBackendUrl}/api/dao/members`,
      seats: `${apiBackendUrl}/api/dao/seats`,
      transactions: `${apiBackendUrl}/api/dao/transactions`,
      events: `${apiBackendUrl}/api/dao/events`,
      price: `${apiBackendUrl}/api/price/trob`,
      resourceParams: `${apiBackendUrl}/api/dao/resource-params`,
      eligibility: `${apiBackendUrl}/api/dao/eligibility/:address`,
      member: `${apiBackendUrl}/api/dao/member/:address`,
      lounge: `${apiBackendUrl}/api/dao/lounge/:address`,
      profile: `${apiBackendUrl}/api/dao/profile/:address`,
      proposals: `${apiBackendUrl}/api/dao/proposals`,
      claim: `${apiBackendUrl}/api/dao/claim`,
      retopup: `${apiBackendUrl}/api/dao/retopup`,
      verifyWhatsapp: `${apiBackendUrl}/api/dao/verify-whatsapp`,
      stakeResources: `${apiBackendUrl}/api/dao/stake-resources`,
      health: `${apiBackendUrl}/health`,
    },
  });
}
