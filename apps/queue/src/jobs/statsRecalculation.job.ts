import { createLogger } from "@btitan/logger";
import { StatsRecalculationPayload } from "@btitan/types";
import prisma from "@btitan/database";

const logger = createLogger("Queue:StatsRecalc");

export async function processStatsRecalculation(payload: StatsRecalculationPayload): Promise<void> {
  logger.info(`Starting protocol statistics recalculation [scope: ${payload.scope}]`);

  const [totalUsers, totalDaoMembers, totalPlacements] = await Promise.all([
    prisma.user.count(),
    prisma.daoMember.count(),
    prisma.matrixPlacement.count(),
  ]);

  logger.info("Recalculation metrics snapshot:", {
    totalUsers,
    totalDaoMembers,
    totalPlacements,
  });

  logger.success(`Protocol statistics recalculation complete.`);
}
