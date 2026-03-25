/**
 * Prisma Client Singleton
 *
 * Uses Neon serverless adapter when DATABASE_URL points to neon.tech
 * (Vercel / edge deployments). Falls back to standard PrismaClient for
 * local Docker or any plain PostgreSQL server.
 *
 * Development: Singleton pattern prevents exhausting database connections
 * during hot-reload cycles.
 */

import { PrismaClient, type Prisma } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import ws from "ws";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required for Prisma");
}

const isNeon = connectionString.includes("neon.tech");

// Singleton factory
function createPrismaClient() {
  const logLevels: Prisma.LogLevel[] =
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"];

  if (isNeon) {
    // Neon serverless driver — uses WebSocket transport
    if (process.env.NODE_ENV !== "production") {
      neonConfig.webSocketConstructor = ws;
    }
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter, log: logLevels });
  }

  // Standard PostgreSQL (local Docker, self-hosted)
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter, log: logLevels });
}

// Global singleton instance (development hot-reload safe)
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
