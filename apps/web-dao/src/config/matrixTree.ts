/**
 * Genesis DAO to Matrix Top 7 Tree Topology (apps/web-dao/src/config/matrixTree.ts)
 *
 * Implements a strict, perfect binary tree (top-to-bottom, left-to-right):
 *
 *                     [Seat #1: Apex Root (#0001)]
 *                               /         \
 *                              /           \
 *                 [Seat #2: Tier 1-L]   [Seat #3: Tier 1-R]
 *                     /        \            /        \
 *                    /          \          /          \
 *            [Seat #4: T2-L] [Seat #5: T2-R] [Seat #6: T2-L] [Seat #7: T2-R]
 *
 * Mathematical parent formula:
 * parentSeat = Math.floor(seatNumber / 2)
 */

export interface MatrixMemberNode {
  seatNumber: number;
  roleTitle: string;
  tierLabel: string;
  legPosition: 'apex' | 'left' | 'right';
  parentSeat: number | null;
  downlineSeats: number[];
  sponsorDescription: string;
}

// Known verified on-chain testnet addresses for Genesis Council Seats 1 to 7
export const GENESIS_COUNCIL_TESTNET_ADDRESSES: Record<number, string> = {
  1: 'TKRWSwmKSpLB85V26MPEWbwCWqXR9aPzNf',
  2: 'THB9S4bRBzR6Zwt4fz3hAfi3TC3AC6pLhx',
  3: 'TLfjCGSzMXJ65C2PKSpb365nExUZqPL282',
  4: 'TZJnxbvgJVmDfjp39H2uXn6qxa2KdaJryD',
  5: 'TB1uPEDoBoBm7gbdi2K1Q3gSEmN8kzqfJH',
  6: 'TVHgBqX1hNdidGppAsazd4SamcBB38BZ9U',
  7: 'TSqBty9XoT2HfpriZ7L4q1WPnYqSh3Rg39',
};

export const MATRIX_TOP7_NODES: Record<number, MatrixMemberNode> = {
  1: {
    seatNumber: 1,
    roleTitle: 'Apex Founding Member (#0001)',
    tierLabel: 'Root Tier (Apex Node)',
    legPosition: 'apex',
    parentSeat: null,
    downlineSeats: [2, 3],
    sponsorDescription: 'Protocol Vault (4 Streams)',
  },
  2: {
    seatNumber: 2,
    roleTitle: 'Tier 1 Primary Left Node',
    tierLabel: 'Tier 1 — Left Branch',
    legPosition: 'left',
    parentSeat: 1,
    downlineSeats: [4, 5],
    sponsorDescription: 'Council Seat #1',
  },
  3: {
    seatNumber: 3,
    roleTitle: 'Tier 1 Primary Right Node',
    tierLabel: 'Tier 1 — Right Branch',
    legPosition: 'right',
    parentSeat: 1,
    downlineSeats: [6, 7],
    sponsorDescription: 'Council Seat #1',
  },
  4: {
    seatNumber: 4,
    roleTitle: 'Tier 2 Left Sub-branch Node',
    tierLabel: 'Tier 2 — Left Sub-branch',
    legPosition: 'left',
    parentSeat: 2,
    downlineSeats: [],
    sponsorDescription: 'Council Seat #2',
  },
  5: {
    seatNumber: 5,
    roleTitle: 'Tier 2 Right Sub-branch Node',
    tierLabel: 'Tier 2 — Right Sub-branch',
    legPosition: 'right',
    parentSeat: 2,
    downlineSeats: [],
    sponsorDescription: 'Council Seat #2',
  },
  6: {
    seatNumber: 6,
    roleTitle: 'Tier 2 Left Sub-branch Node',
    tierLabel: 'Tier 2 — Left Sub-branch',
    legPosition: 'left',
    parentSeat: 3,
    downlineSeats: [],
    sponsorDescription: 'Council Seat #3',
  },
  7: {
    seatNumber: 7,
    roleTitle: 'Tier 2 Right Sub-branch Node',
    tierLabel: 'Tier 2 — Right Sub-branch',
    legPosition: 'right',
    parentSeat: 3,
    downlineSeats: [],
    sponsorDescription: 'Council Seat #3',
  },
};

/**
 * Returns the base URL for the Matrix application
 */
export function getMatrixBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_MATRIX_URL) {
    return process.env.NEXT_PUBLIC_MATRIX_URL.replace(/\/+$/, '');
  }
  // 1. Client-side browser inspection
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Local development or LAN access: point directly to local Matrix dev server (Port 3001)
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
      return `${window.location.protocol}//${host}:3001`;
    }
  }

  // Production default
  return 'https://equorafimatrix.com';
}

import { resolveQuadrantParent, MATRIX_GATEWAYS, PROTOCOL_VAULT_ADDRESS } from './matrixGateways';

/**
 * Resolves the sponsor wallet address for a given council seat (1 to 100)
 */
export function resolveSponsorAddressForSeat(
  seat: number,
  knownMembers?: Array<{ position: number; address: string; referralCode?: string | number }>
): string {
  const boundedSeat = Math.max(1, Math.min(100, seat || 1));
  const quadrantInfo = resolveQuadrantParent(boundedSeat);

  // If directly under a Gateway (k <= 2)
  if (quadrantInfo.isGatewayDirect) {
    return quadrantInfo.gateway.gatewayCode || quadrantInfo.gateway.gatewayAddress || PROTOCOL_VAULT_ADDRESS;
  }

  // If under another DAO seat in the quadrant (k >= 3)
  const parentSeat = quadrantInfo.parentSeat;
  if (!parentSeat) return PROTOCOL_VAULT_ADDRESS;

  if (knownMembers && knownMembers.length > 0) {
    const found = knownMembers.find((m) => m.position === parentSeat);
    if (found) {
      if (found.referralCode && String(found.referralCode).length >= 5) {
        return String(found.referralCode);
      }
      if (found.address && (found.address.startsWith('T') || found.address.startsWith('0x'))) {
        return found.address;
      }
    }
  }

  return GENESIS_COUNCIL_TESTNET_ADDRESSES[parentSeat] || PROTOCOL_VAULT_ADDRESS;
}

/**
 * Generates the referral link to enter Matrix Gate for a specific council seat (1 to 100)
 */
export function getMatrixReferralUrl(
  seat: number,
  knownMembers?: Array<{ position: number; address: string; referralCode?: string | number }>,
  customSponsor?: string
): string {
  const base = getMatrixBaseUrl();
  const cleanBase = base.replace(/\/+$/, '');
  const boundedSeat = Math.max(1, Math.min(100, seat || 1));
  const quadrantInfo = resolveQuadrantParent(boundedSeat);

  const sponsor = customSponsor || resolveSponsorAddressForSeat(boundedSeat, knownMembers);
  if (sponsor) {
    return `${cleanBase}/gate?ref=${encodeURIComponent(sponsor)}&seat=${boundedSeat}&quadrant=${quadrantInfo.quadrant}`;
  }
  return `${cleanBase}/gate?seat=${boundedSeat}&quadrant=${quadrantInfo.quadrant}`;
}
