import "./load-root-env";
import { hashPassword } from "better-auth/crypto";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { createDb } from "../src/client";
import {
  DEMO_PASSWORD,
  DEMO_TENANTS,
  type DemoTenant,
  type DemoUser,
} from "../src/demo";
import {
  account,
  locations,
  memberships,
  sites,
  tenants,
  user,
} from "../src/schema";
import { createStorage, storageConfigFromEnv } from "../src/storage";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set in the root .env.");

const { db, pool } = createDb(url);

// This wipes everything, so it refuses once any real tenant exists.
const [realTenant] = await db
  .select({ id: tenants.id })
  .from(tenants)
  .where(eq(tenants.isSynthetic, false))
  .limit(1);
if (realTenant) {
  throw new Error(
    "Refusing to seed: this database has a non-synthetic tenant.",
  );
}

await db.execute(sql`
  truncate table
    idempotency_keys, reporter_credentials, ai_drafts, outbox, ticket_events,
    clarifications, duplicate_links, uploads, verifications, completion_submissions, assignments,
    reports, tickets, memberships, locations, sites, tenants,
    verification, account, session, "user"
  cascade
`);

const passwordHash = await hashPassword(DEMO_PASSWORD);

async function createUser(demoUser: DemoUser) {
  const id = randomUUID();
  await db.insert(user).values({
    id,
    name: demoUser.name,
    email: demoUser.email,
    emailVerified: true,
  });
  await db.insert(account).values({
    id: randomUUID(),
    accountId: id,
    providerId: "credential",
    userId: id,
    password: passwordHash,
  });
  return id;
}

async function seedTenant(demoTenant: DemoTenant) {
  const [tenant] = await db
    .insert(tenants)
    .values({ name: demoTenant.tenantName, isSynthetic: true })
    .returning();
  if (!tenant) throw new Error("Tenant insert returned nothing.");

  const [site] = await db
    .insert(sites)
    .values({
      tenantId: tenant.id,
      name: demoTenant.siteName,
      intakeCode: demoTenant.intakeCode,
    })
    .returning();
  if (!site) throw new Error("Site insert returned nothing.");

  await db.insert(locations).values(
    demoTenant.locationNames.map((name) => ({
      tenantId: tenant.id,
      siteId: site.id,
      name,
    })),
  );

  for (const demoUser of demoTenant.users) {
    const userId = await createUser(demoUser);
    await db.insert(memberships).values(
      demoUser.roles.map((role) => ({
        tenantId: tenant.id,
        userId,
        role,
        siteId: site.id,
      })),
    );
  }
}

for (const demoTenant of DEMO_TENANTS) {
  await seedTenant(demoTenant);
}

await pool.end();

const storage = createStorage(storageConfigFromEnv());
await storage.ensureBucket();

console.log(
  `Seeded ${DEMO_TENANTS.length} synthetic tenants. Demo password: "${DEMO_PASSWORD}".`,
);
console.log(`Bucket "${storage.bucket}" is ready.`);
