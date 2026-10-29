import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { daoService } from "../../services";
import {
  getDaoMembersInput,
  getDaoEventsInput,
  getVaultDepositSplitsInput,
  getDaoProposalsInput,
  getMemberByAddressInput,
} from "./model";

export const daoRouter = router({
  stats: publicProcedure.query(async () => {
    return daoService.getDAOStats();
  }),

  members: publicProcedure.input(getDaoMembersInput.optional()).query(async ({ input }) => {
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 100;
    return daoService.getDAOMembers(page, limit);
  }),

  events: publicProcedure.input(getDaoEventsInput.optional()).query(async ({ input }) => {
    const limit = input?.limit ?? 20;
    return daoService.getDAOEvents(limit);
  }),

  splits: publicProcedure.input(getVaultDepositSplitsInput.optional()).query(async ({ input }) => {
    const limit = input?.limit ?? 20;
    return daoService.getVaultDepositSplits(limit);
  }),

  proposals: publicProcedure.input(getDaoProposalsInput.optional()).query(async ({ input }) => {
    const limit = input?.limit ?? 20;
    return daoService.getDAOProposals(limit);
  }),

  memberByAddress: publicProcedure.input(getMemberByAddressInput).query(async ({ input }) => {
    return daoService.getMemberByAddress(input.address);
  }),

  myMembership: protectedProcedure.query(async ({ ctx }) => {
    return daoService.getMemberByAddress(ctx.user.address);
  }),
});
