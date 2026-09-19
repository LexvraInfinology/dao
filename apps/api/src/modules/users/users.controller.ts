import { Router, Request, Response, NextFunction } from "express";
import { usersService } from "./users.service";

export const usersRouter = Router();

/**
 * GET /api/users/:address
 * Get complete user profile
 */
usersRouter.get("/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const user = await usersService.getUserByAddress(address);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found in protocol registry.",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/:address/referrals
 * Get paginated list of direct downline referrals
 */
usersRouter.get("/:address/referrals", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const page = parseInt(req.query.page as string || "1", 10);
    const limit = parseInt(req.query.limit as string || "20", 10);

    const result = await usersService.getDirectReferrals(address, page, limit);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/:address/tree
 * Get multi-level genealogy tree structure
 */
usersRouter.get("/:address/tree", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const tree = await usersService.getReferralTree(address);
    if (!tree) {
      return res.status(404).json({
        success: false,
        error: "User tree not found.",
      });
    }

    res.json({
      success: true,
      data: tree,
    });
  } catch (err) {
    next(err);
  }
});
