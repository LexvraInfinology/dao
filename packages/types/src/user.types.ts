export type RankTier = 0 | 1 | 2 | 3 | 4;

export const RANK_NAMES: Record<RankTier, string> = {
  0: "NONE",
  1: "ALPHA",
  2: "PRIME",
  3: "ELITE",
  4: "CROWN",
};

export interface UserProfile {
  id: string;
  address: string;
  userId: number;
  sponsorAddress: string | null;
  directReferralsCount: number;
  isQualified: boolean;
  registrationTimestamp: string;
  txHash: string | null;
}

export interface UserGenealogyNode {
  address: string;
  userId: number;
  directReferralsCount: number;
  isQualified: boolean;
  level: number;
  children: UserGenealogyNode[];
}

export interface AuthSession {
  address: string;
  chainId: number;
  issuedAt: string;
  expiresAt: string;
}
