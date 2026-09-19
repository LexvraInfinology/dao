import { Router, Request, Response, NextFunction } from "express";
import { matrixService } from "./matrix.service";

export const matrixRouter = Router();

/**
 * GET /api/matrix/:address/slots
 * Get status of all 12 slots for a user
 */
matrixRouter.get("/:address/slots", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const slots = await matrixService.getUserSlots(address);
    res.json({
      success: true,
      data: slots,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/matrix/:address/slots/:slot
 * Get 14-node tree visualization data for a specific slot
 */
matrixRouter.get("/:address/slots/:slot", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, slot } = req.params;
    const slotNumber = parseInt(slot, 10);
    if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > 12) {
      return res.status(400).json({
        success: false,
        error: "Slot number must be between 1 and 12.",
      });
    }

    const slotDetails = await matrixService.getSlotDetails(address, slotNumber);
    res.json({
      success: true,
      data: slotDetails,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/matrix/:address/history
 * Get placement & earnings audit log
 */
matrixRouter.get("/:address/history", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const page = parseInt(req.query.page as string || "1", 10);
    const limit = parseInt(req.query.limit as string || "20", 10);

    const history = await matrixService.getPlacementHistory(address, page, limit);
    res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/matrix/:address/slots/:slot/cycles
 * Get historical cycle snapshots for a slot
 */
matrixRouter.get("/:address/slots/:slot/cycles", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, slot } = req.params;
    const slotNumber = parseInt(slot, 10);
    if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > 12) {
      return res.status(400).json({
        success: false,
        error: "Slot number must be between 1 and 12.",
      });
    }

    const cycles = await matrixService.getCycleHistory(address, slotNumber);
    res.json({
      success: true,
      data: cycles,
    });
  } catch (err) {
    next(err);
  }
});

