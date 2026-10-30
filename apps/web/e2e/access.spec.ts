import { expect, test } from "@playwright/test";

import {
  ACCOUNTS,
  openFromQueue,
  signIn,
  submitReport,
  triageAndAssign,
  unique,
  visibleText,
} from "./helpers";

test("the app sends signed-out visitors to sign in", async ({ page }) => {
  for (const path of ["/app", "/app/queue", "/app/dashboard"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});

test("a bad password shows a message and no session", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ACCOUNTS.operator);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("demo sign-in shortcuts don't exist in a production build", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(visibleText(page, "Demo accounts")).toBeHidden();
});

test("an invalid status link reveals nothing", async ({ page }) => {
  await page.goto("/status#t=not-a-real-token");
  await expect(
    visibleText(page, "This status link isn't available"),
  ).toBeVisible();
  // The token leaves the address bar even when it's wrong.
  await expect(page).toHaveURL(/\/status$/);
});

test("each role only reaches its own work", async ({ browser }) => {
  const description = unique("Pantry tap is loose");
  const summary = unique("Loose pantry tap");
  await submitReport(browser, description);

  const operator = await signIn(browser, ACCOUNTS.operator);
  const ticketUrl = await triageAndAssign(operator, description, summary);

  const assigned = await signIn(browser, ACCOUNTS.technician);
  await assigned.goto(ticketUrl);
  await expect(assigned.getByRole("heading", { name: summary })).toBeVisible();
  for (const path of ["/app/queue", "/app/reviews", "/app/dashboard"]) {
    await assigned.goto(path);
    await expect(
      visibleText(assigned, "This page could not be found"),
    ).toBeVisible();
  }
  await expect(assigned.getByRole("link", { name: "Overview" })).toBeHidden();

  const otherTechnician = await signIn(browser, ACCOUNTS.otherTechnician);
  await otherTechnician.goto(ticketUrl);
  await expect(
    visibleText(otherTechnician, "This page could not be found"),
  ).toBeVisible();

  const supervisor = await signIn(browser, ACCOUNTS.supervisor);
  await supervisor.goto("/app/queue");
  await expect(
    visibleText(supervisor, "This page could not be found"),
  ).toBeVisible();
});

test("another tenant can't see this tenant's tickets", async ({ browser }) => {
  const description = unique("Reception light flickers");
  await submitReport(browser, description);

  const operator = await signIn(browser, ACCOUNTS.operator);
  await openFromQueue(operator, description);
  const ticketUrl = operator.url();

  const outsider = await signIn(browser, ACCOUNTS.otherTenantOperator);
  await outsider.goto("/app/queue");
  await expect(outsider.getByRole("link", { name: description })).toBeHidden();
  await outsider.goto(ticketUrl);
  await expect(
    visibleText(outsider, "This page could not be found"),
  ).toBeVisible();
});

test("the overview labels synthetic figures and counts the new report", async ({
  browser,
}) => {
  const description = unique("Lobby door sticks");
  await submitReport(browser, description);

  const operator = await signIn(browser, ACCOUNTS.operator);
  await operator.goto("/app/dashboard");
  await expect(
    operator.getByRole("heading", { name: "Where open work sits" }),
  ).toBeVisible();
  await expect(visibleText(operator, "Synthetic data")).toBeVisible();
  await expect(visibleText(operator, "With an exception")).toBeVisible();
});
