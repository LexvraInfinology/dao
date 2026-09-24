import { router, publicProcedure } from "../../trpc";
import { leaderboardService } from "../../services";
import { getLeaderboardInput } from "./model";

export const leaderboardRouter = router({
  topEarners: publicProcedure.input(getLeaderboardInput.optional()).query(async ({ input }) => {
    const limit = input?.limit ?? 20;
    return leaderboardService.getTopEarners(limit);
  }),

  topReferrers: publicProcedure.input(getLeaderboardInput.optional()).query(async ({ input }) => {
    const limit = input?.limit ?? 20;
    return leaderboardService.getTopReferrers(limit);
  }),
});
