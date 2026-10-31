import { createDb, schema, submitReport } from "@streetproof/db";
import { eq, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import {
  handleUnexpectedLocateFailure,
  LOCATE_DAMAGE_TOPIC,
  parseGroundingOutput,
  parseSamOutput,
  runLocateDamageJob,
} from "./locate-damage-job";
import { ModelCallError, type CallModel, type CallSam } from "./meta-client";

const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
const url = process.env.DATABASE_URL;

const { damageRegions, idempotencyKeys, outbox, reporterCredentials } = schema;
const { reports, sites, tenants, ticketEvents, tickets, uploads } = schema;

// Real output, from the grammar example in the @meta-sam/parser README.
const SAM_OUTPUT =
  "<0f>0<|box;x1=211;y1=228;x2=270;y2=254;w=320;h=334|>" +
  "<|mask;x=0;y=0;data=27,60,~!!!!M!0c[0o91w?q1!pIH4pPRVp2B3'7`e.ioeAf6-k/#Xd8%dX9x(|>" +
  ",1<|box;x1=155;y1=228;x2=202;y2=254;w=320;h=334|>" +
  "<|mask;x=0;y=0;data=27,48,~!!!!J!0c[q=Pj_zs=*4C4(/./x#:/`S_GnD`=o3?X{emCgO$y@|>\n";

describe("parseSamOutput", () => {
  it("reads boxes, frame size and an outline for each match", async () => {
    const regions = await parseSamOutput(SAM_OUTPUT, "water puddle");

    expect(regions).toHaveLength(2);
    expect(regions[0]).toMatchObject({
      source: "sam",
      label: "water puddle",
      frameWidth: 320,
      frameHeight: 334,
      left: 211,
      top: 228,
      right: 271,
      bottom: 255,
    });
    expect(regions[0]?.maskPath).toMatch(/^M/);
  });

  it("treats no matches as an empty answer", async () => {
    expect(await parseSamOutput("", "water puddle")).toEqual([]);
  });
});

describe("parseGroundingOutput", () => {
  it("clamps boxes to the grid and drops impossible ones", () => {
    const regions = parseGroundingOutput(
      JSON.stringify({
        boxes: [
          { x_min: -5, y_min: 100, x_max: 1200, y_max: 500 },
          { x_min: 700, y_min: 100, x_max: 700, y_max: 500 },
        ],
      }),
      "ceiling stain",
    );

    expect(regions).toEqual([
      {
        source: "grounding",
        label: "ceiling stain",
        frameWidth: 1000,
        frameHeight: 1000,
        left: 0,
        top: 100,
        right: 1000,
        bottom: 500,
        maskPath: null,
      },
    ]);
  });

  it("asks for a retry on output it can't read", () => {
    expect(() => parseGroundingOutput("not json", "stain")).toThrow(
      ModelCallError,
    );
  });
});

describe.skipIf(!url)(
  "runLocateDamageJob (needs the seeded local database)",
  () => {
    const { db, pool } = createDb(url ?? "");
    const ticketIds: string[] = [];
    const reportIds: string[] = [];
    const keys: string[] = [];

    afterEach(async () => {
      if (ticketIds.length === 0) return;
      await db
        .delete(damageRegions)
        .where(inArray(damageRegions.reportId, reportIds));
      await db.delete(uploads).where(inArray(uploads.reportId, reportIds));
      await db
        .delete(reporterCredentials)
        .where(inArray(reporterCredentials.reportId, reportIds));
      await db.delete(reports).where(inArray(reports.id, reportIds));
      await db
        .delete(outbox)
        .where(inArray(sql`${outbox.payload}->>'ticketId'`, ticketIds));
      await db
        .delete(ticketEvents)
        .where(inArray(ticketEvents.ticketId, ticketIds));
      await db.delete(tickets).where(inArray(tickets.id, ticketIds));
      await db
        .delete(idempotencyKeys)
        .where(inArray(idempotencyKeys.key, keys));
      ticketIds.length = 0;
      reportIds.length = 0;
      keys.length = 0;
    });

    afterAll(async () => {
      await pool.end();
    });

    async function newJob(hasPhoto = true) {
      const [site] = await db
        .select({ id: sites.id, tenantId: sites.tenantId })
        .from(sites)
        .innerJoin(tenants, eq(tenants.id, sites.tenantId))
        .where(eq(tenants.name, "Graha Contoh (synthetic)"));
      if (!site) throw new Error("Run pnpm db:seed first.");
      const reportId = randomUUID();
      const idempotencyKey = randomUUID();
      keys.push(idempotencyKey);
      reportIds.push(reportId);
      const outcome = await submitReport(db, {
        tenantId: site.tenantId,
        siteId: site.id,
        reportId,
        locationId: null,
        locationText: "Floor 3",
        description: "Water below the sink",
        photos: hasPhoto
          ? [
              {
                objectKey: `test/${randomUUID()}.jpg`,
                contentType: "image/jpeg",
                bytes: 10,
                sha256: "abc",
              },
            ]
          : [],
        idempotencyKey,
        requestDigest: "digest",
      });
      if (!outcome.ok) throw new Error(outcome.code);
      ticketIds.push(outcome.ticketId);

      const [job] = await db
        .insert(outbox)
        .values({
          tenantId: site.tenantId,
          topic: LOCATE_DAMAGE_TOPIC,
          payload: {
            reportId,
            ticketId: outcome.ticketId,
            phrase: "water puddle",
          },
        })
        .returning();
      if (!job) throw new Error("no job");
      return { job, reportId, ticketId: outcome.ticketId };
    }

    function deps(callSam: CallSam, callModel?: CallModel) {
      return {
        db,
        callSam,
        callModel:
          callModel ??
          (vi.fn(async () => {
            throw new Error("Muse Spark shouldn't be called.");
          }) as CallModel),
        readPhoto: async () => new Uint8Array([1, 2, 3]),
      };
    }

    const samAnswering = (outputText: string): CallSam =>
      vi.fn(async () => ({ outputText, usage: {}, latencyMs: 1 }));

    async function regionsOf(reportId: string) {
      return db
        .select()
        .from(damageRegions)
        .where(eq(damageRegions.reportId, reportId));
    }

    it("saves SAM's outline without moving the ticket", async () => {
      const { job, reportId, ticketId } = await newJob();

      const outcome = await runLocateDamageJob(
        deps(samAnswering(SAM_OUTPUT)),
        job,
      );

      expect(outcome).toBe("succeeded");
      expect(await regionsOf(reportId)).toHaveLength(2);
      const [ticket] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId));
      expect(ticket).toMatchObject({ status: "submitted", revision: 0 });
    });

    it("falls back to a Muse Spark box when SAM finds nothing", async () => {
      const { job, reportId } = await newJob();
      const callModel: CallModel = vi.fn(async () => ({
        outputText: JSON.stringify({
          boxes: [{ x_min: 10, y_min: 20, x_max: 300, y_max: 400 }],
        }),
        usage: {},
        latencyMs: 1,
      }));

      await runLocateDamageJob(deps(samAnswering(""), callModel), job);

      const [region] = await regionsOf(reportId);
      expect(region).toMatchObject({
        source: "grounding",
        left: 10,
        right: 300,
        maskPath: null,
      });
    });

    it("replaces earlier outlines rather than stacking them", async () => {
      const { job, reportId } = await newJob();
      await runLocateDamageJob(deps(samAnswering(SAM_OUTPUT)), job);
      await runLocateDamageJob(
        deps(
          samAnswering(""),
          vi.fn(async () => ({
            outputText: JSON.stringify({ boxes: [] }),
            usage: {},
            latencyMs: 1,
          })),
        ),
        job,
      );

      expect(await regionsOf(reportId)).toEqual([]);
    });

    it("spends nothing without a photo or after triage", async () => {
      const callSam = samAnswering(SAM_OUTPUT);
      const { job } = await newJob(false);
      expect(await runLocateDamageJob(deps(callSam), job)).toBe(
        "skipped_manual",
      );

      const withPhoto = await newJob();
      await db
        .update(tickets)
        .set({ status: "triaged" })
        .where(eq(tickets.id, withPhoto.ticketId));
      expect(await runLocateDamageJob(deps(callSam), withPhoto.job)).toBe(
        "skipped_manual",
      );
      expect(callSam).not.toHaveBeenCalled();
    });

    it("retries a model failure and then gives up", async () => {
      const { job } = await newJob();
      const failing: CallSam = async () => {
        throw new ModelCallError("retryable", "http_503");
      };

      expect(
        await runLocateDamageJob(deps(failing), { ...job, attempts: 1 }),
      ).toBe("retrying");
      expect(
        await runLocateDamageJob(deps(failing), { ...job, attempts: 3 }),
      ).toBe("failed_terminal");
      expect(
        await handleUnexpectedLocateFailure(db, { ...job, attempts: 3 }),
      ).toBe("failed_terminal");
    });
  },
);
