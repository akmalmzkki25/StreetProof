import "../scripts/load-root-env";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { createDb } from "./client";
import {
  assignments,
  memberships,
  outbox,
  sites,
  tenants,
  ticketEvents,
  tickets,
} from "./schema";
import { transitionTicket } from "./ticket-commands";

const url = process.env.DATABASE_URL;

describe.skipIf(!url)(
  "transitionTicket (needs the seeded local database)",
  () => {
    const { db, pool } = createDb(url ?? "");
    const createdTicketIds: string[] = [];

    afterEach(async () => {
      if (createdTicketIds.length === 0) return;
      await db
        .delete(outbox)
        .where(inArray(sql`${outbox.payload}->>'ticketId'`, createdTicketIds));
      await db
        .delete(ticketEvents)
        .where(inArray(ticketEvents.ticketId, createdTicketIds));
      await db
        .delete(assignments)
        .where(inArray(assignments.ticketId, createdTicketIds));
      await db.delete(tickets).where(inArray(tickets.id, createdTicketIds));
      createdTicketIds.length = 0;
    });

    afterAll(async () => {
      await pool.end();
    });

    async function setup() {
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.name, "Graha Contoh (synthetic)"));
      if (!tenant) throw new Error("Run pnpm db:seed first.");
      const [site] = await db
        .select()
        .from(sites)
        .where(eq(sites.tenantId, tenant.id));
      const [operator] = await db
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(
          and(
            eq(memberships.tenantId, tenant.id),
            eq(memberships.role, "operator"),
          ),
        );
      const [technician] = await db
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(
          and(
            eq(memberships.tenantId, tenant.id),
            eq(memberships.role, "technician"),
          ),
        );
      if (!site || !operator || !technician)
        throw new Error("Seed data is incomplete.");

      const [ticket] = await db
        .insert(tickets)
        .values({ tenantId: tenant.id, siteId: site.id })
        .returning();
      if (!ticket) throw new Error("no ticket");
      createdTicketIds.push(ticket.id);

      return {
        tenantId: tenant.id,
        ticket,
        operator: { userId: operator.userId, roles: ["operator"] as const },
        technician: {
          userId: technician.userId,
          roles: ["technician"] as const,
        },
      };
    }

    it("moves the ticket, bumps the revision and records one event and one outbox row", async () => {
      const { tenantId, ticket, operator } = await setup();

      const outcome = await transitionTicket(db, {
        tenantId,
        ticketId: ticket.id,
        actor: operator,
        to: "triaged",
        expectedRevision: 0,
        provided: ["triage_fields"],
        apply: async () => ({
          category: "plumbing",
          priority: "high",
          summary: "Leaking pipe in pantry",
        }),
      });

      expect(outcome).toMatchObject({
        ok: true,
        ticket: {
          status: "triaged",
          revision: 1,
          category: "plumbing",
          priority: "high",
        },
      });

      const events = await db
        .select()
        .from(ticketEvents)
        .where(eq(ticketEvents.ticketId, ticket.id));
      expect(events).toMatchObject([
        { seq: 1, fromStatus: "submitted", toStatus: "triaged" },
      ]);

      const messages = await db
        .select()
        .from(outbox)
        .where(eq(outbox.tenantId, tenantId));
      expect(
        messages.filter((message) => message.payload.ticketId === ticket.id),
      ).toHaveLength(1);
    });

    it("lets only one of two racing commands on the same revision win", async () => {
      const { tenantId, ticket, operator } = await setup();
      const command = {
        tenantId,
        ticketId: ticket.id,
        actor: operator,
        to: "triaged" as const,
        expectedRevision: 0,
        provided: ["triage_fields"] as const,
      };

      const outcomes = await Promise.all([
        transitionTicket(db, command),
        transitionTicket(db, command),
      ]);

      const winners = outcomes.filter((outcome) => outcome.ok);
      const losers = outcomes.filter((outcome) => !outcome.ok);
      expect(winners).toHaveLength(1);
      expect(losers).toEqual([
        {
          ok: false,
          rejection: { code: "stale_revision", currentRevision: 1 },
        },
      ]);

      const events = await db
        .select()
        .from(ticketEvents)
        .where(eq(ticketEvents.ticketId, ticket.id));
      expect(events).toHaveLength(1);
    });

    it("writes nothing when the guard rejects the command", async () => {
      const { tenantId, ticket, technician } = await setup();

      const outcome = await transitionTicket(db, {
        tenantId,
        ticketId: ticket.id,
        actor: technician,
        to: "triaged",
        expectedRevision: 0,
        provided: ["triage_fields"],
      });

      expect(outcome).toEqual({
        ok: false,
        rejection: { code: "forbidden_role", requiredRole: "operator" },
      });
      const [unchanged] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticket.id));
      expect(unchanged).toMatchObject({ status: "submitted", revision: 0 });
    });

    it("does not find a ticket through another tenant", async () => {
      const { ticket, operator } = await setup();
      const [otherTenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.name, "Kampus Contoh (synthetic)"));
      if (!otherTenant) throw new Error("Run pnpm db:seed first.");

      const outcome = await transitionTicket(db, {
        tenantId: otherTenant.id,
        ticketId: ticket.id,
        actor: operator,
        to: "triaged",
        expectedRevision: 0,
        provided: ["triage_fields"],
      });

      expect(outcome).toEqual({ ok: false, rejection: { code: "not_found" } });
    });

    it("assigns a technician through apply and keeps events in order", async () => {
      const { tenantId, ticket, operator, technician } = await setup();

      await transitionTicket(db, {
        tenantId,
        ticketId: ticket.id,
        actor: operator,
        to: "triaged",
        expectedRevision: 0,
        provided: ["triage_fields"],
      });
      const assigned = await transitionTicket(db, {
        tenantId,
        ticketId: ticket.id,
        actor: operator,
        to: "assigned",
        expectedRevision: 1,
        provided: ["assignee"],
        apply: async function assign(tx, locked) {
          await tx.insert(assignments).values({
            tenantId,
            ticketId: locked.id,
            technicianId: technician.userId,
            assignedBy: operator.userId,
          });
          return { currentAssigneeId: technician.userId };
        },
      });

      expect(assigned).toMatchObject({
        ok: true,
        ticket: { status: "assigned", currentAssigneeId: technician.userId },
      });
      const events = await db
        .select({ seq: ticketEvents.seq, toStatus: ticketEvents.toStatus })
        .from(ticketEvents)
        .where(eq(ticketEvents.ticketId, ticket.id))
        .orderBy(asc(ticketEvents.seq));
      expect(events).toEqual([
        { seq: 1, toStatus: "triaged" },
        { seq: 2, toStatus: "assigned" },
      ]);
    });
  },
);
