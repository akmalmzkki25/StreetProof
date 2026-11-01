import { expect, test } from "@playwright/test";

import {
  ACCOUNTS,
  INTAKE_PATH,
  openFromQueue,
  signIn,
  submitReport,
  triageAndAssign,
  unique,
  visibleText,
} from "./helpers";

test("the app sends signed-out visitors to sign in", async ({ page }) => {
  for (const path of ["/", "/app", "/app/queue", "/app/dashboard"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});

test("everyone lands on the first page of their own menu", async ({
  browser,
}) => {
  const operator = await signIn(browser, ACCOUNTS.operator);
  await expect(operator).toHaveURL(/\/app\/dashboard$/);
  await operator.goto("/");
  await expect(operator).toHaveURL(/\/app\/dashboard$/);

  const technician = await signIn(browser, ACCOUNTS.technician);
  await expect(technician).toHaveURL(/\/app\/work$/);
});

test("the health check answers without saying anything else", async ({
  request,
}) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ ok: true });
});

test("pages send security headers and nothing they load breaks the policy", async ({
  browser,
  page,
}) => {
  const description = unique("Policy check near the lift");
  await submitReport(browser, description);
  const operator = await signIn(browser, ACCOUNTS.operator);

  const violations: string[] = [];
  for (const watched of [page, operator]) {
    watched.on("console", (message) => {
      if (message.text().includes("Content Security Policy")) {
        violations.push(message.text());
      }
    });
  }

  for (const path of ["/", "/login", INTAKE_PATH, "/status"]) {
    const response = await page.goto(path);
    const headers = response?.headers() ?? {};
    expect(headers["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-powered-by"]).toBeUndefined();
  }

  await openFromQueue(operator, description);
  const photo = operator.getByRole("img", { name: "Report photo 1" });
  await expect
    .poll(() => photo.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await operator.goto("/app/dashboard");
  await expect(
    operator.getByRole("heading", { name: "Open work by stage" }),
  ).toBeVisible();

  expect(violations).toEqual([]);
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

test("a stored photo loads in the browser from its signed address", async ({
  browser,
}) => {
  const description = unique("Photo loading check");
  await submitReport(browser, description);

  const operator = await signIn(browser, ACCOUNTS.operator);
  await openFromQueue(operator, description);
  const photo = operator.getByRole("img", { name: "Report photo 1" });
  await expect(photo).toBeVisible();
  await expect
    .poll(() => photo.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  // The bucket itself stays private: the same address without a signature fails.
  const signed = new URL(await photo.evaluate((i: HTMLImageElement) => i.src));
  const unsigned = await operator.request.get(signed.origin + signed.pathname);
  expect(unsigned.status()).toBe(403);
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
    operator.getByRole("heading", { name: "Open work by stage" }),
  ).toBeVisible();
  await expect(visibleText(operator, "Synthetic data")).toBeVisible();
  await expect(
    visibleText(operator, "Submitted with an exception"),
  ).toBeVisible();
});
