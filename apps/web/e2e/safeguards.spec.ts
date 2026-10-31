import {
  createDb,
  markDraftRunning,
  recordDraftFailure,
  recordDraftSuccess,
  schema,
  submitReport,
} from "@streetproof/db";
import { expect, test, type Browser } from "@playwright/test";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import {
  ACCOUNTS,
  choose,
  openFromQueue,
  PHOTOS,
  signIn,
  startWork,
  submitProof,
  triageAndAssign,
  unique,
  visibleText,
} from "./helpers";

// No worker runs here, so these tests set up what one would have left behind.
test.skip(
  Boolean(process.env.E2E_BASE_URL),
  "Needs direct access to the test database",
);

const { memberships, reports, sites, user } = schema;
const { db, pool } = createDb(process.env.E2E_DATABASE_URL ?? "");

test.afterAll(async () => {
  await pool.end();
});

// Straight to the database. What's tested here starts after the report form, and
// the whole suite shares that form's rate limit.
async function fileReport(description: string) {
  const [site] = await db
    .select({ id: sites.id, tenantId: sites.tenantId })
    .from(sites)
    .where(eq(sites.intakeCode, "graha-tower-a"));
  if (!site) throw new Error("Site not found.");
  const outcome = await submitReport(db, {
    tenantId: site.tenantId,
    siteId: site.id,
    reportId: randomUUID(),
    locationId: null,
    locationText: "Lobby",
    description,
    photos: [],
    idempotencyKey: randomUUID(),
    requestDigest: "e2e",
  });
  if (!outcome.ok) throw new Error(outcome.code);
}

test("an operator retries a failed suggestion and can still triage meanwhile", async ({
  browser,
}) => {
  const description = unique("Lamp keeps blinking in the lobby");
  await fileReport(description);
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

// What the worker writes when a suggestion is ready. The open page picks it up
// on its next refresh, a few seconds later.
async function deliverDraft(description: string, duplicateOfTicketId: string) {
  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.description, description));
  if (!report) throw new Error("Report not found.");
  const key = {
    tenantId: report.tenantId,
    reportId: report.id,
    inputRevision: report.revision,
    promptVersion: "e2e",
  };
  await markDraftRunning(db, {
    ...key,
    model: "e2e-model",
    attempts: 1,
    inputDigest: "e2e",
  });
  await recordDraftSuccess(db, {
    ...key,
    ticketId: report.canonicalTicketId,
    draft: {
      summary: "Summary written by AI",
      visibleFacts: [],
      userContext: [],
      inferences: [],
      missing_fields: [],
      categoryCandidate: "electrical",
      priorityCandidate: "high",
      priorityRationale: "It affects the lobby.",
      duplicateCandidates: [
        { ticketId: duplicateOfTicketId, reason: "Reason written by AI" },
      ],
      limitations: [],
    },
    latencyMs: 1,
    usage: {},
  });
}

async function ticketIdOf(description: string) {
  const [report] = await db
    .select({ ticketId: reports.canonicalTicketId })
    .from(reports)
    .where(eq(reports.description, description));
  if (!report) throw new Error("Report not found.");
  return report.ticketId;
}

test.describe("when a suggestion arrives on an open ticket", () => {
  async function openTicketAwaitingDraft(browser: Browser) {
    const other = unique("Another report for the duplicate picker");
    await fileReport(other);
    const description = unique("Lobby lamp report");
    await fileReport(description);
    const operator = await signIn(browser, ACCOUNTS.operator);
    await openFromQueue(operator, description);
    await expect(
      visibleText(operator, "Preparing a suggestion."),
    ).toBeVisible();
    return {
      operator,
      description,
      deliver: async () => {
        await deliverDraft(description, await ticketIdOf(other));
        await expect(
          visibleText(operator, "AI suggestion from e2e-model."),
        ).toBeVisible({ timeout: 15_000 });
      },
    };
  }

  test("an untouched form starts from it", async ({ browser }) => {
    const { operator, deliver } = await openTicketAwaitingDraft(browser);

    await deliver();

    await expect(operator.getByLabel("Summary")).toHaveValue(
      "Summary written by AI",
    );
    await expect(
      operator.getByRole("combobox", { name: "Category" }),
    ).toHaveText(/Electrical/);
    await expect(operator.getByLabel("Why they match")).toHaveValue(
      "Reason written by AI",
    );
  });

  test("what the operator typed stays", async ({ browser }) => {
    const { operator, deliver } = await openTicketAwaitingDraft(browser);
    await operator.getByLabel("Summary").fill("Summary typed by the operator");
    await operator.getByLabel("Why they match").fill("Typed by the operator");

    await deliver();

    await expect(operator.getByLabel("Summary")).toHaveValue(
      "Summary typed by the operator",
    );
    await expect(operator.getByLabel("Why they match")).toHaveValue(
      "Typed by the operator",
    );
    // Fields they left alone in that form don't change under them either.
    await expect(
      operator.getByRole("combobox", { name: "Priority" }),
    ).toHaveText(/Normal/);
  });

  test("a choice in a picker stays", async ({ browser }) => {
    const { operator, description, deliver } =
      await openTicketAwaitingDraft(browser);
    await choose(operator, "Category", "Plumbing");

    await deliver();

    await expect(
      operator.getByRole("combobox", { name: "Category" }),
    ).toHaveText(/Plumbing/);
    await expect(operator.getByLabel("Summary")).toHaveValue(description);
  });
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
    await fileReport(description);
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
