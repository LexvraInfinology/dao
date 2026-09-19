// ==============================================================================
// B-TITAN PROTOCOL — PRISMA CLIENT SINGLETON & DATABASE UTILITIES
// ==============================================================================

import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global `var` declarations in TypeScript
  // eslint-disable-next-line no-var
  var __btitan_prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__btitan_prisma__ ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__btitan_prisma__ = prisma;
}

export * from "@prisma/client";
export default prisma;
