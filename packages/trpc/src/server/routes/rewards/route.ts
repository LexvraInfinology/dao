import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { rewardsService } from "../../services";
import { getUserRewardsInput } from "./model";

export const rewardsRouter = router({
  userRewards: publicProcedure.input(getUserRewardsInput).query(async ({ input }) => {
    return rewardsService.getUserRewards(input.address);
  }),

  myRewards: protectedProcedure.query(async ({ ctx }) => {
    return rewardsService.getUserRewards(ctx.user.address);
  }),
});
