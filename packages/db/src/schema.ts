import { ROLES, TICKET_PRIORITIES, TICKET_STATUSES } from "@streetproof/domain";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

function createdAt() {
  return timestamp({ withTimezone: true }).notNull().defaultNow();
}

function updatedAt() {
  return timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
}

// --- Authentication (Better Auth core tables, ids are text) -----------------

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index().on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index().on(table.userId)],
);

export const verification = pgTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// --- Tenancy -------------------------------------------------------------------

export const roleEnum = pgEnum("role", ROLES);

export const tenants = pgTable("tenants", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  createdAt: createdAt(),
});

export const sites = pgTable(
  "sites",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid()
      .notNull()
      .references(() => tenants.id),
    name: text().notNull(),
    // Public code in the site's report link and QR. Grants intake only.
    intakeCode: text().unique(),
    timezone: text().notNull().default("Asia/Jakarta"),
    active: boolean().notNull().default(true),
    createdAt: createdAt(),
  },
  (table) => [unique().on(table.tenantId, table.id)],
);

export const locations = pgTable(
  "locations",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    siteId: uuid().notNull(),
    name: text().notNull(),
    active: boolean().notNull().default(true),
  },
  (table) => [
    unique().on(table.tenantId, table.id),
    foreignKey({
      columns: [table.tenantId, table.siteId],
      foreignColumns: [sites.tenantId, sites.id],
    }),
  ],
);

// One row per role. A null siteId grants the role on every site of the tenant.
export const memberships = pgTable(
  "memberships",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid()
      .notNull()
      .references(() => tenants.id),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: roleEnum().notNull(),
    siteId: uuid(),
    active: boolean().notNull().default(true),
    createdAt: createdAt(),
  },
  (table) => [
    unique()
      .on(table.tenantId, table.userId, table.role, table.siteId)
      .nullsNotDistinct(),
    index().on(table.userId, table.active),
    foreignKey({
      columns: [table.tenantId, table.siteId],
      foreignColumns: [sites.tenantId, sites.id],
    }),
  ],
);

// --- Tickets and reports ------------------------------------------------------

export const ticketStatusEnum = pgEnum("ticket_status", TICKET_STATUSES);
export const priorityEnum = pgEnum("priority", TICKET_PRIORITIES);

export const tickets = pgTable(
  "tickets",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    siteId: uuid().notNull(),
    status: ticketStatusEnum().notNull().default("submitted"),
    revision: integer().notNull().default(0),
    summary: text(),
    category: text(),
    priority: priorityEnum(),
    locationId: uuid(),
    currentAssigneeId: text().references(() => user.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    unique().on(table.tenantId, table.id),
    index().on(table.tenantId, table.siteId, table.status, table.updatedAt),
    foreignKey({
      columns: [table.tenantId, table.siteId],
      foreignColumns: [sites.tenantId, sites.id],
    }),
    foreignKey({
      columns: [table.tenantId, table.locationId],
      foreignColumns: [locations.tenantId, locations.id],
    }),
  ],
);

// A report is the original observation. It is never deleted when linked or merged.
export const reports = pgTable(
  "reports",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    siteId: uuid().notNull(),
    locationId: uuid(),
    locationText: text(),
    description: text().notNull(),
    reporterName: text(),
    canonicalTicketId: uuid().notNull(),
    revision: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [
    unique().on(table.tenantId, table.id),
    index().on(table.tenantId, table.canonicalTicketId),
    foreignKey({
      columns: [table.tenantId, table.siteId],
      foreignColumns: [sites.tenantId, sites.id],
    }),
    foreignKey({
      columns: [table.tenantId, table.locationId],
      foreignColumns: [locations.tenantId, locations.id],
    }),
    foreignKey({
      columns: [table.tenantId, table.canonicalTicketId],
      foreignColumns: [tickets.tenantId, tickets.id],
    }),
    check(
      "reports_location_given",
      sql`${table.locationId} is not null or ${table.locationText} is not null`,
    ),
  ],
);

export const assignments = pgTable(
  "assignments",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    ticketId: uuid().notNull(),
    technicianId: text()
      .notNull()
      .references(() => user.id),
    assignedBy: text()
      .notNull()
      .references(() => user.id),
    assignedAt: createdAt(),
    acceptedAt: timestamp({ withTimezone: true }),
    endedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    unique().on(table.tenantId, table.id),
    uniqueIndex("assignments_one_active_per_ticket")
      .on(table.ticketId)
      .where(sql`${table.endedAt} is null`),
    foreignKey({
      columns: [table.tenantId, table.ticketId],
      foreignColumns: [tickets.tenantId, tickets.id],
    }),
  ],
);

export const completionStatusEnum = pgEnum("completion_status", [
  "pending",
  "accepted",
  "rejected",
]);

// Immutable attempt. A rejection keeps it and the technician submits a new one.
export const completionSubmissions = pgTable(
  "completion_submissions",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    ticketId: uuid().notNull(),
    assignmentId: uuid().notNull(),
    note: text().notNull(),
    status: completionStatusEnum().notNull().default("pending"),
    submittedBy: text()
      .notNull()
      .references(() => user.id),
    submittedAt: createdAt(),
  },
  (table) => [
    unique().on(table.tenantId, table.id),
    uniqueIndex("completions_one_pending_per_ticket")
      .on(table.ticketId)
      .where(sql`${table.status} = 'pending'`),
    foreignKey({
      columns: [table.tenantId, table.ticketId],
      foreignColumns: [tickets.tenantId, tickets.id],
    }),
    foreignKey({
      columns: [table.tenantId, table.assignmentId],
      foreignColumns: [assignments.tenantId, assignments.id],
    }),
  ],
);

export const verificationDecisionEnum = pgEnum("verification_decision", [
  "accepted",
  "rejected",
]);

export const verifications = pgTable(
  "verifications",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    completionId: uuid().notNull().unique(),
    decision: verificationDecisionEnum().notNull(),
    reason: text().notNull(),
    verifierId: text()
      .notNull()
      .references(() => user.id),
    decidedAt: createdAt(),
  },
  (table) => [
    foreignKey({
      columns: [table.tenantId, table.completionId],
      foreignColumns: [
        completionSubmissions.tenantId,
        completionSubmissions.id,
      ],
    }),
  ],
);

// --- Photos ----------------------------------------------------------------------

export const uploadPurposeEnum = pgEnum("upload_purpose", [
  "report_photo",
  "completion_proof",
]);
export const uploadStateEnum = pgEnum("upload_state", [
  "pending",
  "ready",
  "rejected",
]);

// Only `ready` uploads count as completion proof.
export const uploads = pgTable(
  "uploads",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    objectKey: text().notNull().unique(),
    contentType: text().notNull(),
    bytes: integer().notNull(),
    sha256: text(),
    purpose: uploadPurposeEnum().notNull(),
    state: uploadStateEnum().notNull().default("pending"),
    reportId: uuid(),
    completionId: uuid(),
    uploadedBy: text().references(() => user.id),
    createdAt: createdAt(),
  },
  (table) => [
    index().on(table.tenantId, table.reportId),
    index().on(table.tenantId, table.completionId),
    foreignKey({
      columns: [table.tenantId, table.reportId],
      foreignColumns: [reports.tenantId, reports.id],
    }),
    foreignKey({
      columns: [table.tenantId, table.completionId],
      foreignColumns: [
        completionSubmissions.tenantId,
        completionSubmissions.id,
      ],
    }),
  ],
);

// --- Duplicates ------------------------------------------------------------------

// A duplicate is a relationship between tickets, never a status.
export const duplicateLinks = pgTable(
  "duplicate_links",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    sourceTicketId: uuid().notNull(),
    targetTicketId: uuid().notNull(),
    reason: text().notNull(),
    actorId: text()
      .notNull()
      .references(() => user.id),
    active: boolean().notNull().default(true),
    createdAt: createdAt(),
  },
  (table) => [
    check(
      "duplicate_links_not_self",
      sql`${table.sourceTicketId} <> ${table.targetTicketId}`,
    ),
    foreignKey({
      columns: [table.tenantId, table.sourceTicketId],
      foreignColumns: [tickets.tenantId, tickets.id],
    }),
    foreignKey({
      columns: [table.tenantId, table.targetTicketId],
      foreignColumns: [tickets.tenantId, tickets.id],
    }),
  ],
);

// --- History and jobs -------------------------------------------------------------

// Append-only business history. seq orders events within one ticket.
export const ticketEvents = pgTable(
  "ticket_events",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    ticketId: uuid().notNull(),
    seq: integer().notNull(),
    type: text().notNull(),
    actorId: text().references(() => user.id),
    fromStatus: ticketStatusEnum(),
    toStatus: ticketStatusEnum(),
    payload: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
  },
  (table) => [
    unique().on(table.ticketId, table.seq),
    foreignKey({
      columns: [table.tenantId, table.ticketId],
      foreignColumns: [tickets.tenantId, tickets.id],
    }),
  ],
);

export const outboxStatusEnum = pgEnum("outbox_status", [
  "pending",
  "processing",
  "done",
  "failed",
]);

// Written in the same transaction as the business change; the worker claims rows
// with FOR UPDATE SKIP LOCKED.
export const outbox = pgTable(
  "outbox",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    topic: text().notNull(),
    payload: jsonb().$type<Record<string, unknown>>().notNull(),
    status: outboxStatusEnum().notNull().default("pending"),
    attempts: integer().notNull().default(0),
    availableAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    lockedAt: timestamp({ withTimezone: true }),
    lastError: text(),
    createdAt: createdAt(),
  },
  (table) => [index().on(table.status, table.availableAt)],
);

export const aiDraftStateEnum = pgEnum("ai_draft_state", [
  "queued",
  "running",
  "succeeded",
  "failed_retryable",
  "failed_terminal",
  "skipped_manual",
  "cancelled",
]);

// A draft is a suggestion tied to the report revision it read. It never changes
// ticket status on its own.
export const aiDrafts = pgTable(
  "ai_drafts",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    reportId: uuid().notNull(),
    inputRevision: integer().notNull(),
    model: text(),
    promptVersion: text().notNull(),
    state: aiDraftStateEnum().notNull().default("queued"),
    draft: jsonb().$type<Record<string, unknown>>(),
    // Error class only; never a provider payload that could echo report content.
    error: text(),
    attempts: integer().notNull().default(0),
    inputDigest: text(),
    latencyMs: integer(),
    usage: jsonb().$type<Record<string, unknown>>(),
    createdAt: createdAt(),
    completedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    uniqueIndex("ai_drafts_one_per_input").on(
      table.reportId,
      table.inputRevision,
      table.promptVersion,
    ),
    foreignKey({
      columns: [table.tenantId, table.reportId],
      foreignColumns: [reports.tenantId, reports.id],
    }),
  ],
);

// --- Reporter access and retries -------------------------------------------------

// Only the SHA-256 of the receipt token is stored; the raw token is shown once.
export const reporterCredentials = pgTable(
  "reporter_credentials",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    reportId: uuid().notNull(),
    tokenHash: text().notNull().unique(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    revokedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    foreignKey({
      columns: [table.tenantId, table.reportId],
      foreignColumns: [reports.tenantId, reports.id],
    }),
  ],
);

export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    tenantId: uuid().notNull(),
    scope: text().notNull(),
    key: text().notNull(),
    requestDigest: text().notNull(),
    response: jsonb().$type<Record<string, unknown>>().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.scope, table.key] }),
  ],
);
