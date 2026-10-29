import { router } from "./trpc";
import { daoRouter } from "./routes/dao/route";
import { matrixRouter } from "./routes/matrix/route";
import { usersRouter } from "./routes/users/route";
import { authRouter } from "./routes/auth/route";
import { rewardsRouter } from "./routes/rewards/route";
import { statsRouter } from "./routes/stats/route";
import { leaderboardRouter } from "./routes/leaderboard/route";

export const serverRouter = router({
  dao: daoRouter,
  matrix: matrixRouter,
  users: usersRouter,
  auth: authRouter,
  rewards: rewardsRouter,
  stats: statsRouter,
  leaderboard: leaderboardRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
