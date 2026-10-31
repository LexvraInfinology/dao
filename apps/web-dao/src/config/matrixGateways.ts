/**
 * Genesis Matrix 4-Quadrant Gateway Anchors & Binary Subtree Engine
 * (apps/web-dao/src/config/matrixGateways.ts)
 * 
 * Implements the client specification:
 * - 7 Seed IDs (U, 1, 2, 3, 4, 5, 6) establish the foundation.
 * - 4 Tier-2 Gateway Nodes (IDs 3, 4, 5, 6) distribute the 100 Genesis DAO members:
 *     • Quadrant 1 (Seats  1 –  25): Gateway Link 1 (Seed ID 3)
 *     • Quadrant 2 (Seats 26 –  50): Gateway Link 2 (Seed ID 4)
 *     • Quadrant 3 (Seats 51 –  75): Gateway Link 3 (Seed ID 5)
 *     • Quadrant 4 (Seats 76 – 100): Gateway Link 4 (Seed ID 6)
 *
 * Inside each quadrant of 25 members, members fill a symmetrical 0-indexed binary heap:
 * Parent Index: p = Math.floor((k - 1) / 2)
 *
 * Guaranteed Result:
 * - Seats 1 & 2 in each quadrant connect directly to the Gateway.
 * - Every subsequent seat (k >= 3) connects to their exact binary parent seat in that quadrant.
 * - Every single parent seat receives EXACTLY 2 direct referrals, fulfilling their 2-referral qualification!
 */

import { getMatrixBaseUrl } from './matrixTree';

export interface MatrixGatewayInfo {
  linkNumber: 1 | 2 | 3 | 4;
  gatewayNodeId: 3 | 4 | 5 | 6;
  gatewayAddress: string;
  gatewayCode?: string;
  assignedSeatRange: string;
  minSeat: number;
  maxSeat: number;
  label: string;
}

export const PROTOCOL_VAULT_ADDRESS =
  process.env.NEXT_PUBLIC_MAINNET_VAULT_ADDRESS ||
  process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
  "THoeHcGMEzNDsE8xPZuorTYgV9hje1RkGw";

export const MATRIX_GATEWAYS: Record<1 | 2 | 3 | 4, MatrixGatewayInfo> = {
  1: {
    linkNumber: 1,
    gatewayNodeId: 3,
    gatewayAddress: process.env.NEXT_PUBLIC_GATEWAY_LINK_1 || PROTOCOL_VAULT_ADDRESS,
    gatewayCode: process.env.NEXT_PUBLIC_GATEWAY_CODE_1 || "",
    assignedSeatRange: "Seats 1 – 25",
    minSeat: 1,
    maxSeat: 25,
    label: "Gateway Link 1 — Primary Power Leg (Seed ID 3)",
  },
  2: {
    linkNumber: 2,
    gatewayNodeId: 4,
    gatewayAddress: process.env.NEXT_PUBLIC_GATEWAY_LINK_2 || PROTOCOL_VAULT_ADDRESS,
    gatewayCode: process.env.NEXT_PUBLIC_GATEWAY_CODE_2 || "",
    assignedSeatRange: "Seats 26 – 50",
    minSeat: 26,
    maxSeat: 50,
    label: "Gateway Link 2 — Inner Left Leg (Seed ID 4)",
  },
  3: {
    linkNumber: 3,
    gatewayNodeId: 5,
    gatewayAddress: process.env.NEXT_PUBLIC_GATEWAY_LINK_3 || PROTOCOL_VAULT_ADDRESS,
    gatewayCode: process.env.NEXT_PUBLIC_GATEWAY_CODE_3 || "",
    assignedSeatRange: "Seats 51 – 75",
    minSeat: 51,
    maxSeat: 75,
    label: "Gateway Link 3 — Inner Right Leg (Seed ID 5)",
  },
  4: {
    linkNumber: 4,
    gatewayNodeId: 6,
    gatewayAddress: process.env.NEXT_PUBLIC_GATEWAY_LINK_4 || PROTOCOL_VAULT_ADDRESS,
    gatewayCode: process.env.NEXT_PUBLIC_GATEWAY_CODE_4 || "",
    assignedSeatRange: "Seats 76 – 100",
    minSeat: 76,
    maxSeat: 100,
    label: "Gateway Link 4 — Power Right Leg (Seed ID 6)",
  },
};

export interface QuadrantParentResult {
  quadrant: 1 | 2 | 3 | 4;
  gateway: MatrixGatewayInfo;
  isGatewayDirect: boolean;   // true if k <= 2 (directly under gateway)
  parentSeat: number | null;  // null if k <= 2, otherwise the parent seat number (1 to 100)
  legPosition: 'left' | 'right';
  localIndex: number;         // 1 to 25
  label: string;
}

/**
 * Resolves the exact mathematical binary parent for any DAO seat (1 to 100).
 */
export function resolveQuadrantParent(position: number | null | undefined): QuadrantParentResult {
  const boundedPos = Math.max(1, Math.min(100, position || 1));
  const quadrant = (Math.floor((boundedPos - 1) / 25) + 1) as 1 | 2 | 3 | 4;
  const k = ((boundedPos - 1) % 25) + 1; // 1 to 25
  const gateway = MATRIX_GATEWAYS[quadrant];

  if (k <= 2) {
    return {
      quadrant,
      gateway,
      isGatewayDirect: true,
      parentSeat: null,
      legPosition: k === 1 ? 'left' : 'right',
      localIndex: k,
      label: `${gateway.label} (${k === 1 ? 'Primary Left' : 'Primary Right'})`,
    };
  }

  // k >= 3: 0-indexed binary heap parent index
  const parentK = Math.floor((k - 1) / 2);
  const parentSeat = (quadrant - 1) * 25 + parentK;
  const legPosition: 'left' | 'right' = (k % 2 === 1) ? 'left' : 'right';

  return {
    quadrant,
    gateway,
    isGatewayDirect: false,
    parentSeat,
    legPosition,
    localIndex: k,
    label: `Council Seat #${parentSeat} (${legPosition === 'left' ? 'Left Node' : 'Right Node'})`,
  };
}

/**
 * Returns the exact gateway assigned to a DAO position (1 to 100).
 */
export function getGatewayForDaoPosition(position: number | null | undefined): MatrixGatewayInfo {
  const res = resolveQuadrantParent(position);
  return res.gateway;
}

/**
 * Generates the local or production URL for claiming Matrix Slot 1
 */
export function getMatrixClaimUrl(
  position: number | null | undefined,
  resolvedSponsor?: string
): string {
  const matrixBase = getMatrixBaseUrl();
  const cleanBase = matrixBase.replace(/\/+$/, "");
  const quadrantInfo = resolveQuadrantParent(position);

  const sponsor = resolvedSponsor || quadrantInfo.gateway.gatewayCode || quadrantInfo.gateway.gatewayAddress;
  return `${cleanBase}/gate?ref=${encodeURIComponent(sponsor)}&seat=${position || 1}&quadrant=${quadrantInfo.quadrant}`;
}
