import { test, expect } from "@playwright/test";
import { signInAsOwner } from "./helpers/auth";

test.describe("Tracker page (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await signInAsOwner(page);
  });

  test("tracker page renders timer bar", async ({ page }) => {
    await page.goto("/tracker");
    await expect(
      page.getByPlaceholder(/what are you working on/i),
    ).toBeVisible();
    await expect(page.getByTitle(/start timer/i)).toBeVisible();
  });

  test("tracker page shows the current week entry section", async ({ page }) => {
    await page.goto("/tracker");
    await expect(
      page.getByText(/this week/i).or(page.getByText(/no time entries yet/i)),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("dashboard page renders KPI cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    // KPI card titles
    await expect(page.getByText(/hours this week/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/hours today/i)).toBeVisible();
    await expect(page.getByText(/active projects/i)).toBeVisible();
    await expect(page.getByText(/billable/i)).toBeVisible();
  });

  test("dashboard page has start timer button", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: /start timer/i })).toBeVisible({ timeout: 10_000 });
  });

  test("dashboard page shows hours per day chart section", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/hours.*last 7 days/i)).toBeVisible({ timeout: 10_000 });
  });

  test("dashboard page shows recent entries section", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/recent entries/i)).toBeVisible({ timeout: 10_000 });
  });

  test("projects page renders", async ({ page }) => {
    await page.goto("/projects");
    await expect(
      page.getByRole("heading", { name: /projects/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /add project/i }),
    ).toBeVisible();
  });

  test("clients page renders", async ({ page }) => {
    await page.goto("/clients");
    await expect(
      page.getByRole("heading", { name: /clients/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /add client/i }),
    ).toBeVisible();
  });

  test("tags page renders", async ({ page }) => {
    await page.goto("/tags");
    await expect(
      page.getByRole("heading", { name: /tags/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /add tag/i }),
    ).toBeVisible();
  });

  test("timesheet page renders with week navigation", async ({ page }) => {
    await page.goto("/timesheet");
    await expect(
      page.getByRole("heading", { name: /timesheet/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /this week/i }),
    ).toBeVisible();
  });

  test("reports page renders with tabs", async ({ page }) => {
    await page.goto("/reports");
    await expect(
      page.getByRole("heading", { name: /reports/i }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: /summary/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /detailed/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /weekly/i })).toBeVisible();
  });

  test("reports page has date preset filters", async ({ page }) => {
    await page.goto("/reports");
    // Open the date range picker dropdown first
    await page.getByRole("button", { name: /this month/i }).first().click();
    await expect(page.getByRole("button", { name: /this week/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /last week/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /this month/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /last month/i })).toBeVisible();
  });

  test("reports sidebar link navigates to reports page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /reports/i }).click();
    await expect(page).toHaveURL(/\/reports/);
    await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();
  });

  test("reports page switches between tabs", async ({ page }) => {
    await page.goto("/reports");
    await page.getByRole("tab", { name: /detailed/i }).click();
    await expect(page.getByRole("tab", { name: /detailed/i })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: /weekly/i }).click();
    await expect(page.getByRole("tab", { name: /weekly/i })).toHaveAttribute("aria-selected", "true");
  });

  test("audit page renders filters and activity shell", async ({ page }) => {
    await page.goto("/audit");
    await expect(page.getByRole("heading", { name: /audit/i })).toBeVisible();
    await expect(page.getByText(/review create, update, and delete activity/i)).toBeVisible();
    await expect(page.getByLabel(/search/i)).toBeVisible();
  });

  test("audit sidebar link navigates to audit page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /audit/i }).click();
    await expect(page).toHaveURL(/\/audit/);
    await expect(page.getByRole("heading", { name: /audit/i })).toBeVisible();
  });

  // ─── Imports page ─────────────────────────────────────────────────────────

  test("imports page renders upload zone", async ({ page }) => {
    await page.goto("/imports");
    await expect(page.getByRole("heading", { name: /import/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /upload csv file/i })).toBeVisible();
  });

  test("imports page shows csv format hint", async ({ page }) => {
    await page.goto("/imports");
    await expect(page.getByRole("heading", { name: /import/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/detailed time-report csv format supported/i).first()).toBeVisible();
  });

  test("imports sidebar link navigates to imports page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /import/i }).click();
    await expect(page).toHaveURL(/\/imports/);
    await expect(page.getByRole("heading", { name: /import/i })).toBeVisible();
  });

  test("imports page has file input for csv", async ({ page }) => {
    await page.goto("/imports");
    const fileInput = page.locator('input[type="file"][accept*="csv"]');
    await expect(fileInput).toBeAttached();
  });

  // ─── Billing & Rates ──────────────────────────────────────────────────────

  test("reports summary tab is default active tab", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.getByRole("tab", { name: /summary/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /summary/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("reports detailed tab can be selected", async ({ page }) => {
    await page.goto("/reports");
    await page.getByRole("tab", { name: /detailed/i }).click();
    await expect(page.getByRole("tab", { name: /detailed/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("projects page billing type shown in create form", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: /projects/i })).toBeVisible();
    await page.getByRole("button", { name: /add project/i }).click();
    await expect(page.getByText(/billing type/i)).toBeVisible();
  });

  test("projects page rate input shown in create form for hourly projects", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("button", { name: /add project/i }).click();
    // Default billing type is Hourly — Rate label should appear
    await expect(page.getByText(/rate.*\$/i)).toBeVisible();
  });
});
