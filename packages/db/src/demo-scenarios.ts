import { checklistFor, type Role } from "@streetproof/domain";
import { randomUUID } from "node:crypto";
import { and, eq, gt, inArray, sql, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { markDraftRunning, recordDraftFailure } from "./ai-drafts";
import {
  answerClarification,
  requestClarification,
} from "./clarification-commands";
import type { Db } from "./client";
import {
  acceptWork,
  decideCompletion,
  submitCompletion,
} from "./completion-commands";
import type { DemoScene } from "./demo-photos";
import { linkDuplicate } from "./duplicate-commands";
import { getReporterStatus, submitReport, type ReportPhoto } from "./reports";
import {
  assignments,
  clarifications,
  completionSubmissions,
  duplicateLinks,
  outbox,
  reports,
  ticketEvents,
  tickets,
  verifications,
} from "./schema";
import {
  assignTicket,
  transitionTicket,
  triageTicket,
} from "./ticket-commands";

const DAY_MS = 24 * 60 * 60 * 1000;
// Stands in for the worker on tickets it would have skipped. Never a model name.
const DEMO_PROMPT_VERSION = "demo-seed";

type Person = { userId: string; roles: Role[] };

export type DemoPeople = {
  operator: Person;
  technician: Person;
  otherTechnician: Person;
  supervisor: Person;
};

export type DemoContext = {
  db: Db;
  tenantId: string;
  siteId: string;
  people: DemoPeople;
  locationIds: ReadonlyMap<string, string>;
  storePhoto: (scene: DemoScene) => Promise<ReportPhoto>;
  now: Date;
};

type Outcome = { ok: boolean; rejection?: unknown };

function assertDone(step: string, outcome: Outcome) {
  if (!outcome.ok) {
    throw new Error(
      `${step} was refused: ${JSON.stringify(outcome.rejection)}`,
    );
  }
}

// Every step runs the real command, so a scenario can't reach a state the product
// wouldn't allow. Only the timestamps are moved afterward, to give it a history.
function createFlows(context: DemoContext) {
  const { db, tenantId, people, now } = context;
  const realStart = new Date(now.getTime() - 5 * 60 * 1000);
  const ago = (days: number) => new Date(now.getTime() - days * DAY_MS);

  async function backdate<T extends PgTable>(
    table: T,
    column: PgColumn,
    scope: SQL | undefined,
    age: number,
  ) {
    await db
      .update(table)
      .set({ [keyOf(table, column)]: ago(age) } as never)
      .where(and(scope, gt(column, realStart)));
  }

  function keyOf(table: PgTable, column: PgColumn) {
    const entry = Object.entries(table).find(([, value]) => value === column);
    if (!entry) throw new Error(`No key for column ${column.name}`);
    return entry[0];
  }

  async function stamp(ticketId: string, age: number) {
    await backdate(
      ticketEvents,
      ticketEvents.createdAt,
      eq(ticketEvents.ticketId, ticketId),
      age,
    );
    await backdate(
      assignments,
      assignments.assignedAt,
      eq(assignments.ticketId, ticketId),
      age,
    );
    await backdate(
      assignments,
      assignments.acceptedAt,
      eq(assignments.ticketId, ticketId),
      age,
    );
    await backdate(
      completionSubmissions,
      completionSubmissions.submittedAt,
      eq(completionSubmissions.ticketId, ticketId),
      age,
    );
    await backdate(
      verifications,
      verifications.decidedAt,
      inArray(
        verifications.completionId,
        db
          .select({ id: completionSubmissions.id })
          .from(completionSubmissions)
          .where(eq(completionSubmissions.ticketId, ticketId)),
      ),
      age,
    );
    await backdate(
      clarifications,
      clarifications.askedAt,
      eq(clarifications.ticketId, ticketId),
      age,
    );
    await backdate(
      clarifications,
      clarifications.answeredAt,
      eq(clarifications.ticketId, ticketId),
      age,
    );
    await backdate(
      duplicateLinks,
      duplicateLinks.createdAt,
      eq(duplicateLinks.sourceTicketId, ticketId),
      age,
    );
    await db
      .update(tickets)
      .set({ updatedAt: ago(age) })
      .where(eq(tickets.id, ticketId));
  }

  async function revisionOf(ticketId: string) {
    const [row] = await db
      .select({ revision: tickets.revision })
      .from(tickets)
      .where(eq(tickets.id, ticketId));
    if (!row) throw new Error(`Ticket ${ticketId} is missing.`);
    return row.revision;
  }

  async function allChecks(ticketId: string) {
    const [row] = await db
      .select({ category: tickets.category })
      .from(tickets)
      .where(eq(tickets.id, ticketId));
    return checklistFor(row?.category ?? null).map((item) => item.id);
  }

  // The worker never ran for this report, the same result as a person getting there
  // first. Left pending, a job would spend model credits on a backdated ticket.
  async function closeDraftJob(
    ticketId: string,
    reportId: string,
    state: "skipped_manual" | "failed_terminal",
  ) {
    await db
      .update(outbox)
      .set({ status: "done" })
      .where(
        and(
          eq(outbox.topic, "report.submitted"),
          eq(sql`${outbox.payload}->>'ticketId'`, ticketId),
        ),
      );
    const key = {
      tenantId,
      reportId,
      inputRevision: 0,
      promptVersion: DEMO_PROMPT_VERSION,
    };
    await markDraftRunning(db, {
      ...key,
      model: DEMO_PROMPT_VERSION,
      attempts: 1,
      inputDigest: DEMO_PROMPT_VERSION,
    });
    await recordDraftFailure(db, {
      ...key,
      state,
      errorClass: state === "failed_terminal" ? "timeout" : null,
    });
  }

  return async function reportFlow(spec: {
    age: number;
    description: string;
    place: string;
    scene: DemoScene;
    draft: "worker" | "timeout" | "skip";
  }) {
    const reportId = randomUUID();
    const key = randomUUID();
    const locationId = context.locationIds.get(spec.place) ?? null;
    const submitted = await submitReport(db, {
      tenantId,
      siteId: context.siteId,
      reportId,
      locationId,
      locationText: locationId ? null : spec.place,
      description: spec.description,
      photos: [await context.storePhoto(spec.scene)],
      idempotencyKey: key,
      requestDigest: key,
    });
    if (!submitted.ok) throw new Error(submitted.code);
    const { ticketId, reporterToken } = submitted;

    await db
      .update(tickets)
      .set({ createdAt: ago(spec.age) })
      .where(eq(tickets.id, ticketId));
    await db
      .update(reports)
      .set({ createdAt: ago(spec.age) })
      .where(eq(reports.id, reportId));
    await stamp(ticketId, spec.age);
    if (spec.draft !== "worker") {
      await closeDraftJob(
        ticketId,
        reportId,
        spec.draft === "timeout" ? "failed_terminal" : "skipped_manual",
      );
    }

    async function step(
      name: string,
      age: number,
      run: () => Promise<Outcome>,
    ) {
      assertDone(name, await run());
      await stamp(ticketId, age);
    }
    const work = async () => ({
      tenantId,
      ticketId,
      expectedRevision: await revisionOf(ticketId),
    });

    return {
      ticketId,
      reporterToken,
      triage: (
        age: number,
        fields: {
          summary: string;
          category: string;
          priority: "low" | "normal" | "high" | "urgent";
        },
      ) =>
        step("Triage", age, async () =>
          triageTicket(db, {
            ...(await work()),
            actor: people.operator,
            locationId,
            ...fields,
          }),
        ),
      assign: (age: number, technician: Person) =>
        step("Assign", age, async () =>
          assignTicket(db, {
            ...(await work()),
            siteId: context.siteId,
            actor: people.operator,
            technicianId: technician.userId,
          }),
        ),
      accept: (age: number, technician: Person) =>
        step("Accept", age, async () =>
          acceptWork(db, { ...(await work()), actor: technician }),
        ),
      start: (age: number, actor: Person) =>
        step("Start", age, async () =>
          transitionTicket(db, {
            ...(await work()),
            actor,
            to: "in_progress",
            provided: [],
          }),
        ),
      wait: (age: number, technician: Person, reason: string) =>
        step("Wait", age, async () =>
          transitionTicket(db, {
            ...(await work()),
            actor: technician,
            to: "waiting_for_parts",
            provided: ["reason", "next_review_at"],
            payload: {
              reason,
              nextReviewAt: new Date(now.getTime() + 2 * DAY_MS).toISOString(),
            },
          }),
        ),
      complete: (
        age: number,
        technician: Person,
        note: string,
        scene: DemoScene,
      ) =>
        step("Complete", age, async () =>
          submitCompletion(db, {
            ...(await work()),
            actor: technician,
            note,
            photos: [await context.storePhoto(scene)],
            checkedItemIds: await allChecks(ticketId),
            exceptionReason: null,
          }),
        ),
      requestException: (
        age: number,
        technician: Person,
        note: string,
        exceptionReason: string,
      ) =>
        step("Request an exception", age, async () =>
          submitCompletion(db, {
            ...(await work()),
            actor: technician,
            note,
            photos: [],
            checkedItemIds: (await allChecks(ticketId)).slice(0, 1),
            exceptionReason,
          }),
        ),
      decide: (
        age: number,
        decision: "accepted" | "rejected",
        reason: string,
      ) =>
        step("Decide", age, async () =>
          decideCompletion(db, {
            ...(await work()),
            actor: people.supervisor,
            decision,
            reason,
          }),
        ),
      reopen: (age: number, reason: string) =>
        step("Reopen", age, async () =>
          transitionTicket(db, {
            ...(await work()),
            actor: people.supervisor,
            to: "reopened",
            provided: ["reason"],
            payload: { reason },
          }),
        ),
      cancel: (age: number, reason: string) =>
        step("Cancel", age, async () =>
          transitionTicket(db, {
            ...(await work()),
            actor: people.operator,
            to: "cancelled",
            provided: ["reason"],
            payload: { reason },
          }),
        ),
      ask: (age: number, question: string) =>
        step("Ask", age, async () =>
          requestClarification(db, {
            ...(await work()),
            actor: people.operator,
            question,
          }),
        ),
      answer: (age: number, answer: string) =>
        step("Answer", age, async () => {
          const status = await getReporterStatus(db, reporterToken);
          const open = status?.clarifications.find((item) => item.isOpen);
          if (!open) throw new Error("No open question to answer.");
          return answerClarification(db, {
            token: reporterToken,
            clarificationId: open.id,
            answer,
          });
        }),
      linkTo: (age: number, targetTicketId: string, reason: string) =>
        step("Link", age, async () => {
          const { tenantId: tenant, expectedRevision } = await work();
          return linkDuplicate(db, {
            tenantId: tenant,
            sourceTicketId: ticketId,
            targetTicketId,
            actor: people.operator,
            expectedRevision,
            reason,
          });
        }),
    };
  };
}

// One of each case the 90-second demo and the plan's fixture list call for. Ages are
// in days. Nothing here claims accuracy; each case only sets up a state to show.
export async function seedDemoScenarios(context: DemoContext) {
  const reportFlow = createFlows(context);
  const {
    technician: budi,
    otherTechnician: rina,
    supervisor,
  } = context.people;

  // Two fresh reports of one leak, left for the worker: real drafts, and a live
  // duplicate to link on camera.
  const newLeak = await reportFlow({
    age: 0.1,
    description:
      "Water is dripping from the pipe under the pantry sink and pooling on the floor.",
    place: "Floor 3 pantry",
    scene: "pipe_leak",
    draft: "worker",
  });
  const sameLeak = await reportFlow({
    age: 0.05,
    description:
      "Pantry sink on floor 3 is leaking. The floor by the cabinet is wet.",
    place: "Floor 3 pantry",
    scene: "pipe_leak_wide",
    draft: "worker",
  });

  // Blurry photo, no usable location: the question is still open.
  const vague = await reportFlow({
    age: 1.2,
    description: "Something is broken near the lift. It looks bad.",
    place: "Near the lift, not sure which floor",
    scene: "dark_blurry",
    draft: "skip",
  });
  await vague.ask(
    1,
    "Which floor is this on, and what is broken? The photo is too dark to see it.",
  );

  const answered = await reportFlow({
    age: 2,
    description: "The lights are out in the corridor.",
    place: "Corridor",
    scene: "dead_light",
    draft: "skip",
  });
  await answered.ask(1.8, "Which floor is the corridor on?");
  await answered.answer(1.2, "Floor 7, outside the restroom.");

  // The model timed out, so the operator triages by hand.
  const modelTimeout = await reportFlow({
    age: 0.6,
    description: "Brown stain spreading on the ceiling panel above reception.",
    place: "Lobby",
    scene: "ceiling_stain",
    draft: "timeout",
  });

  const readyToAssign = await reportFlow({
    age: 3,
    description:
      "Long crack across the floor near the ramp in the parking level.",
    place: "Basement parking B1",
    scene: "cracked_floor",
    draft: "skip",
  });
  await readyToAssign.triage(2.8, {
    summary: "Crack across the parking floor near the ramp",
    category: "building_fabric",
    priority: "normal",
  });

  const assigned = await reportFlow({
    age: 2,
    description:
      "Air conditioner in the floor 7 restroom corridor is dripping.",
    place: "Floor 7 restroom",
    scene: "ceiling_stain",
    draft: "skip",
  });
  await assigned.triage(1.9, {
    summary: "Air conditioner dripping near the floor 7 restroom",
    category: "hvac",
    priority: "normal",
  });
  await assigned.assign(1.8, rina);

  // Work in progress with a second report already linked to it.
  const inProgress = await reportFlow({
    age: 5,
    description: "Toilet in the floor 7 restroom won't stop running.",
    place: "Floor 7 restroom",
    scene: "toilet_running",
    draft: "skip",
  });
  await inProgress.triage(4.8, {
    summary: "Toilet on floor 7 keeps running",
    category: "plumbing",
    priority: "normal",
  });
  await inProgress.assign(4.6, budi);
  await inProgress.accept(4.4, budi);
  await inProgress.start(4, budi);
  const linkedDuplicate = await reportFlow({
    age: 3.5,
    description: "Water runs all night in the floor 7 restroom.",
    place: "Floor 7 restroom",
    scene: "toilet_running",
    draft: "skip",
  });
  await linkedDuplicate.linkTo(
    3.2,
    inProgress.ticketId,
    "Same restroom and same running water.",
  );

  const waitingForParts = await reportFlow({
    age: 9,
    description: "Exhaust fan in the floor 7 restroom has stopped working.",
    place: "Floor 7 restroom",
    scene: "dead_light",
    draft: "skip",
  });
  await waitingForParts.triage(8.8, {
    summary: "Exhaust fan on floor 7 has stopped",
    category: "hvac",
    priority: "normal",
  });
  await waitingForParts.assign(8.5, rina);
  await waitingForParts.accept(8, rina);
  await waitingForParts.start(7, rina);
  await waitingForParts.wait(5, rina, "Replacement fan motor is on order.");

  // Wrong object in the first proof, rejected. The second is waiting: the supervisor
  // verifies it on camera, with the rejected attempt still on record.
  const secondAttempt = await reportFlow({
    age: 6,
    description: "Ceiling panel by the lobby entrance is stained and sagging.",
    place: "Lobby",
    scene: "ceiling_stain",
    draft: "skip",
  });
  await secondAttempt.triage(5.8, {
    summary: "Stained, sagging ceiling panel by the lobby entrance",
    category: "building_fabric",
    priority: "high",
  });
  await secondAttempt.assign(5.5, budi);
  await secondAttempt.accept(5.2, budi);
  await secondAttempt.start(5, budi);
  await secondAttempt.complete(3, budi, "Replaced the panel.", "wrong_object");
  await secondAttempt.decide(
    2.5,
    "rejected",
    "This photo shows a door, not the ceiling panel. Send a photo of the new panel.",
  );
  await secondAttempt.start(2.4, budi);
  await secondAttempt.complete(
    1,
    budi,
    "Replaced the panel and checked the space above it for moisture.",
    "repaired_ceiling",
  );

  const rejected = await reportFlow({
    age: 4,
    description:
      "Pipe under the floor 3 pantry counter is leaking at the joint.",
    place: "Floor 3 pantry",
    scene: "pipe_leak",
    draft: "skip",
  });
  await rejected.triage(3.8, {
    summary: "Leaking pipe joint under the pantry counter",
    category: "plumbing",
    priority: "normal",
  });
  await rejected.assign(3.6, rina);
  await rejected.accept(3.4, rina);
  await rejected.start(3, rina);
  await rejected.complete(2, rina, "Tightened the joint.", "wrong_object");
  await rejected.decide(
    1,
    "rejected",
    "The photo doesn't show the pipe. Send a photo of the repaired joint.",
  );

  // No photo is allowed where the work happened, so a reason goes to the
  // supervisor. It can't be verified until there's a photo.
  const proofException = await reportFlow({
    age: 3,
    description: "The breaker for the floor 7 corridor lights keeps tripping.",
    place: "Floor 7 restroom",
    scene: "dead_light",
    draft: "skip",
  });
  await proofException.triage(2.8, {
    summary: "Breaker for the floor 7 corridor lights keeps tripping",
    category: "electrical",
    priority: "normal",
  });
  await proofException.assign(2.6, budi);
  await proofException.accept(2.4, budi);
  await proofException.start(2, budi);
  await proofException.requestException(
    0.5,
    budi,
    "Replaced the breaker. The corridor lights have held for a day.",
    "Cameras aren't allowed in the electrical room. The building manager saw the new breaker.",
  );

  async function closedWork(spec: {
    age: number;
    closedAge: number;
    description: string;
    summary: string;
    place: string;
    category: string;
    technician: Person;
    before: DemoScene;
    after: DemoScene;
  }) {
    const gap = (spec.age - spec.closedAge) / 7;
    const flow = await reportFlow({
      age: spec.age,
      description: spec.description,
      place: spec.place,
      scene: spec.before,
      draft: "skip",
    });
    await flow.triage(spec.age - gap, {
      summary: spec.summary,
      category: spec.category,
      priority: "normal",
    });
    await flow.assign(spec.age - gap * 2, spec.technician);
    await flow.accept(spec.age - gap * 3, spec.technician);
    await flow.start(spec.age - gap * 4, spec.technician);
    await flow.complete(
      spec.age - gap * 5,
      spec.technician,
      "Repair finished. Photo attached.",
      spec.after,
    );
    await flow.decide(
      spec.closedAge,
      "accepted",
      "The photo shows the repair is finished.",
    );
    return flow;
  }

  const closedOnTime = await closedWork({
    age: 24,
    closedAge: 18,
    description: "Pump under the pantry sink is making a grinding noise.",
    summary: "Noisy pump under the pantry sink",
    place: "Floor 3 pantry",
    category: "plumbing",
    technician: budi,
    before: "pipe_leak",
    after: "repaired_pipe",
  });
  await closedWork({
    age: 22,
    closedAge: 15,
    description: "Water stain on the ceiling of the floor 7 restroom.",
    summary: "Ceiling stain in the floor 7 restroom",
    place: "Floor 7 restroom",
    category: "building_fabric",
    technician: rina,
    before: "ceiling_stain",
    after: "repaired_ceiling",
  });
  // Closed, but after the 14 days the verified-resolution figure allows.
  await closedWork({
    age: 28,
    closedAge: 9,
    description: "Pipe behind the pantry wall leaks when the dishwasher runs.",
    summary: "Pipe behind the pantry wall leaks",
    place: "Floor 3 pantry",
    category: "plumbing",
    technician: budi,
    before: "pipe_leak",
    after: "repaired_pipe",
  });
  await closedWork({
    age: 6,
    closedAge: 2,
    description: "Lobby ceiling panel has a small stain near the lights.",
    summary: "Small stain on a lobby ceiling panel",
    place: "Lobby",
    category: "building_fabric",
    technician: budi,
    before: "ceiling_stain",
    after: "repaired_ceiling",
  });

  // Reopened: the repair didn't hold.
  const reopened = await closedWork({
    age: 18,
    closedAge: 13,
    description:
      "Concrete floor in the parking level is cracked and breaking up.",
    summary: "Cracked, crumbling floor in the parking level",
    place: "Basement parking B1",
    category: "building_fabric",
    technician: rina,
    before: "cracked_floor",
    after: "repaired_floor",
  });
  await reopened.reopen(6, "The repair is breaking up again within a week.");
  await reopened.start(5, supervisor);

  // Not a repair job, so the operator cancels it with a reason.
  const cancelled = await reportFlow({
    age: 8,
    description: "Music from the shop next door is too loud.",
    place: "Lobby",
    scene: "dark_blurry",
    draft: "skip",
  });
  await cancelled.triage(7.8, {
    summary: "Noise complaint about a neighbouring shop",
    category: "other",
    priority: "low",
  });
  await cancelled.cancel(
    7.5,
    "Not a facility repair. Passed to building management.",
  );

  return {
    tickets: {
      newLeak: newLeak.ticketId,
      sameLeak: sameLeak.ticketId,
      vague: vague.ticketId,
      answered: answered.ticketId,
      modelTimeout: modelTimeout.ticketId,
      readyToAssign: readyToAssign.ticketId,
      assigned: assigned.ticketId,
      inProgress: inProgress.ticketId,
      linkedDuplicate: linkedDuplicate.ticketId,
      waitingForParts: waitingForParts.ticketId,
      secondAttempt: secondAttempt.ticketId,
      rejected: rejected.ticketId,
      proofException: proofException.ticketId,
      closedOnTime: closedOnTime.ticketId,
      reopened: reopened.ticketId,
      cancelled: cancelled.ticketId,
    },
    receipts: {
      newLeak: newLeak.reporterToken,
      vague: vague.reporterToken,
      linkedDuplicate: linkedDuplicate.reporterToken,
      closedOnTime: closedOnTime.reporterToken,
    },
  };
}
