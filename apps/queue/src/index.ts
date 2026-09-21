import { createLogger } from "@equora/logger";
import { QueueWorker } from "./worker";
import { config } from "./config";
import prisma from "@equora/database";

const logger = createLogger("Queue:Main");

async function bootstrap() {
  logger.info("========================================================");
  logger.info("🚀 EQUORA Background Queue & Worker Service starting");
  logger.info(`🌍 Environment: ${config.env}`);
  logger.info(`📡 Redis Host: ${config.redis.host}:${config.redis.port}`);
  logger.info("========================================================");

  const worker = new QueueWorker();
  await worker.start();

  const handleShutdown = async (signal: string) => {
    logger.info(`🛑 Received ${signal}, shutting down queue worker...`);
    await worker.stop();
    await prisma.$disconnect();
    logger.info("🔌 Database and queue connections closed.");
    process.exit(0);
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.error("❌ Fatal error in queue service:", err);
  process.exit(1);
});
