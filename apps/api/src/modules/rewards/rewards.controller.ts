import { Router, Request, Response, NextFunction } from "express";
import { rewardsService } from "./rewards.service";

export const rewardsRouter = Router();

/**
 * GET /api/rewards/:address
 */
rewardsRouter.get("/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const rewards = await rewardsService.getUserRewards(address);
    res.json({
      success: true,
      data: rewards,
    });
  } catch (err) {
    next(err);
  }
});
