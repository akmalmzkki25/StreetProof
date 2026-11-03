import { expect, test } from "@playwright/test";

import { ACCOUNTS, signIn, submitReport, unique } from "./helpers";

test("the queue downloads as a spreadsheet of the tickets on screen", async ({
  browser,
}) => {
  const description = unique('=HYPERLINK("https://evil.example") leak');
  await submitReport(browser, description);
  const operator = await signIn(browser, ACCOUNTS.operator);
  await operator.goto(`/app/queue?q=${encodeURIComponent("HYPERLINK")}`);

  const [download] = await Promise.all([
    operator.waitForEvent("download"),
    operator.getByRole("link", { name: "Export CSV" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(
    /^streetproof-tickets-\d{4}-\d{2}-\d{2}\.csv$/,
  );
  const text = (await (await download.createReadStream()).toArray())
    .map(String)
    .join("");

  expect(text.charCodeAt(0)).toBe(0xfeff);
  const lines = text.slice(1).trim().split(/\r?\n/);
  expect(lines[0]).toContain("Ticket ID,Title,Status");
  // Only the filtered tickets, and report text can't run as a formula.
  expect(lines).toHaveLength(2);
  expect(lines[1]).toContain(`'${description}`.replaceAll('"', '""'));
  expect(lines[1]).toContain("New report");
});

test("a technician can't download the queue", async ({ browser }) => {
  const technician = await signIn(browser, ACCOUNTS.technician);
  const response = await technician.request.get("/api/tickets/export");
  expect(response.status()).toBe(404);
});
