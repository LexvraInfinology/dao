import { NextRequest, NextResponse } from 'next/server';
import {
  BACKEND_API_URL,
  BACKEND_API_HOST,
  BACKEND_API_PORT,
  WEB_PORT,
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
  // Default hosts and ports
  const defaultWebHost = 'equorafidao.com';
  const defaultApiHost = 'api.equorafidao.com';
  const defaultApiPort = 4000;
  const defaultWebPort = 3000;

  // Frontend Web Host & Base URL
  const host = req.headers.get('host') || defaultWebHost;
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const proto = req.headers.get('x-forwarded-proto') || (isLocal ? 'http' : 'https');
  const baseUrl = `${proto}://${host}`;

  // Ports configuration (Express API on 4000, Next.js Web on 3000)
  const apiPort = BACKEND_API_PORT || parseInt(process.env.API_PORT || process.env.BACKEND_API_PORT || `${defaultApiPort}`, 10);
  const webPort = WEB_PORT || parseInt(process.env.WEB_PORT || process.env.PORT || `${defaultWebPort}`, 10);

  // Backend API Host
  const apiHost = isLocal
    ? `localhost:${apiPort}`
    : (process.env.API_HOST || process.env.NEXT_PUBLIC_API_DOMAIN || BACKEND_API_HOST || defaultApiHost);

  // Backend API URL: resolved dynamically with fallbacks for production HTTPS, Docker container network (http://api:4000), local dev, or environment overrides
  const apiBackendUrl =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    BACKEND_API_URL ||
    (isLocal ? `http://localhost:${apiPort}` : `https://${defaultApiHost}`);

  return NextResponse.json({
    message: 'EQUORA Protocol Web DAO API is up and running...',
    service: '@equora/web-dao',
    version: '1.0.0',
    protocol: proto,
    httpsAvailable: true,
    host,
    apiHost,
    baseUrl,
    apiBackendUrl,
    ports: {
      web: webPort,
      api: apiPort,
    },
    docker: {
      apiInternalUrl: `http://api:${apiPort}`,
      webInternalUrl: `http://frontend:${webPort}`,
    },
    usage: {
      baseUrl: 'Frontend Next.js origin for browser requests and Next.js /api routes (e.g. fetch(`/api/dao/stats`))',
      apiBackendUrl: 'Direct Express backend REST & Auth service (e.g. https://api.equorafidao.com or Docker http://api:4000)',
      apiHost: 'Express backend hostname (api.equorafidao.com or localhost:4000)',
    },
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
      matrix: `${baseUrl}/api/dao/matrix`,
      contractsFlattened: `${baseUrl}/api/contracts/flattened/[name]`,
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
      seatsAlias: `${apiBackendUrl}/api/seats`,
      transactions: `${apiBackendUrl}/api/dao/transactions`,
      transactionsAlias: `${apiBackendUrl}/api/transactions`,
      events: `${apiBackendUrl}/api/dao/events`,
      eventsAlias: `${apiBackendUrl}/api/events`,
      price: `${apiBackendUrl}/api/price/trob`,
      priceAlias: `${apiBackendUrl}/api/price`,
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
      authNonce: `${apiBackendUrl}/api/auth/nonce`,
      authVerify: `${apiBackendUrl}/api/auth/verify`,
      authSession: `${apiBackendUrl}/api/auth/session`,
      health: `${apiBackendUrl}/health`,
      trpc: `${apiBackendUrl}/trpc`,
    },
  });
}
