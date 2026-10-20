import dns from "node:dns";
try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch {}

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

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`⚠️ Port ${config.port} is already in use by another process.`);
      console.error(`   Ensure no other API or background dev server instance is running on port ${config.port}.`);
    } else {
      console.error("❌ API server error:", err);
    }
    process.exit(1);
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
