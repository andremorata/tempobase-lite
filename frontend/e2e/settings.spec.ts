import { expect, test } from "@playwright/test";
import { signInAsMember, signInAsOwner } from "./helpers/auth";

test.describe("Settings page", () => {
  test("owner sees workspace, team, and destructive workspace controls", async ({ page }) => {
    await signInAsOwner(page);

    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
    await expect(page.getByText("Workspace settings", { exact: true })).toBeVisible();
    await expect(page.getByText("Team access", { exact: true })).toBeVisible();
    await expect(page.getByText("Data management", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /^delete workspace$/i })).toBeVisible();
  });

  test("member sees self-service settings without admin sections", async ({ page }) => {
    await signInAsMember(page);

    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
    await expect(page.getByText("Profile", { exact: true })).toBeVisible();
    await expect(page.getByText("Password", { exact: true })).toBeVisible();
    await expect(page.getByText("Data management", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /delete my account/i })).toBeVisible();
    await expect(page.getByText("Workspace settings", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Team access", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^delete workspace$/i })).toHaveCount(0);
  });

  test("member sees readable toast when account deletion fails", async ({ page }) => {
    await signInAsMember(page);

    await page.route("**/api/account/purge/me", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 400,
          message: "One or more errors occurred!",
          errors: {
            currentPassword: ["Current password is incorrect."],
          },
        }),
      });
    });

    await page.goto("/settings");

    await page.locator("#self-delete-confirmation").fill("DELETE MY ACCOUNT");
    await page.locator("#self-delete-password").fill("wrong-password");
    await page.getByRole("button", { name: /delete my account/i }).click();

    await expect(page.getByText("Could not delete your account.", { exact: true })).toBeVisible();
    await expect(page.getByText("Current password is incorrect.", { exact: true })).toBeVisible();
    await expect(page.getByText('{"statusCode":400', { exact: false })).toHaveCount(0);
  });
});
