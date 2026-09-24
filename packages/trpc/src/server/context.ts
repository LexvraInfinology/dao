import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { authService } from "@equora/services";

export interface TRPCCtxUser {
  address: string;
  chainId?: number;
}

export interface TRPCContext {
  user?: TRPCCtxUser;
}

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<TRPCContext> {
  let user: TRPCCtxUser | undefined = undefined;

  // Extract from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  let token: string | undefined = undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if ((req as any).cookies?.["token"] || (req as any).cookies?.["authentication-token"]) {
    token = (req as any).cookies["token"] || (req as any).cookies["authentication-token"];
  }

  if (token) {
    try {
      const decoded = await authService.verifyToken(token);
      user = {
        address: decoded.address.toLowerCase(),
        chainId: decoded.chainId,
      };
    } catch (err) {
      // Invalid token, keep user undefined
    }
  }

  return {
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
