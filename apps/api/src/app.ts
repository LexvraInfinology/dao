import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.controller";
import { usersRouter } from "./modules/users/users.controller";
import { daoRouter } from "./modules/dao/dao.controller";
import { matrixRouter } from "./modules/matrix/matrix.controller";
import { leaderboardRouter } from "./modules/leaderboard/leaderboard.controller";
import { rewardsRouter } from "./modules/rewards/rewards.controller";
import { statsRouter } from "./modules/stats/stats.controller";

export function createApp(): Express {
  const app = express();

  // Security & standard middleware
  app.use(helmet());

  const configuredOrigins = (config.corsOrigin || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:") ||
          configuredOrigins.includes(origin) ||
          config.corsOrigin === "*"
        ) {
          return callback(null, true);
        }
        callback(new Error("CORS policy violation"));
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      service: "equora-api",
      timestamp: new Date().toISOString(),
      chainId: config.blockchain.chainId,
    });
  });

  // API Routes
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/dao", daoRouter);
  app.use("/api/matrix", matrixRouter);
  app.use("/api/leaderboard", leaderboardRouter);
  app.use("/api/rewards", rewardsRouter);
  app.use("/api/stats", statsRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
