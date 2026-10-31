import { DEMO_PASSWORD } from "@streetproof/db/demo";
import { createDb, schema } from "@streetproof/db";
import { expect, test } from "@playwright/test";
import { desc, like } from "drizzle-orm";

import { signIn, unique, visibleText } from "./helpers";

test.skip(
  Boolean(process.env.E2E_BASE_URL),
  "Needs direct access to the test database",
);

const ADMIN = "admin@streetproof.test";
const { db, pool } = createDb(process.env.E2E_DATABASE_URL ?? "");

test.afterAll(async () => {
  await pool.end();
});

test("an admin adds a member, who signs in with the role they were given", async ({
  browser,
}) => {
  const admin = await signIn(browser, ADMIN);
  await admin.goto("/app/members");

  const name = unique("New Technician");
  const email = `${crypto.randomUUID()}@example.test`;
  await admin.getByLabel("Name").fill(name);
  await admin.getByLabel("Email").fill(email);
  await admin.getByLabel("First password").fill("first-password-1");
  await admin.getByRole("checkbox", { name: "Technician" }).first().check();
  await admin.getByRole("button", { name: "Add member" }).click();
  await expect(visibleText(admin, "Member added.")).toBeVisible();
  await expect(visibleText(admin, name)).toBeVisible();

  const context = await browser.newContext();
  const newcomer = await context.newPage();
  await newcomer.goto("/login");
  await newcomer.getByLabel("Email").fill(email);
  await newcomer.getByLabel("Password").fill("first-password-1");
  await newcomer.getByRole("button", { name: "Sign in" }).click();
  await newcomer.waitForURL("**/app");
  await newcomer.goto("/app/work");
  await expect(newcomer.getByRole("heading", { level: 1 })).toBeVisible();
  await newcomer.goto("/app/members");
  await expect(
    visibleText(newcomer, "This page could not be found"),
  ).toBeVisible();

  // Deactivating ends their session straight away.
  await admin.reload();
  await visibleText(admin, name).click();
  await admin
    .locator("details", { hasText: name })
    .getByRole("button", { name: "Deactivate" })
    .click();
  await expect(
    admin.locator("details", { hasText: name }).getByText("Deactivated"),
  ).toBeVisible();
  await newcomer.goto("/app/work");
  await expect(newcomer).toHaveURL(/\/login$/);

  await admin.goto("/app/audit");
  await expect(visibleText(admin, "Added a member").first()).toBeVisible();
  await expect(
    visibleText(admin, "Deactivated a member").first(),
  ).toBeVisible();
});

test("only a tenant admin reaches members and the audit log", async ({
  browser,
}) => {
  const supervisor = await signIn(browser, "supervisor@streetproof.test");
  for (const path of ["/app/members", "/app/audit"]) {
    await supervisor.goto(path);
    await expect(
      visibleText(supervisor, "This page could not be found"),
    ).toBeVisible();
  }
});

test("a password can be reset from the emailed link, and only once", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await expect(visibleText(page, "Email isn't set up")).toBeVisible();
  await page.getByLabel("Email").fill("technician2@streetproof.test");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(
    visibleText(page, "If that address has an account"),
  ).toBeVisible();

  // No mail server here, so read the token Better Auth stored for the link.
  const [row] = await db
    .select({ identifier: schema.verification.identifier })
    .from(schema.verification)
    .where(like(schema.verification.identifier, "reset-password:%"))
    .orderBy(desc(schema.verification.createdAt))
    .limit(1);
  const token = row?.identifier.replace("reset-password:", "");
  if (!token) throw new Error("No reset token was stored.");

  await page.goto(`/reset-password?token=${token}`);
  await page.getByLabel("New password").fill("short");
  await page.getByLabel("New password").fill("a-new-password-1");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(visibleText(page, "Your password is changed")).toBeVisible();

  await page.goto(`/reset-password?token=${token}`);
  await page.getByLabel("New password").fill("another-password-1");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(
    visibleText(page, "has expired or was already used"),
  ).toBeVisible();

  await page.goto("/login");
  await page.getByLabel("Email").fill("technician2@streetproof.test");
  await page.getByLabel("Password").fill("a-new-password-1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/app");

  // Later tests sign in with the shared demo password.
  const admin = await signIn(browser, ADMIN);
  await admin.goto("/app/members");
  const row2 = admin.locator("details", { hasText: "Rina Technician" });
  await visibleText(admin, "Rina Technician").click();
  await row2.getByLabel("New password").fill(DEMO_PASSWORD);
  await row2.getByRole("button", { name: "Set password" }).click();
  await expect(
    row2.getByText("Password set. They were signed out everywhere."),
  ).toBeVisible();
});

test("staff can give a reporter a new status link, which replaces the old one", async ({
  browser,
}) => {
  const description = unique("Status link check");
  const { submitReport } = await import("./helpers");
  const reporter = await submitReport(browser, description);

  const operator = await signIn(browser, "operator@streetproof.test");
  await operator.goto("/app/queue");
  await operator.getByRole("link", { name: description }).click();
  await operator.waitForURL("**/app/tickets/*");
  await operator
    .getByRole("button", { name: "Create a new status link" })
    .click();
  const link = operator.getByLabel("New status link");
  await expect(link).toBeVisible();
  const url = await link.inputValue();

  await reporter.reload();
  await expect(
    visibleText(reporter, "This status link isn't available"),
  ).toBeVisible();
  await expect(
    reporter.getByRole("link", { name: "Get a new status link" }),
  ).toBeVisible();

  await reporter.goto(url);
  await expect(visibleText(reporter, description)).toBeVisible();
});

test("monitoring needs its token and reports only health", async ({
  request,
}) => {
  const anonymous = await request.get("/api/monitoring");
  expect(anonymous.status()).toBe(401);

  // The worker doesn't run here, so this is the unhealthy answer on purpose.
  const response = await request.get("/api/monitoring", {
    headers: { authorization: "Bearer e2e-monitoring-token" },
  });
  expect(response.status()).toBe(503);
  const body = await response.json();
  expect(body).toMatchObject({
    ok: false,
    database: true,
    storage: true,
    worker: false,
  });
  expect(JSON.stringify(body)).not.toContain("@");
});
