import { Router, Request, Response, NextFunction } from "express";
import { leaderboardService } from "./leaderboard.service";

export const leaderboardRouter = Router();

/**
 * GET /api/leaderboard/earners
 */
leaderboardRouter.get("/earners", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string || "20", 10);
    const earners = await leaderboardService.getTopEarners(limit);
    res.json({
      success: true,
      data: earners,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/leaderboard/referrers
 */
leaderboardRouter.get("/referrers", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string || "20", 10);
    const referrers = await leaderboardService.getTopReferrers(limit);
    res.json({
      success: true,
      data: referrers,
    });
  } catch (err) {
    next(err);
  }
});
