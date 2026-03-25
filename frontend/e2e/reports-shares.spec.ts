import { expect, test } from "@playwright/test";
import { signInAsOwner } from "./helpers/auth";

test.describe("Reports shared links", () => {
  test("creates, lists, copies, and deletes a named shared report", async ({ page }) => {
    const shares: Array<{
      id: string;
      name: string;
      token: string;
      reportType: string;
      from?: string | null;
      to?: string | null;
      expiresAt?: string | null;
      createdAt: string;
    }> = [];

    await signInAsOwner(page);

    await page.route("**/api/projects/*/tasks", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.route("**/api/projects", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.route("**/api/clients", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.route("**/api/reports/saved", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.route("**/api/reports/summary**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          groups: [],
          totalHours: 8,
          billableHours: 6,
          totalBilledAmount: 420,
          totalEntries: 2,
        }),
      });
    });

    await page.route("**/api/reports/detailed**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          entries: [
            {
              id: "entry-1",
              projectName: "Platform",
              projectColor: "#10b981",
              clientName: "Acme",
              taskName: "Build",
              description: "Roadmap review",
              entryDate: "2026-03-20",
              startTime: "09:00",
              endTime: "10:30",
              durationDecimal: 1.5,
              isBillable: true,
              billedAmount: 150,
              tagNames: [],
            },
          ],
          totalHours: 8,
          billableHours: 6,
          totalBilledAmount: 420,
          totalEntries: 2,
          page: 1,
          pageSize: 500,
        }),
      });
    });

    await page.route("**/api/reports/weekly**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          weeks: [
            {
              weekStart: "2026-03-16",
              weekEnd: "2026-03-22",
              dayTotals: [1, 2, 1, 0, 2, 0, 0],
              weekTotal: 6,
            },
          ],
          grandTotal: 6,
        }),
      });
    });

    await page.route("**/api/reports/shares", async (route) => {
      const request = route.request();

      if (request.method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(shares),
        });
        return;
      }

      if (request.method() === "POST") {
        const body = request.postDataJSON() as {
          name: string;
          reportType: string;
          from?: string | null;
          to?: string | null;
        };

        const share = {
          id: "share-1",
          name: body.name,
          token: "named-share-token",
          reportType: body.reportType,
          from: body.from ?? null,
          to: body.to ?? null,
          expiresAt: null,
          createdAt: "2026-03-23T12:00:00Z",
        };

        shares.splice(0, shares.length, share);

        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(share),
        });
        return;
      }

      await route.fallback();
    });

    await page.route("**/api/reports/shares/*", async (route) => {
      if (route.request().method() !== "DELETE") {
        await route.fallback();
        return;
      }

      const id = route.request().url().split("/").pop();
      const index = shares.findIndex((share) => share.id === id);
      if (index >= 0) {
        shares.splice(index, 1);
      }

      await route.fulfill({ status: 204, body: "" });
    });

    await page.goto("/reports");

    await page.getByRole("button", { name: /shared reports/i }).click();
    await expect(page.getByText(/no shared reports yet/i)).toBeVisible();

    await page.getByRole("button", { name: /share current/i }).click();
    await page.getByPlaceholder(/shared report name/i).fill("Q1 summary share");
    await page.getByRole("button", { name: /^save$/i }).click();

    await expect(page.getByText("Shared report created.", { exact: true })).toBeVisible();
    await expect(page.getByText(/named-share-token/i)).toBeVisible();

    await page.getByRole("button", { name: /shared reports/i }).click();
    await expect(page.getByText("Q1 summary share", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /copy link/i }).click();
    await expect(page.getByText("Share link copied.", { exact: true }).or(page.getByText("Share link ready.", { exact: true }))).toBeVisible();

    await page.getByTitle(/delete shared report/i).click();
    await expect(page.getByText("Shared report deleted.", { exact: true })).toBeVisible();
    await expect(page.getByText("Q1 summary share", { exact: true })).toHaveCount(0);
  });
});
