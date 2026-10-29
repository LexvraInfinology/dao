import { router, publicProcedure } from "../../trpc";
import { statsService } from "../../services";

export const statsRouter = router({
  protocolOverview: publicProcedure.query(async () => {
    return statsService.getGlobalProtocolStats();
  }),
});
