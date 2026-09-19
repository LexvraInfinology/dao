import { Router, Request, Response, NextFunction } from "express";
import { statsService } from "./stats.service";

export const statsRouter = Router();

/**
 * GET /api/stats/global
 */
statsRouter.get("/global", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await statsService.getGlobalProtocolStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});
