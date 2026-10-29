export interface UserProfileDTO {
  address: string;
  userId: number;
  sponsorAddress: string | null;
  directReferralsCount: number;
  isQualified: boolean;
  registeredAt: Date;
  daoPosition: number | null;
  highestSlotUnlocked: number;
  totalEarned: number;
  totalWithdrawn: number;
}

export interface DirectReferralItemDTO {
  address: string;
  userId: number;
  registeredAt: Date;
  isQualified: boolean;
  directCount: number;
  isDaoMember: boolean;
  highestSlot: number;
}

export interface DirectReferralsResultDTO {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  referrals: DirectReferralItemDTO[];
}

export interface ReferralTreeLevel2NodeDTO {
  address: string;
  userId: number;
  directCount: number;
  isQualified: boolean;
}

export interface ReferralTreeLevel1NodeDTO {
  address: string;
  userId: number;
  directCount: number;
  isQualified: boolean;
  level2: ReferralTreeLevel2NodeDTO[];
}

export interface ReferralTreeDTO {
  address: string;
  userId: number;
  directCount: number;
  level1: ReferralTreeLevel1NodeDTO[];
}

