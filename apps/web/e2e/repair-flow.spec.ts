import { expect, test } from "@playwright/test";

import {
  ACCOUNTS,
  PHOTOS,
  signIn,
  startWork,
  submitProof,
  submitReport,
  triageAndAssign,
  unique,
  visibleText,
} from "./helpers";

test("a report becomes verified work, through a rejected proof", async ({
  browser,
}) => {
  const description = unique("Pipe under the pantry sink is dripping");
  const summary = unique("Dripping pantry pipe");

  const reporter = await submitReport(browser, description);
  await expect(
    visibleText(reporter, "Received", { exact: true }),
  ).toBeVisible();

  const operator = await signIn(browser, ACCOUNTS.operator);
  const ticketUrl = await triageAndAssign(operator, description, summary);

  const technician = await signIn(browser, ACCOUNTS.technician);
  await technician.goto("/app/work");
  await expect(technician.getByRole("link", { name: summary })).toBeVisible();
  await startWork(technician, ticketUrl);

  await reporter.reload();
  await expect(
    visibleText(reporter, "Being repaired", { exact: true }),
  ).toBeVisible();

  await submitProof(technician, "Tightened the joint.", PHOTOS.wrongObject);
  await expect(
    technician.getByRole("heading", { name: "Completion proof" }),
  ).toBeVisible();

  const supervisor = await signIn(browser, ACCOUNTS.supervisor);
  await supervisor.goto("/app/reviews");
  await supervisor.getByRole("link", { name: summary }).click();
  await supervisor.waitForURL("**/app/tickets/*");
  await supervisor
    .getByLabel("Your reason")
    .fill("This photo shows a door. Send a photo of the pipe.");
  await supervisor
    .getByRole("button", { name: "Request corrected proof" })
    .click();
  await expect(
    visibleText(supervisor, "Proof rejected", { exact: true }).first(),
  ).toBeVisible();

  await technician.reload();
  await technician.getByRole("button", { name: "Resume work" }).click();
  await submitProof(technician, "Replaced the joint.", PHOTOS.repaired);
  await expect(
    visibleText(technician, "Replaced the joint.", { exact: true }),
  ).toBeVisible();
  // The rejected attempt stays on record.
  await expect(
    visibleText(technician, "Tightened the joint.", { exact: true }),
  ).toBeVisible();

  await supervisor.reload();
  await supervisor
    .getByLabel("Your reason")
    .fill("The photo shows the repaired joint.");
  await supervisor.getByRole("button", { name: "Verify completion" }).click();
  await expect(
    visibleText(supervisor, "Verified closed", { exact: true }).first(),
  ).toBeVisible();

  await reporter.reload();
  await expect(
    visibleText(reporter, "Resolved", { exact: true }),
  ).toBeVisible();
  // A reporter never sees who did the work or that a proof was rejected.
  await expect(visibleText(reporter, "Budi Technician")).toBeHidden();
  await expect(visibleText(reporter, "rejected")).toBeHidden();
});

test("completion is refused until the checklist is met or a reason is given", async ({
  browser,
}) => {
  const description = unique("Pantry drain is blocked");
  const summary = unique("Blocked pantry drain");

  await submitReport(browser, description);
  const operator = await signIn(browser, ACCOUNTS.operator);
  const ticketUrl = await triageAndAssign(operator, description, summary);
  const technician = await signIn(browser, ACCOUNTS.technician);
  await startWork(technician, ticketUrl);

  await technician.getByLabel("What did you do?").fill("Cleared the drain.");
  await technician.getByLabel("Proof photos").setInputFiles(PHOTOS.repaired);
  await technician.getByRole("button", { name: "Submit completion" }).click();
  await expect(visibleText(technician, "Confirm every check")).toBeVisible();
  // What they typed survives the refusal.
  await expect(technician.getByLabel("What did you do?")).toHaveValue(
    "Cleared the drain.",
  );

  await technician.getByLabel("Proof photos").setInputFiles([]);
  await technician
    .getByRole("checkbox", { name: "I can't confirm everything" })
    .check();
  await technician
    .getByLabel("What's stopping you?")
    .fill("The room was locked before I could take a photo.");
  await technician.getByRole("button", { name: "Submit completion" }).click();
  await expect(
    visibleText(technician, "Exception requested", { exact: true }),
  ).toBeVisible();

  // Without a photo the supervisor can only send it back.
  const supervisor = await signIn(browser, ACCOUNTS.supervisor);
  await supervisor.goto(ticketUrl);
  await expect(
    supervisor.getByRole("button", { name: "Request corrected proof" }),
  ).toBeVisible();
  await expect(
    supervisor.getByRole("button", { name: "Verify completion" }),
  ).toBeHidden();
});
