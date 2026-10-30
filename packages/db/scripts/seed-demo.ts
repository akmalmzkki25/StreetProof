import "./load-root-env";
import { and, count, eq } from "drizzle-orm";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDb } from "../src/client";
import { DEMO_TENANTS } from "../src/demo";
import { drawDemoPhoto, type DemoScene } from "../src/demo-photos";
import { seedDemoScenarios, type DemoPeople } from "../src/demo-scenarios";
import type { ReportPhoto } from "../src/reports";
import {
  locations,
  memberships,
  sites,
  tenants,
  tickets,
  user,
} from "../src/schema";
import { createStorage, storageConfigFromEnv } from "../src/storage";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set in the root .env.");

const demoTenant = DEMO_TENANTS[0];
if (!demoTenant) throw new Error("No demo tenant is defined.");

const { db, pool } = createDb(url);
const storage = createStorage(storageConfigFromEnv());

const [place] = await db
  .select({
    tenantId: tenants.id,
    siteId: sites.id,
    isSynthetic: tenants.isSynthetic,
  })
  .from(tenants)
  .innerJoin(sites, eq(sites.tenantId, tenants.id))
  .where(eq(tenants.name, demoTenant.tenantName));
if (!place?.isSynthetic) {
  throw new Error(
    "Run pnpm db:seed first. Demo scenarios need the synthetic tenant.",
  );
}

const [existing] = await db
  .select({ total: count() })
  .from(tickets)
  .where(eq(tickets.tenantId, place.tenantId));
if ((existing?.total ?? 0) > 0) {
  throw new Error(
    "This tenant already has tickets. Use pnpm db:seed:demo to start clean.",
  );
}

async function person(
  email: string,
  role: DemoPeople[keyof DemoPeople]["roles"][number],
) {
  const [row] = await db
    .select({ userId: user.id })
    .from(user)
    .innerJoin(memberships, eq(memberships.userId, user.id))
    .where(and(eq(user.email, email), eq(memberships.role, role)));
  if (!row) throw new Error(`Demo account ${email} is missing.`);
  return { userId: row.userId, roles: [role] };
}

const siteLocations = await db
  .select({ id: locations.id, name: locations.name })
  .from(locations)
  .where(eq(locations.siteId, place.siteId));

const CONTENT_TYPES = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

// A file in fixtures/demo-photos named after the scene replaces its drawing.
function loadScene(scene: DemoScene) {
  for (const [extension, contentType] of Object.entries(CONTENT_TYPES)) {
    const path = fileURLToPath(
      new URL(`../fixtures/demo-photos/${scene}.${extension}`, import.meta.url),
    );
    if (existsSync(path)) {
      return { bytes: readFileSync(path), contentType, extension };
    }
  }
  return {
    bytes: drawDemoPhoto(scene),
    contentType: "image/png",
    extension: "png",
  };
}

async function storePhoto(scene: DemoScene): Promise<ReportPhoto> {
  const { bytes, contentType, extension } = loadScene(scene);
  const objectKey = `tenants/${place?.tenantId}/demo/${randomUUID()}.${extension}`;
  await storage.putObject(objectKey, bytes, contentType);
  return {
    objectKey,
    contentType,
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

const { tickets: seeded, receipts } = await seedDemoScenarios({
  db,
  tenantId: place.tenantId,
  siteId: place.siteId,
  people: {
    operator: await person("operator@streetproof.test", "operator"),
    technician: await person("technician@streetproof.test", "technician"),
    otherTechnician: await person("technician2@streetproof.test", "technician"),
    supervisor: await person("supervisor@streetproof.test", "supervisor"),
  },
  locationIds: new Map(siteLocations.map((row) => [row.name, row.id])),
  storePhoto,
  now: new Date(),
});

await pool.end();

const appUrl = process.env.APP_URL ?? "http://localhost:3000";
console.log(`Seeded ${Object.keys(seeded).length} named demo tickets.`);
console.log("\nReporter status links (synthetic, shown once):");
for (const [name, token] of Object.entries(receipts)) {
  console.log(`  ${name}: ${appUrl}/status#t=${token}`);
}
console.log(
  "\nStart the worker to draft the two new reports with the real model.",
);
