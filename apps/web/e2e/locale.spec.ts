import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";

test("the interface is English unless someone asks for Indonesian", async ({
  page,
}) => {
  await page.goto("/login");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("the switch turns the interface Indonesian and remembers it", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Bahasa Indonesia" }).click();
  await expect(page.getByRole("heading", { name: "Masuk" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "id");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Masuk" })).toBeVisible();

  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test.describe("with a browser set to Indonesian", () => {
  test.use({ locale: "id-ID" });

  test("the first visit is still English", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});

test("an action's error comes back in Indonesian", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Bahasa Indonesia" }).click();
  await expect(page.getByRole("heading", { name: "Masuk" })).toBeVisible();

  await page.getByLabel("Email").fill("nobody@example.test");
  await page.getByLabel("Kata sandi").fill("not-the-password");
  await page.getByRole("button", { name: "Masuk" }).click();

  await expect(
    page.getByText("Email dan kata sandi itu tidak cocok"),
  ).toBeVisible();
});

test("staff pages and status names follow the switch", async ({ browser }) => {
  const operator = await signIn(browser, "operator@streetproof.test");
  await operator.goto("/app/queue");

  await operator
    .getByRole("button", { name: "operator@streetproof.test" })
    .click();
  await operator.getByRole("menuitem", { name: "Language" }).click();
  await operator
    .getByRole("menuitemradio", { name: "Bahasa Indonesia" })
    .click();

  await expect(
    operator.getByRole("heading", { name: "Antrean operator" }),
  ).toBeVisible();
  await expect(operator.getByRole("link", { name: "Antrean" })).toBeVisible();
});
