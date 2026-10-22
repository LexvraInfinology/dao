/**
 * Genesis Matrix 4-Quadrant Gateway Anchors (apps/web-dao/src/config/matrixGateways.ts)
 * 
 * Symmetrically distributes the 100 Genesis DAO members into 4 groups of 25:
 * - Seats  1 –  25: Link 1 (Gateway ID 4)
 * - Seats 26 –  50: Link 2 (Gateway ID 5)
 * - Seats 51 –  75: Link 3 (Gateway ID 6)
 * - Seats 76 – 100: Link 4 (Gateway ID 7)
 */

export interface MatrixGatewayInfo {
  linkNumber: 1 | 2 | 3 | 4;
  gatewayNodeId: 4 | 5 | 6 | 7;
  gatewayAddress: string;
  assignedSeatRange: string;
  minSeat: number;
  maxSeat: number;
  label: string;
}

export const MATRIX_GATEWAYS: Record<1 | 2 | 3 | 4, MatrixGatewayInfo> = {
  1: {
    linkNumber: 1,
    gatewayNodeId: 4,
    gatewayAddress:
      process.env.NEXT_PUBLIC_GATEWAY_LINK_1 || "0xE5d1e6b17525e18649F78c54e132Ff1e1Efdd90C",
    assignedSeatRange: "Seats 1 – 25",
    minSeat: 1,
    maxSeat: 25,
    label: "Left-Left Primary Power Leg (Gateway ID 4)",
  },
  2: {
    linkNumber: 2,
    gatewayNodeId: 5,
    gatewayAddress:
      process.env.NEXT_PUBLIC_GATEWAY_LINK_2 || "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    assignedSeatRange: "Seats 26 – 50",
    minSeat: 26,
    maxSeat: 50,
    label: "Left-Right Inner Leg (Gateway ID 5)",
  },
  3: {
    linkNumber: 3,
    gatewayNodeId: 6,
    gatewayAddress:
      process.env.NEXT_PUBLIC_GATEWAY_LINK_3 || "0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB",
    assignedSeatRange: "Seats 51 – 75",
    minSeat: 51,
    maxSeat: 75,
    label: "Right-Left Inner Leg (Gateway ID 6)",
  },
  4: {
    linkNumber: 4,
    gatewayNodeId: 7,
    gatewayAddress:
      process.env.NEXT_PUBLIC_GATEWAY_LINK_4 || "0x587EF4ea31773a6612052d4147776f87B640ac00",
    assignedSeatRange: "Seats 76 – 100",
    minSeat: 76,
    maxSeat: 100,
    label: "Right-Right Power Leg (Gateway ID 7)",
  },
};

/**
 * Returns the exact gateway assigned to a DAO position (1 to 100).
 */
export function getGatewayForDaoPosition(position: number | null | undefined): MatrixGatewayInfo {
  if (!position || position <= 25) return MATRIX_GATEWAYS[1];
  if (position <= 50) return MATRIX_GATEWAYS[2];
  if (position <= 75) return MATRIX_GATEWAYS[3];
  return MATRIX_GATEWAYS[4];
}

/**
 * Generates the local or production URL for claiming Matrix Slot 1
 */
export function getMatrixClaimUrl(position: number | null | undefined): string {
  const gateway = getGatewayForDaoPosition(position);
  const matrixBase =
    process.env.NEXT_PUBLIC_MATRIX_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "/matrix");

  const cleanBase = matrixBase.replace(/\/+$/, "");
  return `${cleanBase}/matrix?ref=${gateway.gatewayAddress}&daoSeat=${position || 1}&gateway=${gateway.linkNumber}`;
}
