export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  isExternal?: boolean;
}

export interface MetricItem {
  value: string;
  label: string;
  sublabel?: string;
}

export interface PillarCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface NetworkHub {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  icon: string;
}

export interface LiveActivityEvent {
  id: string;
  title: string;
  subtitle: string;
  memberId: string;
  timeAgo: string;
  type: 'member_joined' | 'slot_opened' | 'level_updated' | 'reward_claimed';
}

export interface RewardPool {
  id: string;
  num: string;
  name: string;
  subtitle: string;
  targetSlot: string;
  monthlyReward: string;
  imageRef: string;
  requirements: string[];
  perks: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// DAO Specific Types
export interface DaoSeat {
  seatNumber: number;
  status: 'claimed' | 'available' | 'open' | 'locked';
  owner?: string;
  memberId?: string;
  votingPower: string;
  joinedDate?: string;
}

export interface DaoProposal {
  id: string;
  title: string;
  category?: string;
  status: 'Active' | 'Passed' | 'Rejected';
  votesFor: number;
  votesAgainst: number;
  totalVotes?: number;
  quorum: number | string;
  endsIn: string;
  proposer?: string;
  description?: string;
  summary?: string;
}

export type Proposal = DaoProposal;

export interface DaoTransaction {
  id: string;
  hash: string;
  type: string;
  amount?: string;
  amountUsd?: number;
  amountTrob?: number;
  from?: string;
  to?: string;
  timestamp: string;
  status?: string;
}

export interface MemberProfile {
  memberId: string;
  walletAddress: string;
  seatNumber: string;
  votingPower: string;
  totalRewardsEarned: string;
  participationRate: string;
  status: string;
  tier: string;
  joinDate: string;
}
