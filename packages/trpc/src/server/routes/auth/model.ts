import { z } from "zod";

export const getNonceInput = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address"),
});

export const verifySignatureInput = z.object({
  message: z.string().min(1, "Message text is required"),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, "Invalid signature format"),
});
