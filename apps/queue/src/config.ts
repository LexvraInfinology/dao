import dotenv from "dotenv";
import path from "path";

// Load workspace root or local .env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  worker: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || "5", 10),
    pollIntervalMs: parseInt(process.env.QUEUE_POLL_INTERVAL_MS || "3000", 10),
  },
};
