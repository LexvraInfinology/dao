import { z } from "zod";

export const getUserRewardsInput = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address"),
});
