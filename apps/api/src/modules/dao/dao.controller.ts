import { Router, Request, Response, NextFunction } from "express";
import { daoService } from "./dao.service";

export const daoRouter = Router();

/**
 * GET /api/dao/stats
 */
daoRouter.get("/stats", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await daoService.getDAOStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dao/members
 */
daoRouter.get("/members", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || "1", 10);
    const limit = parseInt(req.query.limit as string || "100", 10);

    const members = await daoService.getDAOMembers(page, limit);
    res.json({
      success: true,
      data: members,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dao/events
 */
daoRouter.get("/events", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string || "20", 10);
    const events = await daoService.getDAOEvents(limit);
    res.json({
      success: true,
      data: events,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dao/splits
 */
daoRouter.get("/splits", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const splits = await daoService.getVaultDepositSplits(limit);
    res.json({
      success: true,
      data: splits,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dao/proposals
 */
daoRouter.get("/proposals", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const proposals = await daoService.getDAOProposals(limit);
    res.json({
      success: true,
      data: proposals,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dao/:address
 */
daoRouter.get("/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const member = await daoService.getMemberByAddress(address);
    res.json({
      success: true,
      data: member,
    });
  } catch (err) {
    next(err);
  }
});
