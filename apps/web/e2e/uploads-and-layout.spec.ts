import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";

import {
  ACCOUNTS,
  choose,
  expectNoSidewaysScroll,
  INTAKE_PATH,
  PHOTOS,
  signIn,
  submitReport,
  unique,
  visibleText,
} from "./helpers";

async function tryUpload(
  page: Page,
  file: { name: string; mimeType: string; buffer: Buffer },
) {
  await page.getByLabel("What did you see?").fill(unique("Upload check"));
  await page.getByLabel("Photos").setInputFiles(file);
  await page.getByRole("button", { name: "Submit report" }).click();
}

test("hostile uploads are refused and leave the form usable", async ({
  page,
}) => {
  await page.goto(INTAKE_PATH);
  await choose(page, "Where is the damage?", "Lobby");

  await tryUpload(page, {
    name: "damage.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("<script>alert(1)</script>"),
  });
  await expect(
    visibleText(page, "Photos must be JPEG, PNG or WebP"),
  ).toBeVisible();

  await tryUpload(page, {
    name: "damage.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      Buffer.from("#!/bin/sh\n"),
    ]),
  });
  await expect(visibleText(page, "can't be read")).toBeVisible();

  const bomb = await sharp({
    create: {
      width: 8100,
      height: 8100,
      channels: 3,
      background: { r: 10, g: 10, b: 10 },
    },
  })
    .png()
    .toBuffer();
  await tryUpload(page, {
    name: "bomb.png",
    mimeType: "image/png",
    buffer: bomb,
  });
  await expect(visibleText(page, "too large to process")).toBeVisible();

  await page.getByLabel("Photos").setInputFiles(PHOTOS.leak);
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(visibleText(page, "View status", { exact: true })).toBeVisible();
});

const PHONE = { viewport: { width: 375, height: 812 }, hasTouch: true };

test.describe("on a phone", () => {
  test.use(PHONE);

  test("the report form and status page fit the screen", async ({ page }) => {
    await page.goto(INTAKE_PATH);
    await expect(
      page.getByRole("heading", { name: "Report damage" }),
    ).toBeVisible();
    await expectNoSidewaysScroll(page);

    const location = page.getByRole("combobox", {
      name: "Where is the damage?",
    });
    expect((await location.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    const submit = page.getByRole("button", { name: "Submit report" });
    expect((await submit.boundingBox())?.height).toBeGreaterThanOrEqual(44);

    await page.goto("/status");
    await expectNoSidewaysScroll(page);
  });

  test("the signed-in pages fit, and the sidebar becomes a menu sheet", async ({
    browser,
  }) => {
    const description = unique("Phone layout check");
    await submitReport(browser, description);

    const context = await browser.newContext(PHONE);
    const page = await context.newPage();
    await page.goto("/login");
    await page.getByLabel("Email").fill(ACCOUNTS.operator);
    await page.getByLabel("Password").fill("streetproof-demo");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/app/*");
    await expectNoSidewaysScroll(page);

    await page.getByRole("button", { name: "Open the menu" }).click();
    await page.getByRole("link", { name: "Queue" }).click();
    await page.waitForURL("**/app/queue");
    await expect(page.getByRole("link", { name: description })).toBeVisible();
    await expectNoSidewaysScroll(page);

    await page.goto("/app/dashboard");
    await expect(
      page.getByRole("heading", { name: "Open work by stage" }),
    ).toBeVisible();
    await expectNoSidewaysScroll(page);

    await page.getByRole("button", { name: "Open the menu" }).click();
    await page.getByRole("button", { name: ACCOUNTS.operator }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await page.waitForURL("**/login");
  });

  test("the sites page, its add drawer and the account page fit", async ({
    browser,
  }) => {
    const page = await signIn(browser, ACCOUNTS.admin, PHONE);

    await page.goto("/app/sites");
    const addSite = page.getByRole("button", { name: "Add site" });
    await expect(addSite).toBeVisible();
    await expectNoSidewaysScroll(page);

    await addSite.click();
    const drawer = page.getByRole("dialog");
    await expect(drawer.getByLabel("Building name")).toBeVisible();
    // A long form must scroll inside the drawer so its button stays reachable.
    const save = drawer.getByRole("button", { name: "Add site" });
    await save.scrollIntoViewIfNeeded();
    await expect(save).toBeInViewport();
    await expectNoSidewaysScroll(page);
    await page.keyboard.press("Escape");

    await page.goto("/app/account");
    await expect(page.getByLabel("Name")).toBeVisible();
    await expectNoSidewaysScroll(page);
  });
});

test("a keyboard user can skip the sidebar and sign out", async ({
  browser,
}) => {
  const page = await signIn(browser, ACCOUNTS.operator);
  await page.goto("/app/queue");
  await expect(
    page.getByRole("heading", { name: "Operator queue" }),
  ).toBeVisible();

  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();

  await page.getByRole("button", { name: ACCOUNTS.operator }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.waitForURL("**/login");
});
