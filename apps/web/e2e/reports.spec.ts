import { expect, test } from "@playwright/test";

import {
  ACCOUNTS,
  openFromQueue,
  signIn,
  submitReport,
  unique,
  visibleText,
} from "./helpers";

test("an operator asks, the reporter answers, and it returns to triage", async ({
  browser,
}) => {
  const description = unique("Something is broken near the lift");
  const reporter = await submitReport(browser, description);
  const operator = await signIn(browser, ACCOUNTS.operator);

  await openFromQueue(operator, description);
  await operator
    .getByLabel("Question for the reporter")
    .fill("Which floor is this on?");
  await operator.getByRole("button", { name: "Ask the reporter" }).click();
  await expect(
    operator.getByRole("heading", { name: "Waiting for the reporter" }),
  ).toBeVisible();

  await reporter.reload();
  await expect(visibleText(reporter, "Which floor is this on?")).toBeVisible();
  await reporter.getByLabel("Your answer").fill("Floor 3, by the pantry.");
  await reporter.getByRole("button", { name: "Send answer" }).click();
  await expect(reporter.getByLabel("Your answer")).toBeHidden();
  await expect(visibleText(reporter, "Floor 3, by the pantry.")).toBeVisible();

  await operator.goto("/app/queue");
  const row = operator.getByRole("row", { name: description });
  await expect(visibleText(row, "Reporter answered")).toBeVisible();

  await row.getByRole("link", { name: description }).click();
  await operator.waitForURL("**/app/tickets/*");
  await expect(visibleText(operator, "Floor 3, by the pantry.")).toBeVisible();
  await operator.getByRole("button", { name: "Back to triage" }).click();
  await expect(
    operator.getByRole("heading", { name: "Confirm triage" }),
  ).toBeVisible();
  // The reporter's own words are untouched.
  await expect(
    operator.getByRole("heading", { name: description }),
  ).toBeVisible();
});

test("a linked duplicate leaves the queue and can be restored", async ({
  browser,
}) => {
  const target = unique("Pantry sink is leaking");
  const duplicate = unique("Water under the pantry sink");
  await submitReport(browser, target);
  const duplicateReporter = await submitReport(browser, duplicate);

  const operator = await signIn(browser, ACCOUNTS.operator);
  await openFromQueue(operator, duplicate);
  const duplicateUrl = operator.url();
  await operator
    .getByRole("combobox", { name: "Ticket for the same problem" })
    .click();
  await operator.getByRole("option", { name: target }).click();
  await operator.getByLabel("Why they match").fill("Same sink, same leak.");
  await operator.getByRole("button", { name: "Link as duplicate" }).click();
  await expect(
    operator.getByRole("heading", { name: "Linked as a duplicate" }),
  ).toBeVisible();

  await operator.goto("/app/queue");
  await expect(operator.getByRole("link", { name: duplicate })).toBeHidden();
  const targetRow = operator.getByRole("row", { name: target });
  await expect(visibleText(targetRow, "1 linked report")).toBeVisible();

  // Both reports survive, and the second reporter still has a working link.
  await targetRow.getByRole("link", { name: target }).click();
  await operator.waitForURL("**/app/tickets/*");
  await expect(visibleText(operator, duplicate)).toBeVisible();
  await duplicateReporter.reload();
  await expect(visibleText(duplicateReporter, duplicate)).toBeVisible();

  await operator.goto(duplicateUrl);
  await operator
    .getByLabel("Why this is a new problem")
    .fill("It turned out to be a different sink.");
  await operator.getByRole("button", { name: "Remove link" }).click();
  await expect(
    operator.getByRole("heading", { name: "Confirm triage" }),
  ).toBeVisible();

  await operator.goto("/app/queue");
  await expect(operator.getByRole("link", { name: duplicate })).toBeVisible();
});
