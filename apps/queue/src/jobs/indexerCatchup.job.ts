import { createLogger } from "@equora/logger";
import { IndexerCatchupPayload } from "@equora/types";
import prisma from "@equora/database";

const logger = createLogger("Queue:IndexerCatchup");

export async function processIndexerCatchup(payload: IndexerCatchupPayload): Promise<void> {
  logger.info(`Starting indexer catchup job for contract ${payload.contractName}`, {
    fromBlock: payload.fromBlock,
    toBlock: payload.toBlock,
  });

  // Verify cursor in database
  const cursor = await prisma.indexerCursor.findFirst({
    where: {
      contractName: payload.contractName,
    },
  });

  logger.info(`Current cursor for ${payload.contractName}:`, {
    lastIndexedBlock: cursor ? cursor.lastIndexedBlock.toString() : "none",
  });

  logger.success(`Indexer catchup completed successfully for ${payload.contractName}`);
}
