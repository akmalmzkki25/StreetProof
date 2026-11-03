import {
  ROLES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type ChecklistResult,
} from "@streetproof/domain";
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
  // Every figure from a synthetic tenant is labelled, so it can't pass as pilot data.
  isSynthetic: boolean().notNull().default(false),
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

export const teams = pgTable(
  "teams",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid()
      .notNull()
      .references(() => tenants.id),
    name: text().notNull(),
    active: boolean().notNull().default(true),
    createdAt: createdAt(),
  },
  (table) => [unique().on(table.tenantId, table.id)],
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
    teamId: uuid(),
    dueAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    unique().on(table.tenantId, table.id),
    index().on(table.tenantId, table.siteId, table.status, table.updatedAt),
    foreignKey({
      columns: [table.tenantId, table.teamId],
      foreignColumns: [teams.tenantId, teams.id],
    }),
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
    // Optional, for status emails and link recovery. Never sent to a model.
    reporterEmail: text(),
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
    checklist: jsonb().$type<ChecklistResult[]>().notNull().default([]),
    exceptionReason: text(),
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
    uniqueIndex("duplicate_links_one_active_per_source")
      .on(table.sourceTicketId)
      .where(sql`${table.active}`),
    index().on(table.targetTicketId, table.active),
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

// For staff only. The text stays out of ticket_events so that nothing building a
// reporter's view from events could ever carry it.
export const ticketNotes = pgTable(
  "ticket_notes",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    ticketId: uuid().notNull(),
    authorId: text()
      .notNull()
      .references(() => user.id),
    body: text().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index().on(table.ticketId, table.createdAt),
    foreignKey({
      columns: [table.tenantId, table.ticketId],
      foreignColumns: [tickets.tenantId, tickets.id],
    }),
  ],
);

// A question to the reporter. The original report never changes; the answer sits
// beside it and only an operator's review moves the ticket on.
export const clarifications = pgTable(
  "clarifications",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    ticketId: uuid().notNull(),
    reportId: uuid().notNull(),
    question: text().notNull(),
    askedBy: text()
      .notNull()
      .references(() => user.id),
    askedAt: createdAt(),
    answer: text(),
    answeredAt: timestamp({ withTimezone: true }),
    closedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    check(
      "clarifications_answer_has_time",
      sql`(${table.answer} is null) = (${table.answeredAt} is null)`,
    ),
    uniqueIndex("clarifications_one_open_per_ticket")
      .on(table.ticketId)
      .where(sql`${table.closedAt} is null`),
    index().on(table.reportId),
    foreignKey({
      columns: [table.tenantId, table.ticketId],
      foreignColumns: [tickets.tenantId, tickets.id],
    }),
    foreignKey({
      columns: [table.tenantId, table.reportId],
      foreignColumns: [reports.tenantId, reports.id],
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

// A hint for the supervisor, one per completion attempt that has a photo. Like a
// draft, it never changes ticket status.
export const proofChecks = pgTable(
  "proof_checks",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    completionId: uuid().notNull().unique(),
    model: text(),
    promptVersion: text(),
    state: aiDraftStateEnum().notNull().default("queued"),
    result: jsonb().$type<Record<string, unknown>>(),
    // Error class only, as on ai_drafts.
    error: text(),
    attempts: integer().notNull().default(0),
    inputDigest: text(),
    latencyMs: integer(),
    usage: jsonb().$type<Record<string, unknown>>(),
    createdAt: createdAt(),
    completedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    foreignKey({
      columns: [table.tenantId, table.completionId],
      foreignColumns: [
        completionSubmissions.tenantId,
        completionSubmissions.id,
      ],
    }).onDelete("cascade"),
  ],
);

// Where a model thinks the damage is on a report photo. Coordinates are in a frame
// of frameWidth by frameHeight, whatever the source, so an overlay needs one rule.
export const damageRegions = pgTable(
  "damage_regions",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    reportId: uuid().notNull(),
    uploadId: uuid().notNull(),
    source: text().notNull().$type<"sam" | "grounding">(),
    label: text().notNull(),
    frameWidth: integer().notNull(),
    frameHeight: integer().notNull(),
    left: integer().notNull(),
    top: integer().notNull(),
    right: integer().notNull(),
    bottom: integer().notNull(),
    // An SVG path relative to left and top, when the model gave an exact outline.
    maskPath: text(),
    createdAt: createdAt(),
  },
  (table) => [
    index().on(table.reportId),
    foreignKey({
      columns: [table.tenantId, table.reportId],
      foreignColumns: [reports.tenantId, reports.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.uploadId],
      foreignColumns: [uploads.id],
    }).onDelete("cascade"),
  ],
);

// One row per email sent, so a retried job doesn't mail someone twice.
export const reporterNotifications = pgTable(
  "reporter_notifications",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    reportId: uuid().notNull(),
    eventSeq: integer().notNull(),
    sentAt: createdAt(),
  },
  (table) => [
    unique().on(table.reportId, table.eventSeq),
    foreignKey({
      columns: [table.tenantId, table.reportId],
      foreignColumns: [reports.tenantId, reports.id],
    }).onDelete("cascade"),
  ],
);

// --- Telegram ---------------------------------------------------------------------

// A staff account's chat. Permissions come from memberships on every action, so
// deactivating a member also stops their chat.
export const telegramMembers = pgTable("telegram_members", {
  userId: text()
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  chatId: text().notNull().unique(),
  locale: text().notNull().default("en"),
  linkedAt: createdAt(),
});

// A chat following one report. Grants status updates and nothing else.
export const telegramReportSubscriptions = pgTable(
  "telegram_report_subscriptions",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid().notNull(),
    reportId: uuid().notNull(),
    chatId: text().notNull(),
    locale: text().notNull().default("en"),
    createdAt: createdAt(),
  },
  (table) => [
    unique().on(table.reportId, table.chatId),
    index().on(table.chatId),
    foreignKey({
      columns: [table.tenantId, table.reportId],
      foreignColumns: [reports.tenantId, reports.id],
    }).onDelete("cascade"),
  ],
);

// One-time codes behind a t.me link. Only the SHA-256 is stored.
export const telegramLinkCodes = pgTable(
  "telegram_link_codes",
  {
    codeHash: text().primaryKey(),
    userId: text().references(() => user.id, { onDelete: "cascade" }),
    reportId: uuid().references(() => reports.id, { onDelete: "cascade" }),
    tenantId: uuid().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    usedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    check(
      "telegram_link_codes_one_target",
      sql`(${table.userId} is null) <> (${table.reportId} is null)`,
    ),
  ],
);

// Where a chat is in a multi-step flow, so a restart doesn't lose someone's report.
export const telegramConversations = pgTable("telegram_conversations", {
  chatId: text().primaryKey(),
  state: jsonb().$type<Record<string, unknown>>().notNull(),
  updatedAt: updatedAt(),
});

// One row per message sent, so a retried job doesn't repeat itself.
export const telegramNotices = pgTable(
  "telegram_notices",
  {
    chatId: text().notNull(),
    ticketId: uuid()
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    eventSeq: integer().notNull(),
    sentAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.chatId, table.ticketId, table.eventSeq] }),
  ],
);

// Who did what outside the ticket workflow: sign-ins, account changes, ticket views.
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid().primaryKey().defaultRandom(),
    tenantId: uuid()
      .notNull()
      .references(() => tenants.id),
    actorId: text().references(() => user.id, { onDelete: "set null" }),
    action: text().notNull(),
    targetType: text(),
    targetId: text(),
    metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
  },
  (table) => [index().on(table.tenantId, table.createdAt)],
);

// Written by the worker while it runs, so monitoring can tell when it stops.
export const serviceHeartbeats = pgTable("service_heartbeats", {
  service: text().primaryKey(),
  lastSeenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

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
