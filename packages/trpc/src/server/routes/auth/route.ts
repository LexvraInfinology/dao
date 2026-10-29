import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { authService } from "../../services";
import { getNonceInput, verifySignatureInput } from "./model";

export const authRouter = router({
  nonce: publicProcedure.input(getNonceInput).query(async ({ input }) => {
    const nonce = await authService.generateNonceForAddress(input.address);
    return {
      address: input.address,
      nonce,
    };
  }),

  verify: publicProcedure.input(verifySignatureInput).mutation(async ({ input }) => {
    return authService.verifySignature(input.message, input.signature);
  }),

  session: protectedProcedure.query(async ({ ctx }) => {
    return authService.getSessionProfile(ctx.user.address);
  }),

  logout: publicProcedure.mutation(() => {
    return { success: true, message: "Logged out successfully." };
  }),
});
