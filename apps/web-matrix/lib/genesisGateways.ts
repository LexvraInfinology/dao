/**
 * EQUORA PROTOCOL — GENESIS MATRIX 4-GATEWAY LINK CONFIGURATION
 * Based on the Core 7 Seed IDs architectural specification:
 *
 *                 [ 1 ] Top ID (Root Owner)
 *                /     \
 *             [ 2 ]   [ 3 ]
 *            /    \   /    \
 *          [ 4 ]  [ 5 ] [ 6 ]  [ 7 ]
 *          1st    2nd   3rd    4th
 *         (Link) (Link)(Link) (Link)
 *
 * Distribution to 100 Genesis DAO Members:
 * • 1st Link (ID 4)  ──► First 25 DAOs (Seats  1 –  25)
 * • 2nd Link (ID 5)  ──► Next 25 DAOs  (Seats 26 –  50)
 * • 3rd Link (ID 6)  ──► Next 25 DAOs  (Seats 51 –  75)
 * • 4th Link (ID 7)  ──► Last 25 DAOs  (Seats 76 – 100)
 */

export interface GenesisGateway {
  linkIndex: 1 | 2 | 3 | 4;
  anchorId: 4 | 5 | 6 | 7;
  name: string;
  minSeat: number;
  maxSeat: number;
  sponsorAddress: string;
  description: string;
}

export const GENESIS_MATRIX_GATEWAYS: GenesisGateway[] = [
  {
    linkIndex: 1,
    anchorId: 4,
    name: "Gateway 1 (ID 4 • Left-Left)",
    minSeat: 1,
    maxSeat: 25,
    sponsorAddress: process.env.NEXT_PUBLIC_GATEWAY_1_SPONSOR || "0xE5d1e6b17525e18649F78c54e132Ff1e1Efdd90C",
    description: "Assigned to Founding DAO Council Seats 1 to 25",
  },
  {
    linkIndex: 2,
    anchorId: 5,
    name: "Gateway 2 (ID 5 • Left-Right)",
    minSeat: 26,
    maxSeat: 50,
    sponsorAddress: process.env.NEXT_PUBLIC_GATEWAY_2_SPONSOR || "0x2A58f8C6d06EcD7a31A334B81cb15D394142f10b",
    description: "Assigned to Founding DAO Council Seats 26 to 50",
  },
  {
    linkIndex: 3,
    anchorId: 6,
    name: "Gateway 3 (ID 6 • Right-Left)",
    minSeat: 51,
    maxSeat: 75,
    sponsorAddress: process.env.NEXT_PUBLIC_GATEWAY_3_SPONSOR || "0x8898144EbDbE4d4e680a6519E868D8494b8A072F",
    description: "Assigned to Founding DAO Council Seats 51 to 75",
  },
  {
    linkIndex: 4,
    anchorId: 7,
    name: "Gateway 4 (ID 7 • Right-Right)",
    minSeat: 76,
    maxSeat: 100,
    sponsorAddress: process.env.NEXT_PUBLIC_GATEWAY_4_SPONSOR || "0x4f4943E4E8062D637e6b0606B89E23d069634825",
    description: "Assigned to Founding DAO Council Seats 76 to 100",
  },
];

/**
 * Returns the assigned Genesis Gateway for a given DAO seat number (1 to 100)
 */
export function getAssignedGatewayForSeat(seatNumber: number | null | undefined): GenesisGateway | null {
  if (!seatNumber || seatNumber < 1 || seatNumber > 100) return null;
  return GENESIS_MATRIX_GATEWAYS.find(
    (g) => seatNumber >= g.minSeat && seatNumber <= g.maxSeat
  ) || null;
}

/**
 * Checks if a given address matches one of the 4 Genesis Gateway anchors
 */
export function isGenesisGatewayAnchor(address: string | null | undefined): GenesisGateway | null {
  if (!address) return null;
  const clean = address.toLowerCase().trim();
  return GENESIS_MATRIX_GATEWAYS.find(
    (g) => g.sponsorAddress.toLowerCase() === clean
  ) || null;
}
