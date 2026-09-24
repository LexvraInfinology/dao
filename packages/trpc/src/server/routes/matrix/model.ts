import { z } from "zod";

export const getUserSlotsInput = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address"),
});

export const getSlotDetailsInput = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address"),
  slotNumber: z.number().int().min(1).max(12),
});

export const getUserCyclesInput = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address"),
  slotNumber: z.number().int().min(1).max(12).optional(),
});

export const getPlacementHistoryInput = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address"),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
});

export const getCycleHistoryInput = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address"),
  slotNumber: z.number().int().min(1).max(12),
});

