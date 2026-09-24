import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { usersService } from "../../services";
import {
  getUserByAddressInput,
  getDirectReferralsInput,
  getReferralTreeInput,
} from "./model";

export const usersRouter = router({
  byAddress: publicProcedure.input(getUserByAddressInput).query(async ({ input }) => {
    return usersService.getUserByAddress(input.address);
  }),

  directReferrals: publicProcedure.input(getDirectReferralsInput).query(async ({ input }) => {
    return usersService.getDirectReferrals(input.address, input.page, input.limit);
  }),

  referralTree: publicProcedure.input(getReferralTreeInput).query(async ({ input }) => {
    return usersService.getReferralTree(input.address, input.maxDepth);
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return usersService.getUserByAddress(ctx.user.address);
  }),
});
