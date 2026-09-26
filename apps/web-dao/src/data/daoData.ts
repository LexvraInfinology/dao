import {
  DaoSeat,
  DaoProposal,
  DaoTransaction,
  MemberProfile,
} from '@/types';

export const CURRENT_USER: Partial<MemberProfile> = {};

export const DAO_COUNCIL_STATS = {
  totalSeats: 100,
  capacity: 100,
  seatPrice: '$300 TROB',
  phase: 'PHASE 1',
};

export const INITIAL_SEATS: DaoSeat[] = [];

export const DAO_PROPOSALS: DaoProposal[] = [];

export const PROPOSALS = DAO_PROPOSALS;

export const DAO_TRANSACTIONS: DaoTransaction[] = [];
