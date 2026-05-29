import { expect, type Page } from "@playwright/test";

type Credentials = {
  email: string;
  password: string;
};

const OWNER_CREDENTIALS: Credentials = {
  email: "owner@demo.local",
  password: "Demo1234!",
};

const MEMBER_CREDENTIALS: Credentials = {
  email: "member@demo.local",
  password: "Demo1234!",
};

export async function signIn(page: Page, credentials: Credentials) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

export async function signInAsOwner(page: Page) {
  await signIn(page, OWNER_CREDENTIALS);
}

export async function signInAsMember(page: Page) {
  await signIn(page, MEMBER_CREDENTIALS);
}
