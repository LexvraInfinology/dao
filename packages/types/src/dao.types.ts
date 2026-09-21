export type DaoStatus = "active" | "queued" | "completed" | "defaulted";

export interface DaoMemberInfo {
  position: number;
  address: string;
  entryAmountBtt: string;
  pushedAmountBtt: string;
  joinedAt: string;
  status: DaoStatus;
  txHash: string;
}

export interface DaoOverview {
  capacity: number;
  totalMembers: number;
  isClosed: boolean;
  totalDistributedBtt: string;
  distributionMode: string;
  availableSeats: number;
}

export type ProposalStatus = "PENDING" | "ACTIVE" | "PASSED" | "REJECTED" | "EXECUTED";

export interface DaoProposalDetails {
  proposalId: number;
  proposer: string;
  title: string;
  description: string;
  status: ProposalStatus;
  startTime: string;
  endTime: string;
  votesFor: string;
  votesAgainst: string;
}
