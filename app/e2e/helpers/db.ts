import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Playwright workers do not inherit env from global-setup, so read the datasource URL the same
 * way global-setup does. Used by tests that need to fabricate DB state the API cannot produce.
 */
function readDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("DATABASE_URL=")) continue;
    return trimmed.slice("DATABASE_URL=".length).replace(/^["']|["']$/g, "");
  }

  throw new Error("DATABASE_URL not found in environment or .env.local");
}

/** E2E always runs against the local Postgres, so the plain pg adapter is enough. */
export function createTestPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: readDatabaseUrl() });
  return new PrismaClient({ adapter });
}
