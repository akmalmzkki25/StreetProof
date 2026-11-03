import { expect, test } from "@playwright/test";

import { ACCOUNTS, INTAKE_PATH, signIn, submitReport, unique } from "./helpers";

// A t.me address is outside the app, so tests read where it would go instead of
// leaving for Telegram.
test.skip(
  Boolean(process.env.E2E_BASE_URL),
  "Needs a bot username, which a deployment may not have.",
);

test("the report form offers Telegram with the site's code", async ({
  page,
}) => {
  await page.goto(INTAKE_PATH);
  await expect(
    page.getByRole("link", { name: "Report on Telegram instead" }),
  ).toHaveAttribute(
    "href",
    "https://t.me/streetproof_e2e_bot?start=s_graha-tower-a",
  );
});

test("a status page makes a one-time link to follow the report", async ({
  browser,
}) => {
  const page = await submitReport(browser, unique("Water near the lift"));
  await page.route("https://t.me/**", (route) =>
    route.fulfill({ status: 200, body: "telegram" }),
  );

  await page.getByRole("button", { name: "Get updates on Telegram" }).click();

  await page.waitForURL(/^https:\/\/t\.me\/streetproof_e2e_bot\?start=l_/);
});

test("a member can connect Telegram from the account menu", async ({
  browser,
}) => {
  const page = await signIn(browser, ACCOUNTS.technician);
  await page.route("https://t.me/**", (route) =>
    route.fulfill({ status: 200, body: "telegram" }),
  );
  await page.goto("/app/work");
  await page.getByRole("button", { name: /Budi Technician/ }).click();

  await page.getByRole("menuitem", { name: "Connect Telegram" }).click();

  await page.waitForURL(/^https:\/\/t\.me\/streetproof_e2e_bot\?start=l_/);
});
