import { defineConfig, devices } from "@playwright/test";

const e2ePort = Number(process.env.E2E_PORT ?? 3100);
const e2eHost = process.env.E2E_HOST ?? "127.0.0.1";
const e2eBaseUrl = process.env.E2E_BASE_URL ?? `http://${e2eHost}:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: e2eBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: `pnpm run dev --hostname ${e2eHost} --port ${e2ePort}`,
        env: {
          ...process.env,
          NEXTAUTH_URL: e2eBaseUrl,
          NEXTAUTH_URL_INTERNAL: e2eBaseUrl,
        },
        url: e2eBaseUrl,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
