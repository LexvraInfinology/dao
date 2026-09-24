export interface AuthVerifyResultDTO {
  token: string;
  user: {
    address: string;
    chainId: number;
    isRegistered: boolean;
    userId: number | null;
    sponsor: string | null;
    isQualified: boolean;
  };
}

export interface SessionProfileDTO {
  address: string;
  isRegistered: boolean;
  userId: number | null;
  sponsor: string | null;
  isQualified: boolean;
  daoMember: boolean;
  daoPosition: number | null;
  nftBadgesCount: number;
}
