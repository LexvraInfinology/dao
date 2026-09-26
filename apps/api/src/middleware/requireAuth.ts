import { Request, Response, NextFunction } from "express";
import { authService } from "@equora/services";

/**
 * JWT bearer-token middleware.
 * Reads "Authorization: Bearer <token>", verifies it, and attaches
 * `req.user = { address, chainId }` for downstream handlers.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Missing or invalid Authorization header." });
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = await authService.verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired session token." });
  }
}
