import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";

export const tRPCContext = initTRPC.context<Context>().create();

export const router = tRPCContext.router;
export const publicProcedure = tRPCContext.procedure;
export const middleware = tRPCContext.middleware;

export const protectedProcedure = tRPCContext.procedure.use(async (opts) => {
  const { ctx } = opts;

  if (!ctx.user || !ctx.user.address) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required. Please connect your Web3 wallet and sign in.",
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
