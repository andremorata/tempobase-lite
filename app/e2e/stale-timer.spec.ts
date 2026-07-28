import { test, expect, type Page } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createTestPrismaClient } from "./helpers/db";

const prisma = createTestPrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * Every test gets its own account. The tracker heartbeats `last_seen_at` on a timer whenever it is
 * open, so a shared account would let a parallel spec overwrite the value under test.
 */
async function registerAndSignIn(page: Page, testInfo: { parallelIndex: number; retry: number }) {
  const unique = `${Date.now()}-${testInfo.parallelIndex}-${testInfo.retry}`;
  const credentials = {
    email: `playwright-stale-timer-${unique}@example.com`,
    password: "Password123",
  };

  const response = await page.request.post("/api/auth/register", {
    data: {
      ...credentials,
      firstName: "Playwright",
      lastName: "Owner",
      accountName: `Stale Timer Workspace ${unique}`,
    },
  });
  expect(response.ok(), await response.text()).toBeTruthy();

  await signIn(page, credentials);
}

async function startTimer(page: Page): Promise<string> {
  await page.goto("/tracker");
  await page.getByPlaceholder(/what are you working on/i).fill("Overnight work");
  await page.getByTitle(/start timer/i).click();
  await expect(page.getByTitle(/stop timer/i)).toBeVisible({ timeout: 10_000 });

  const running = await (await page.request.get("/api/time-entries/running")).json();
  expect(running?.id).toBeTruthy();
  return running.id as string;
}

/**
 * Simulates the case this feature exists for: the PWA window was closed with a timer running and
 * reopened the next day. Only the DB can produce that state — the API refuses to fabricate it.
 */
async function backdateToYesterday(entryId: string, startHour: number, lastSeenHour: number) {
  const yesterdayAt = (hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const startTime = yesterdayAt(startHour);

  await prisma.timeEntry.update({
    where: { id: entryId },
    data: {
      startTime,
      entryDate: new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()),
      lastSeenAt: yesterdayAt(lastSeenHour),
    },
  });
}

test.describe("Stale timer recovery", () => {
  test("offers the last heartbeat as the stop time and closes the entry there", async ({
    page,
  }, testInfo) => {
    await registerAndSignIn(page, testInfo);
    const entryId = await startTimer(page);
    await backdateToYesterday(entryId, 14, 18);

    await page.goto("/tracker");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(dialog).toContainText(/still running from/i);
    await expect(dialog).toContainText(/last open at 18:00/i);

    await dialog.getByRole("button", { name: /^Stop at 18:00$/ }).click();

    await expect(dialog).toBeHidden({ timeout: 10_000 });
    await expect(page.getByTitle(/start timer/i)).toBeVisible();

    const stopped = await prisma.timeEntry.findUniqueOrThrow({ where: { id: entryId } });
    expect(stopped.isRunning).toBe(false);
    expect(stopped.endTime?.getHours()).toBe(18);
    // 14:00 → 18:00 the previous day
    expect(stopped.duration).toBe(4 * 60 * 60 * 1000);
  });

  test("keeps the timer running and does not prompt again after reload", async ({
    page,
  }, testInfo) => {
    await registerAndSignIn(page, testInfo);
    const entryId = await startTimer(page);
    await backdateToYesterday(entryId, 14, 18);

    await page.goto("/tracker");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await dialog.getByRole("button", { name: "Keep running" }).click();
    await expect(dialog).toBeHidden();

    await page.goto("/tracker");
    await expect(page.getByTitle(/stop timer/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("dialog")).toBeHidden();

    const stillRunning = await prisma.timeEntry.findUniqueOrThrow({ where: { id: entryId } });
    expect(stillRunning.isRunning).toBe(true);
  });

  test("discards the entry when asked", async ({ page }, testInfo) => {
    await registerAndSignIn(page, testInfo);
    const entryId = await startTimer(page);
    await backdateToYesterday(entryId, 14, 18);

    await page.goto("/tracker");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await dialog.getByRole("button", { name: "Discard entry" }).click();

    await expect(dialog).toBeHidden({ timeout: 10_000 });
    await expect(page.getByTitle(/start timer/i)).toBeVisible();

    const discarded = await prisma.timeEntry.findUniqueOrThrow({ where: { id: entryId } });
    expect(discarded.isDeleted).toBe(true);
  });

  test("does not prompt for a timer started today", async ({ page }, testInfo) => {
    await registerAndSignIn(page, testInfo);
    await startTimer(page);

    await page.goto("/tracker");

    await expect(page.getByTitle(/stop timer/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("records a heartbeat while the tracker is open", async ({ page }, testInfo) => {
    await registerAndSignIn(page, testInfo);
    const entryId = await startTimer(page);

    await page.goto("/tracker");
    await expect(page.getByTitle(/stop timer/i)).toBeVisible({ timeout: 10_000 });

    await expect
      .poll(
        async () => {
          const entry = await prisma.timeEntry.findUniqueOrThrow({ where: { id: entryId } });
          return entry.lastSeenAt !== null;
        },
        { timeout: 10_000 },
      )
      .toBe(true);
  });
});
