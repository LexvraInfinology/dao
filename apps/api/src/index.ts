import { createApp } from "./app";
import { config } from "./config";
import prisma from "@equora/database";

async function bootstrap() {
  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`========================================================`);
    console.log(`🚀 EQUORA API Service is running`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(`🌍 Environment: ${config.env}`);
    console.log(`🔗 Target Chain ID: ${config.blockchain.chainId}`);
    console.log(`========================================================`);
  });

  const handleShutdown = async (signal: string) => {
    console.log(`🛑 Received ${signal}, gracefully shutting down API...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log("🔌 Database connections closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error("❌ Fatal error starting API server:", err);
  process.exit(1);
});
