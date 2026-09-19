import "./config";
import { BlockchainIndexer } from "./indexer";
import prisma from "@btitan/database";

async function main() {
  const indexer = new BlockchainIndexer();

  await indexer.start();

  const handleShutdown = async (signal: string) => {
    console.log(`🛑 Received ${signal}, shutting down indexer...`);
    indexer.stop();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

main().catch((err) => {
  console.error("❌ Fatal indexer error:", err);
  process.exit(1);
});
