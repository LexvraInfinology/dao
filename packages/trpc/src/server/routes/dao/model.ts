import { z } from "zod";

export const getDaoMembersInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(100),
});

export const getDaoEventsInput = z.object({
  limit: z.number().int().min(1).max(100).default(20),
});

export const getVaultDepositSplitsInput = z.object({
  limit: z.number().int().min(1).max(100).default(20),
});

export const getDaoProposalsInput = z.object({
  limit: z.number().int().min(1).max(100).default(20),
});

export const getMemberByAddressInput = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address"),
});
