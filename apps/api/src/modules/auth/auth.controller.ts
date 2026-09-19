import { Router, Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { requireAuth } from "../../middleware/auth.middleware";

export const authRouter = Router();

/**
 * POST /api/auth/nonce
 * Request a cryptographic nonce for a specific wallet address
 */
authRouter.post("/nonce", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;
    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: "Valid Ethereum wallet address is required.",
      });
    }

    const nonce = await authService.generateNonceForAddress(address);
    res.json({
      success: true,
      data: { nonce },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/verify
 * Verify the user's signed SIWE message and generate a JWT session
 */
authRouter.post("/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, signature } = req.body;
    if (!message || !signature) {
      return res.status(400).json({
        success: false,
        error: "Message and signature parameters are required.",
      });
    }

    const authData = await authService.verifySignature(message, signature);
    res.json({
      success: true,
      data: authData,
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: err.message || "Cryptographic signature verification failed.",
    });
  }
});

/**
 * GET /api/auth/me
 * Retrieve the current authenticated user's profile
 */
authRouter.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userProfile = await authService.getSessionProfile(req.user!.address);
    res.json({
      success: true,
      data: userProfile,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 */
authRouter.post("/logout", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Logged out successfully.",
  });
});
