import "../scripts/load-root-env";
import { and, eq, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { createDb } from "./client";
import {
  getReporterStatus,
  hasIntakeSubmission,
  submitReport,
  type SubmitReportInput,
} from "./reports";
import {
  assignments,
  idempotencyKeys,
  memberships,
  outbox,
  reporterCredentials,
  reports,
  sites,
  tenants,
  ticketEvents,
  tickets,
  uploads,
} from "./schema";
import { assignTicket, triageTicket } from "./ticket-commands";
import { getTicketDetail, listQueue, listTechnicians } from "./ticket-queries";

const url = process.env.DATABASE_URL;

describe.skipIf(!url)("report intake (needs the seeded local database)", () => {
  const { db, pool } = createDb(url ?? "");
  const ticketIds: string[] = [];
  const reportIds: string[] = [];
  const keys: string[] = [];

  afterEach(async () => {
    if (reportIds.length > 0) {
      await db.delete(uploads).where(inArray(uploads.reportId, reportIds));
      await db
        .delete(reporterCredentials)
        .where(inArray(reporterCredentials.reportId, reportIds));
      await db.delete(reports).where(inArray(reports.id, reportIds));
    }
    if (ticketIds.length > 0) {
      await db
        .delete(outbox)
        .where(inArray(sql`${outbox.payload}->>'ticketId'`, ticketIds));
      await db
        .delete(ticketEvents)
        .where(inArray(ticketEvents.ticketId, ticketIds));
      await db
        .delete(assignments)
        .where(inArray(assignments.ticketId, ticketIds));
      await db.delete(tickets).where(inArray(tickets.id, ticketIds));
    }
    if (keys.length > 0) {
      await db
        .delete(idempotencyKeys)
        .where(inArray(idempotencyKeys.key, keys));
    }
    ticketIds.length = 0;
    reportIds.length = 0;
    keys.length = 0;
  });

  afterAll(async () => {
    await pool.end();
  });

  async function seededSite(tenantName = "Graha Contoh (synthetic)") {
    const [row] = await db
      .select({ siteId: sites.id, tenantId: sites.tenantId })
      .from(sites)
      .innerJoin(tenants, eq(tenants.id, sites.tenantId))
      .where(eq(tenants.name, tenantName));
    if (!row) throw new Error("Run pnpm db:seed first.");
    return row;
  }

  async function submit(overrides: Partial<SubmitReportInput> = {}) {
    const { tenantId, siteId } = await seededSite();
    const reportId = randomUUID();
    const idempotencyKey = randomUUID();
    keys.push(idempotencyKey);
    reportIds.push(reportId);
    const input: SubmitReportInput = {
      tenantId,
      siteId,
      reportId,
      locationId: null,
      locationText: "Floor 3 pantry",
      description: "Water below the sink",
      photos: [
        {
          objectKey: `test/${reportId}.jpg`,
          contentType: "image/jpeg",
          bytes: 10,
          sha256: "abc",
        },
      ],
      idempotencyKey,
      requestDigest: "digest-1",
      ...overrides,
    };
    const outcome = await submitReport(db, input);
    if (outcome.ok) ticketIds.push(outcome.ticketId);
    return { input, outcome };
  }

  async function operatorOf(tenantId: string) {
    const [row] = await db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(
        and(
          eq(memberships.tenantId, tenantId),
          eq(memberships.role, "operator"),
        ),
      );
    if (!row) throw new Error("Seed data is incomplete.");
    return { userId: row.userId, roles: ["operator"] as const };
  }

  it("creates the ticket, report, photo, event and outbox row together", async () => {
    const { outcome, input } = await submit();
    if (!outcome.ok) throw new Error("expected success");

    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, outcome.ticketId));
    expect(ticket).toMatchObject({ status: "submitted", revision: 0 });

    const photos = await db
      .select()
      .from(uploads)
      .where(eq(uploads.reportId, input.reportId));
    expect(photos).toMatchObject([{ state: "ready", purpose: "report_photo" }]);

    const events = await db
      .select()
      .from(ticketEvents)
      .where(eq(ticketEvents.ticketId, outcome.ticketId));
    expect(events).toMatchObject([{ seq: 1, type: "report_submitted" }]);

    const messages = await db
      .select()
      .from(outbox)
      .where(eq(sql`${outbox.payload}->>'ticketId'`, outcome.ticketId));
    expect(messages).toMatchObject([{ topic: "report.submitted" }]);
  });

  it("never stores the raw receipt token", async () => {
    const { outcome } = await submit();
    if (!outcome.ok) throw new Error("expected success");

    const credentials = await db
      .select()
      .from(reporterCredentials)
      .where(eq(reporterCredentials.reportId, outcome.reportId));
    expect(credentials).toHaveLength(1);
    expect(credentials[0]?.tokenHash).not.toBe(outcome.reporterToken);
  });

  it("returns the same report on a retry, with a new receipt that replaces the old one", async () => {
    const { input, outcome } = await submit();
    if (!outcome.ok) throw new Error("expected success");

    const retry = await submitReport(db, { ...input, photos: [] });
    if (!retry.ok) throw new Error("expected replay");

    expect(retry).toMatchObject({
      replayed: true,
      reportId: outcome.reportId,
      ticketId: outcome.ticketId,
    });
    expect(await getReporterStatus(db, outcome.reporterToken)).toBeNull();
    expect(await getReporterStatus(db, retry.reporterToken)).not.toBeNull();
  });

  it("creates one report when two identical submissions race", async () => {
    const { tenantId, siteId } = await seededSite();
    const idempotencyKey = randomUUID();
    keys.push(idempotencyKey);
    const reportId = randomUUID();
    reportIds.push(reportId);
    const input: SubmitReportInput = {
      tenantId,
      siteId,
      reportId,
      locationId: null,
      locationText: "Lobby",
      description: "Cracked tile",
      photos: [],
      idempotencyKey,
      requestDigest: "digest-race",
    };

    const outcomes = await Promise.all([
      submitReport(db, input),
      submitReport(db, input),
    ]);
    for (const outcome of outcomes) {
      if (outcome.ok) ticketIds.push(outcome.ticketId);
    }

    expect(outcomes.every((outcome) => outcome.ok)).toBe(true);
    const created = await db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId));
    expect(created).toHaveLength(1);
  });

  it("rejects a reused key with a different request", async () => {
    const { input } = await submit();

    const outcome = await submitReport(db, {
      ...input,
      requestDigest: "digest-2",
    });

    expect(outcome).toEqual({ ok: false, code: "idempotency_conflict" });
  });

  it("stops issuing receipts after the rotation limit", async () => {
    const { input } = await submit();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await submitReport(db, input);
    }
    const outcome = await submitReport(db, input);

    expect(outcome).toEqual({ ok: false, code: "receipt_limit_reached" });
  });

  it("reports whether a submission key was already used", async () => {
    const { input } = await submit();

    expect(
      await hasIntakeSubmission(db, input.tenantId, input.idempotencyKey),
    ).toBe(true);
    expect(await hasIntakeSubmission(db, input.tenantId, randomUUID())).toBe(
      false,
    );
  });

  it("shows the reporter a sanitized stage for a valid receipt only", async () => {
    const { outcome } = await submit();
    if (!outcome.ok) throw new Error("expected success");

    const status = await getReporterStatus(db, outcome.reporterToken);

    expect(status).toMatchObject({
      stage: "received",
      location: "Floor 3 pantry",
    });
    expect(status).not.toHaveProperty("status");
    expect(await getReporterStatus(db, "not-a-real-token")).toBeNull();
  });

  it("takes a report through triage and assignment, visible in the queue", async () => {
    const { input, outcome } = await submit();
    if (!outcome.ok) throw new Error("expected success");
    const scope = { tenantId: input.tenantId, siteIds: [input.siteId] };
    const actor = await operatorOf(input.tenantId);

    const triaged = await triageTicket(db, {
      tenantId: input.tenantId,
      ticketId: outcome.ticketId,
      actor,
      expectedRevision: 0,
      summary: "Leak under pantry sink",
      category: "plumbing",
      priority: "high",
      locationId: null,
    });
    expect(triaged).toMatchObject({
      ok: true,
      ticket: { status: "triaged", revision: 1 },
    });

    const [technician] = await listTechnicians(
      db,
      input.tenantId,
      input.siteId,
    );
    if (!technician) throw new Error("Seed data is incomplete.");

    const assigned = await assignTicket(db, {
      tenantId: input.tenantId,
      siteId: input.siteId,
      ticketId: outcome.ticketId,
      actor,
      expectedRevision: 1,
      technicianId: technician.id,
    });
    expect(assigned).toMatchObject({
      ok: true,
      ticket: { status: "assigned", currentAssigneeId: technician.id },
    });

    const queue = await listQueue(db, scope);
    expect(queue.find((item) => item.id === outcome.ticketId)).toMatchObject({
      title: "Leak under pantry sink",
      status: "assigned",
    });

    const detail = await getTicketDetail(db, scope, outcome.ticketId);
    expect(detail?.events.map((event) => event.toStatus)).toEqual([
      "submitted",
      "triaged",
      "assigned",
    ]);
    expect(detail?.reports[0]?.photos).toHaveLength(1);
  });

  it("refuses to assign someone who isn't a technician on this site", async () => {
    const { input, outcome } = await submit();
    if (!outcome.ok) throw new Error("expected success");
    const actor = await operatorOf(input.tenantId);
    const other = await seededSite("Kampus Contoh (synthetic)");
    const outsider = await operatorOf(other.tenantId);

    const result = await assignTicket(db, {
      tenantId: input.tenantId,
      siteId: input.siteId,
      ticketId: outcome.ticketId,
      actor,
      expectedRevision: 0,
      technicianId: outsider.userId,
    });

    expect(result).toEqual({
      ok: false,
      rejection: { code: "technician_not_eligible" },
    });
  });

  it("hides tickets outside the member's tenant and sites", async () => {
    const { input, outcome } = await submit();
    if (!outcome.ok) throw new Error("expected success");
    const other = await seededSite("Kampus Contoh (synthetic)");

    const otherTenant = { tenantId: other.tenantId, siteIds: null };
    expect(await getTicketDetail(db, otherTenant, outcome.ticketId)).toBeNull();
    expect(await listQueue(db, otherTenant)).toEqual([]);

    const otherSite = { tenantId: input.tenantId, siteIds: [randomUUID()] };
    expect(await getTicketDetail(db, otherSite, outcome.ticketId)).toBeNull();
  });
});
