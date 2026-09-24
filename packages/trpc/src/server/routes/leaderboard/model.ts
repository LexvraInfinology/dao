import { z } from "zod";

export const getLeaderboardInput = z.object({
  limit: z.number().int().min(1).max(100).default(20),
});
