import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import * as trpcExpress from "@trpc/server/adapters/express";
import { serverRouter, createContext } from "@equora/trpc";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";

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

  // Root API Information & Discovery
  app.get("/", (req, res) => {
    res.json({
      message: "EQUORA Protocol API is up and running...",
      service: "@equora/api",
      version: "1.0.0",
      trpcEndpoint: "/trpc",
      healthEndpoint: "/health",
      chainId: config.blockchain.chainId,
    });
  });

  // Health check
  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      service: "equora-api",
      timestamp: new Date().toISOString(),
      chainId: config.blockchain.chainId,
    });
  });

  // tRPC Express Middleware (mounted on /trpc)
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: serverRouter,
      createContext,
    })
  );

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
