import { expect, test, type Browser } from "@playwright/test";
import { DEMO_PASSWORD } from "@streetproof/db/demo";

import { ACCOUNTS, visibleText } from "./helpers";

async function signInWith(browser: Browser, email: string, password: string) {
  const page = await (await browser.newContext()).newPage();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  return page;
}

// Uses its own account, made by the admin, so changing the password can't
// break the shared demo accounts other tests sign in with.
test("a member changes their own name and password", async ({ browser }) => {
  const email = `account-${Date.now()}@streetproof.test`;
  const first = "first-password-1";
  const second = "second-password-2";

  const admin = await signInWith(browser, ACCOUNTS.admin, DEMO_PASSWORD);
  await admin.waitForURL(/\/app/);
  await admin.goto("/app/members");
  await admin.getByRole("button", { name: "Add member" }).click();
  const drawer = admin.getByRole("dialog");
  await drawer.getByLabel("Name").fill("Account Test");
  await drawer.getByLabel("Email").fill(email);
  await drawer.getByLabel("First password").fill(first);
  await drawer.getByRole("checkbox", { name: "Operator" }).first().check();
  await drawer.getByRole("button", { name: "Add member" }).click();
  await expect(visibleText(drawer, "Member added.")).toBeVisible();

  const member = await signInWith(browser, email, first);
  await member.waitForURL(/\/app/);
  const elsewhere = await signInWith(browser, email, first);
  await elsewhere.waitForURL(/\/app/);
  await member.goto("/app/account");

  await member.getByLabel("Name").fill("Account Renamed");
  await member.getByRole("button", { name: "Save" }).click();
  await expect(visibleText(member, "Name saved.")).toBeVisible();

  await member.getByLabel("Current password").fill("not-my-password");
  await member.getByLabel("New password", { exact: true }).fill(second);
  await member.getByLabel("New password again").fill(second);
  await member.getByRole("button", { name: "Change password" }).click();
  await expect(
    visibleText(member, "Your current password isn't right."),
  ).toBeVisible();

  await member.getByLabel("Current password").fill(first);
  await member.getByLabel("New password", { exact: true }).fill(second);
  await member.getByLabel("New password again").fill(second);
  await member.getByRole("button", { name: "Change password" }).click();
  await expect(
    visibleText(member, "Password changed. You're signed out everywhere else."),
  ).toBeVisible();

  await member.reload();
  await expect(member.getByLabel("Current password")).toBeVisible();
  await elsewhere.goto("/app/account");
  await expect(elsewhere).toHaveURL(/\/login$/);

  const old = await signInWith(browser, email, first);
  await expect(old.getByRole("alert")).toBeVisible();
  const fresh = await signInWith(browser, email, second);
  await fresh.waitForURL(/\/app/);
  await expect(visibleText(fresh, "Account Renamed")).toBeVisible();
});
