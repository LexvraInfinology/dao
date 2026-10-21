import { Router, Request, Response, NextFunction } from "express";
import { matrixService } from "@equora/services";

export const matrixRouter = Router();

// ── USER & PROFILE ──────────────────────────────────────────────────────────

/**
 * GET /api/matrix/profile/:address
 * Returns full profile, earnings, direct counts, rank tier
 */
matrixRouter.get("/profile/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const sponsor = req.query.sponsor as string | undefined;
    const profile = await matrixService.getUserProfile(address, sponsor);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/matrix/profile/:address
 * Updates user profile details (username, avatar, bio, telegram, twitter)
 */
matrixRouter.post("/profile/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const updated = await matrixService.updateUserProfile(address, req.body);
    res.json({ success: true, data: updated, message: "Profile updated successfully" });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/matrix/user/register
 * Initializes or fetches a user with sponsor link
 */
matrixRouter.post("/user/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, sponsorAddress } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, error: "Address is required" });
    }
    const user = await matrixService.getOrCreateUser(address, sponsorAddress);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// ── DASHBOARD ───────────────────────────────────────────────────────────────

/**
 * GET /api/matrix/dashboard/:address
 * Aggregated stats for the dashboard
 */
matrixRouter.get("/dashboard/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const overview = await matrixService.getDashboardOverview(address);
    res.json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
});

// ── SLOTS & MATRIX NAVIGATION ───────────────────────────────────────────────

/**
 * GET /api/matrix/slots/:address
 * Returns all 12 slots overview
 */
matrixRouter.get("/slots/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const slots = await matrixService.getUserSlots(address);
    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/matrix/slots/:address/:slotNumber
 * Returns specific slot with 14 occupant node positions
 */
matrixRouter.get("/slots/:address/:slotNumber", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, slotNumber } = req.params;
    const cycle = req.query.cycle ? Number(req.query.cycle) : undefined;
    const details = await matrixService.getSlotDetails(address, Number(slotNumber), cycle);
    if (!details) {
      return res.status(404).json({ success: false, error: "Slot not found" });
    }
    res.json({ success: true, data: details });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/matrix/slots/buy
 * Buys/unlocks a slot and runs placement logic
 */
matrixRouter.post("/slots/buy", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userAddress, slotNumber, txHash } = req.body;
    if (!userAddress || !slotNumber) {
      return res.status(400).json({ success: false, error: "userAddress and slotNumber are required" });
    }
    const result = await matrixService.buySlot(userAddress, Number(slotNumber), txHash);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || "Failed to buy slot" });
  }
});

/**
 * GET /api/matrix/directs/:address
 * Direct team members for the matrix view
 */
matrixRouter.get("/directs/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const directs = await matrixService.getDirectMembers(address);
    res.json({ success: true, data: directs });
  } catch (err) {
    next(err);
  }
});

// ── LEADERBOARD ─────────────────────────────────────────────────────────────

/**
 * GET /api/matrix/leaderboard
 */
matrixRouter.get("/leaderboard", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as any) || "all";
    const limit = req.query.limit ? Number(req.query.limit) : 25;
    const leaderboard = await matrixService.getLeaderboard(period, limit);
    res.json({ success: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/matrix/leaderboard/rank/:address
 */
matrixRouter.get("/leaderboard/rank/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const userRank = await matrixService.getUserRank(address);
    res.json({ success: true, data: userRank });
  } catch (err) {
    next(err);
  }
});

// ── TRANSACTIONS ────────────────────────────────────────────────────────────

/**
 * GET /api/matrix/transactions/:address
 */
matrixRouter.get("/transactions/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const type = req.query.type as string | undefined;

    const result = await matrixService.getTransactions(address, { page, limit, type });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ── EARNINGS & WITHDRAWAL ───────────────────────────────────────────────────

/**
 * GET /api/matrix/earnings/:address
 */
matrixRouter.get("/earnings/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const overview = await matrixService.getEarningsOverview(address);
    res.json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/matrix/withdraw
 */
matrixRouter.post("/withdraw", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userAddress, amount } = req.body;
    if (!userAddress || !amount) {
      return res.status(400).json({ success: false, error: "userAddress and amount are required" });
    }
    const result = await matrixService.requestWithdrawal(userAddress, Number(amount));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || "Withdrawal failed" });
  }
});

// ── SETTINGS ────────────────────────────────────────────────────────────────

/**
 * GET /api/matrix/settings/:address
 */
matrixRouter.get("/settings/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const settings = await matrixService.getUserSettings(address);
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/matrix/settings/:address
 */
matrixRouter.post("/settings/:address", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const updated = await matrixService.updateUserSettings(address, req.body);
    res.json({ success: true, data: updated, message: "Settings saved successfully" });
  } catch (err) {
    next(err);
  }
});

// ── DEV SEEDING ─────────────────────────────────────────────────────────────

/**
 * POST /api/matrix/dev/seed
 */
matrixRouter.post("/dev/seed", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, error: "address is required" });
    }
    await matrixService.seedMatrixDevData(address);
    res.json({ success: true, message: `Successfully seeded Matrix demo data for ${address}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to seed demo data" });
  }
});
