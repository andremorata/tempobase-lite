/**
 * Playwright Global Setup
 *
 * Seeds the database with demo users before any E2E tests run.
 * Ensures owner@demo.local and member@demo.local exist.
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile(filePath: string): Record<string, string> {
  try {
    const content = readFileSync(filePath, "utf-8");
    const vars: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      vars[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
    }
    return vars;
  } catch {
    return {};
  }
}

export default async function globalSetup() {
  const cwd = process.cwd();
  const envVars = loadEnvFile(resolve(cwd, ".env.local"));

  console.log("[global-setup] Seeding demo data for E2E tests...");
  execSync("npx tsx prisma/seed.ts", {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...envVars },
  });
  console.log("[global-setup] Seeding complete.");
}
