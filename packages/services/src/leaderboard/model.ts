export interface LeaderboardEarnerDTO {
  rank: number;
  address: string;
  userId: number;
  directCount: number;
  highestSlot: number;
  totalEarned: number;
}

export interface LeaderboardReferrerDTO {
  rank: number;
  address: string;
  userId: number;
  directCount: number;
  highestSlot: number;
}
