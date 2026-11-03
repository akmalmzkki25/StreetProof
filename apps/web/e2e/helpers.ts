import { DEMO_PASSWORD } from "@streetproof/db/demo";
import {
  expect,
  type Browser,
  type BrowserContextOptions,
  type Locator,
  type Page,
} from "@playwright/test";
import path from "node:path";

export const INTAKE_PATH = "/report/graha-tower-a";

export const PHOTOS = {
  leak: path.resolve(
    __dirname,
    "../../../packages/db/fixtures/demo-photos/pipe_leak.jpg",
  ),
  repaired: path.resolve(
    __dirname,
    "../../../packages/db/fixtures/demo-photos/repaired_pipe.jpg",
  ),
  wrongObject: path.resolve(
    __dirname,
    "../../../packages/db/fixtures/demo-photos/wrong_object.jpg",
  ),
};

export const ACCOUNTS = {
  operator: "operator@streetproof.test",
  technician: "technician@streetproof.test",
  otherTechnician: "technician2@streetproof.test",
  supervisor: "supervisor@streetproof.test",
  admin: "admin@streetproof.test",
  otherTenantOperator: "operator@kampus.streetproof.test",
} as const;

export function unique(text: string) {
  return `${text} ${crypto.randomUUID().slice(0, 8)}`;
}

// Each person gets their own browser context, like their own phone or laptop.
export async function signIn(
  browser: Browser,
  email: string,
  options?: BrowserContextOptions,
) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => /^\/(en|id)\/app\//.test(url.pathname));
  return page;
}

// While a page streams, React briefly holds a hidden copy of its content, and a
// plain text lookup would match both. Role lookups already skip hidden elements.
export function visibleText(
  scope: Page | Locator,
  text: string,
  options?: { exact?: boolean },
) {
  return scope.getByText(text, options).filter({ visible: true });
}

export async function choose(page: Page, label: string, option: string) {
  await page.getByRole("combobox", { name: label }).click();
  await page.getByRole("option", { name: option }).click();
}

// Returns a page signed in as nobody, already holding the reporter's receipt.
export async function submitReport(browser: Browser, description: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(INTAKE_PATH);
  await choose(page, "Where is the damage?", "Floor 3 pantry");
  await page.getByLabel("What did you see?").fill(description);
  await page.getByLabel("Photos").setInputFiles(PHOTOS.leak);
  await page.getByRole("button", { name: "Submit report" }).click();
  await visibleText(page, "View status", { exact: true }).click();
  await page.waitForURL("**/status");
  await expect(visibleText(page, description)).toBeVisible();
  return page;
}

export async function openFromQueue(page: Page, title: string) {
  await page.goto("/app/queue");
  await page.getByRole("link", { name: title }).click();
  await page.waitForURL("**/app/tickets/*");
}

export async function triageAndAssign(
  operator: Page,
  description: string,
  summary: string,
  technician = "Budi Technician",
) {
  await openFromQueue(operator, description);
  await operator.getByLabel("Summary").fill(summary);
  await choose(operator, "Category", "Plumbing");
  await operator.getByRole("button", { name: "Confirm triage" }).click();
  await expect(
    operator.getByRole("heading", { name: "Assign the work" }),
  ).toBeVisible();
  await choose(operator, "Technician", technician);
  await operator.getByRole("button", { name: "Assign technician" }).click();
  await expect(
    operator.getByRole("heading", { name: "Assign the work" }),
  ).toBeHidden();
  return operator.url();
}

export async function startWork(technician: Page, ticketUrl: string) {
  await technician.goto(ticketUrl);
  await technician.getByRole("button", { name: "Accept work" }).click();
  await technician.getByRole("button", { name: "Start work" }).click();
  await expect(
    technician.getByRole("heading", { name: "Submit completion" }),
  ).toBeVisible();
}

export async function submitProof(
  technician: Page,
  note: string,
  photo: string,
) {
  await technician.getByLabel("What did you do?").fill(note);
  for (const check of [
    "The leak has stopped with the water running",
    "The area is dry and clean",
    "I found no new damage nearby",
  ]) {
    await technician.getByRole("checkbox", { name: check }).check();
  }
  await technician.getByLabel("Proof photos").setInputFiles(photo);
  await technician.getByRole("button", { name: "Submit completion" }).click();
}

export async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
}
