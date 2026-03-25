import { test, expect, type APIRequestContext, type Page, type TestInfo } from "@playwright/test";

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

async function createUserViaApi(request: APIRequestContext, testInfo: TestInfo) {
  const uniqueId = `${Date.now()}-${testInfo.parallelIndex}-${testInfo.retry}`;
  const email = `playwright-login-${uniqueId}@example.com`;
  const password = "Password123";
  const firstName = "Playwright";
  const lastName = "Owner";

  const response = await request.post("/api/auth/register", {
    data: {
      email,
      password,
      firstName,
      lastName,
      accountName: `Playwright Workspace ${uniqueId}`,
    },
  });

  expect(response.ok(), await response.text()).toBeTruthy();

  return {
    email,
    password,
    fullName: `${firstName} ${lastName}`,
  };
}

test.describe("Authentication", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('[data-slot="card-title"]')).toHaveText("Sign in");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("register page renders correctly", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByText("Create your workspace", { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/work email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/workspace name/i)).toBeVisible();
  });

  test("login page shows validation errors for empty submit", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/enter a valid email/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test("register page shows validation errors for empty submit", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: /create workspace/i }).click();
    await expect(page.getByText(/first name is required/i)).toBeVisible();
    await expect(page.getByText(/last name is required/i)).toBeVisible();
  });

  test("navigate from login to register", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /create one/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("navigate from register to login", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("registered user can sign in and reach the dashboard", async ({ page, request }, testInfo) => {
    const user = await createUserViaApi(request, testInfo);

    await signIn(page, user.email, user.password);

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(user.fullName)).toBeVisible();
  });

  test("invalid credentials show a friendly server error", async ({ page }) => {
    await signIn(page, "owner@demo.local", "wrong-password");

    await expect(page.getByText("Invalid email or password.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("new user can register and is signed into the workspace", async ({ page }, testInfo) => {
    const uniqueId = `${Date.now()}-${testInfo.parallelIndex}`;
    const email = `playwright-${uniqueId}@example.com`;
    const workspaceName = `Playwright Workspace ${uniqueId}`;

    await page.goto("/register");
    await page.getByLabel(/first name/i).fill("Playwright");
    await page.getByLabel(/last name/i).fill("Owner");
    await page.getByLabel(/work email/i).fill(email);
    await page.getByLabel(/^password$/i).fill("Password123");
    await page.getByLabel(/workspace name/i).fill(workspaceName);
    await page.getByRole("button", { name: /create workspace/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Playwright Owner")).toBeVisible();
  });

  test("authenticated user can sign out and is returned to login", async ({ page, request }, testInfo) => {
    const user = await createUserViaApi(request, testInfo);

    await signIn(page, user.email, user.password);
    await expect(page).toHaveURL(/\/dashboard/);

    await page.locator('button[title="Sign out"]').click();

    await expect(page).toHaveURL(/\/login/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
