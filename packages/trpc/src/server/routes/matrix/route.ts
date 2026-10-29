import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { matrixService } from "../../services";
import {
  getUserSlotsInput,
  getSlotDetailsInput,
  getUserCyclesInput,
  getPlacementHistoryInput,
  getCycleHistoryInput,
} from "./model";

export const matrixRouter = router({
  stats: publicProcedure.query(async () => {
    return matrixService.getMatrixStats();
  }),

  userSlots: publicProcedure.input(getUserSlotsInput).query(async ({ input }) => {
    return matrixService.getUserSlots(input.address);
  }),

  slotDetails: publicProcedure.input(getSlotDetailsInput).query(async ({ input }) => {
    return matrixService.getSlotDetails(input.address, input.slotNumber);
  }),

  userCycles: publicProcedure.input(getUserCyclesInput).query(async ({ input }) => {
    return matrixService.getUserCycles(input.address, input.slotNumber);
  }),

  cycleHistory: publicProcedure.input(getCycleHistoryInput).query(async ({ input }) => {
    return matrixService.getCycleHistory(input.address, input.slotNumber);
  }),

  history: publicProcedure.input(getPlacementHistoryInput).query(async ({ input }) => {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    return matrixService.getPlacementHistory(input.address, page, limit);
  }),

  mySlots: protectedProcedure.query(async ({ ctx }) => {
    return matrixService.getUserSlots(ctx.user.address);
  }),
});
