import { createDb, recordDraftFailure, schema } from "@streetproof/db";
import { expect, test } from "@playwright/test";
import { and, eq } from "drizzle-orm";

import {
  ACCOUNTS,
  openFromQueue,
  PHOTOS,
  signIn,
  startWork,
  submitProof,
  submitReport,
  triageAndAssign,
  unique,
  visibleText,
} from "./helpers";

// No worker runs here, so these tests set up what one would have left behind.
test.skip(
  Boolean(process.env.E2E_BASE_URL),
  "Needs direct access to the test database",
);

const { memberships, reports, user } = schema;
const { db, pool } = createDb(process.env.E2E_DATABASE_URL ?? "");

test.afterAll(async () => {
  await pool.end();
});

test("an operator retries a failed suggestion and can still triage meanwhile", async ({
  browser,
}) => {
  const description = unique("Lamp keeps blinking in the lobby");
  await submitReport(browser, description);
  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.description, description));
  if (!report) throw new Error("Report not found.");
  await recordDraftFailure(db, {
    tenantId: report.tenantId,
    reportId: report.id,
    inputRevision: report.revision,
    promptVersion: "e2e",
    state: "failed_terminal",
    errorClass: "worker_error",
  });

  const operator = await signIn(browser, ACCOUNTS.operator);
  await openFromQueue(operator, description);
  await expect(
    visibleText(operator, "The suggestion couldn't be prepared."),
  ).toBeVisible();

  await operator.getByRole("button", { name: "Try again" }).click();

  await expect(visibleText(operator, "Preparing a suggestion.")).toBeVisible();
  await expect(
    operator.getByRole("button", { name: "Try again" }),
  ).toBeHidden();
  await expect(
    visibleText(operator, "AI suggestion requested again"),
  ).toBeVisible();
  await expect(
    operator.getByRole("button", { name: "Confirm triage" }),
  ).toBeVisible();
});

test("someone with both roles can't review the work they submitted", async ({
  browser,
}) => {
  const [technician] = await db
    .select({
      tenantId: memberships.tenantId,
      siteId: memberships.siteId,
      userId: memberships.userId,
    })
    .from(memberships)
    .innerJoin(user, eq(user.id, memberships.userId))
    .where(
      and(
        eq(user.email, ACCOUNTS.technician),
        eq(memberships.role, "technician"),
      ),
    );
  if (!technician) throw new Error("Technician not found.");
  const [extraRole] = await db
    .insert(memberships)
    .values({ ...technician, role: "supervisor" })
    .returning({ id: memberships.id });
  if (!extraRole) throw new Error("Role not added.");

  try {
    const description = unique("Loose tile by the stairs");
    await submitReport(browser, description);
    const operator = await signIn(browser, ACCOUNTS.operator);
    const ticketUrl = await triageAndAssign(
      operator,
      description,
      unique("Loose stair tile"),
    );

    const worker = await signIn(browser, ACCOUNTS.technician);
    await startWork(worker, ticketUrl);
    await submitProof(worker, "Fixed the tile in place.", PHOTOS.repaired);

    await expect(
      worker.getByRole("heading", { name: "Review the proof" }),
    ).toBeVisible();
    await expect(
      visibleText(worker, "another supervisor has to review it"),
    ).toBeVisible();
    await expect(
      worker.getByRole("button", { name: "Verify completion" }),
    ).toBeHidden();

    // The rule holds for the person who didn't do the work.
    const supervisor = await signIn(browser, ACCOUNTS.supervisor);
    await supervisor.goto(ticketUrl);
    await expect(
      supervisor.getByRole("button", { name: "Verify completion" }),
    ).toBeVisible();
  } finally {
    await db.delete(memberships).where(eq(memberships.id, extraRole.id));
  }
});
