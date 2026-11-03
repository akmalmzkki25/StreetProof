import { expect, test } from "@playwright/test";

import { ACCOUNTS, choose, signIn, unique, visibleText } from "./helpers";

// Map tiles come from the internet, so these tests use the forms and leave the
// map alone.
test("an admin adds a building that takes reports straight away", async ({
  browser,
}) => {
  const admin = await signIn(browser, ACCOUNTS.admin);
  const name = unique("Menara Uji");
  const code = `menara-${Date.now().toString(36)}`;

  await admin.goto("/app/sites");
  await admin.getByRole("button", { name: "Add site" }).click();
  const drawer = admin.getByRole("dialog");
  await drawer.getByLabel("Building name").fill(name);
  await drawer.getByLabel("Report code").fill(code);
  await choose(admin, "Time zone", "WITA (Asia/Makassar)");
  await drawer.getByLabel("Locations").fill("Lobby, Atap");
  await drawer.getByRole("button", { name: "Add site" }).click();
  await expect(visibleText(drawer, "Site added.")).toBeVisible();

  const reporter = await browser.newPage();
  await reporter.goto(`/report/${code}`);
  await expect(visibleText(reporter, name)).toBeVisible();
  await reporter
    .getByRole("combobox", { name: "Where is the damage?" })
    .click();
  await expect(reporter.getByRole("option", { name: "Atap" })).toBeVisible();
});

test("a retired location leaves the report form", async ({ browser }) => {
  const admin = await signIn(browser, ACCOUNTS.admin);
  const code = `gedung-${Date.now().toString(36)}`;
  await admin.goto("/app/sites");
  await admin.getByRole("button", { name: "Add site" }).click();
  const drawer = admin.getByRole("dialog");
  await drawer.getByLabel("Building name").fill(unique("Gedung Uji"));
  await drawer.getByLabel("Report code").fill(code);
  await drawer.getByLabel("Locations").fill("Gudang, Dapur");
  await drawer.getByRole("button", { name: "Add site" }).click();
  await expect(visibleText(drawer, "Site added.")).toBeVisible();
  await admin.keyboard.press("Escape");

  const card = admin.getByRole("listitem").filter({ hasText: code });
  await card.getByRole("button", { name: "Manage" }).click();
  const gudang = admin
    .getByRole("dialog")
    .getByRole("listitem")
    .filter({ has: admin.locator('input[value="Gudang"]') });
  await gudang.getByRole("button", { name: "Retire" }).click();
  await expect(
    gudang.getByRole("button", { name: "Bring back" }),
  ).toBeVisible();

  const reporter = await browser.newPage();
  await reporter.goto(`/report/${code}`);
  await reporter
    .getByRole("combobox", { name: "Where is the damage?" })
    .click();
  await expect(reporter.getByRole("option", { name: "Dapur" })).toBeVisible();
  await expect(reporter.getByRole("option", { name: "Gudang" })).toBeHidden();
});

test("the QR poster points at the building's report link", async ({
  browser,
}) => {
  const admin = await signIn(browser, ACCOUNTS.admin);
  await admin.goto("/app/sites");
  await admin
    .getByRole("listitem")
    .filter({ hasText: "/report/graha-tower-a" })
    .getByRole("link", { name: "QR poster" })
    .click();

  await expect(
    admin.getByRole("heading", { name: "Laporkan kerusakan" }),
  ).toBeVisible();
  await expect(
    admin.getByRole("img", { name: "QR code for this building's report form" }),
  ).toBeVisible();
  await expect(visibleText(admin, "/report/graha-tower-a")).toBeVisible();
  await expect(admin.getByRole("button", { name: "Print" })).toBeVisible();
});

test("only an admin sees sites", async ({ browser }) => {
  const operator = await signIn(browser, ACCOUNTS.operator);
  await operator.goto("/app/sites");
  await expect(
    visibleText(operator, "This page could not be found"),
  ).toBeVisible();
  await expect(operator.getByRole("button", { name: "Add site" })).toBeHidden();
});
