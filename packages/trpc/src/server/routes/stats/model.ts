import { z } from "zod";

export const getProtocolStatsOutput = z.object({
  totalMembers: z.number(),
  daoMembersCount: z.number(),
  daoCompleted: z.boolean(),
  totalVolumeBTT: z.number(),
  totalPlacements: z.number(),
  totalRecycles: z.number(),
});
