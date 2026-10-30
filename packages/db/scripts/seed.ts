import "./load-root-env";
import { hashPassword } from "better-auth/crypto";
import { sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { Role } from "@streetproof/domain";
import { createDb } from "../src/client";
import {
  account,
  locations,
  memberships,
  sites,
  tenants,
  user,
} from "../src/schema";
import { createStorage, storageConfigFromEnv } from "../src/storage";

// Synthetic demo data only. Every account shares this local test password.
const DEMO_PASSWORD = "streetproof-demo";

type DemoUser = { name: string; email: string; roles: Role[] };

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set in the root .env.");

const { db, pool } = createDb(url);

await db.execute(sql`
  truncate table
    idempotency_keys, reporter_credentials, ai_drafts, outbox, ticket_events,
    duplicate_links, uploads, verifications, completion_submissions, assignments,
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

async function seedTenant(options: {
  tenantName: string;
  siteName: string;
  locationNames: string[];
  users: DemoUser[];
}) {
  const [tenant] = await db
    .insert(tenants)
    .values({ name: options.tenantName })
    .returning();
  if (!tenant) throw new Error("Tenant insert returned nothing.");

  const [site] = await db
    .insert(sites)
    .values({ tenantId: tenant.id, name: options.siteName })
    .returning();
  if (!site) throw new Error("Site insert returned nothing.");

  await db.insert(locations).values(
    options.locationNames.map((name) => ({
      tenantId: tenant.id,
      siteId: site.id,
      name,
    })),
  );

  for (const demoUser of options.users) {
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

  return { tenant, site };
}

await seedTenant({
  tenantName: "Graha Contoh (synthetic)",
  siteName: "Graha Contoh Tower A",
  locationNames: [
    "Lobby",
    "Floor 3 pantry",
    "Floor 7 restroom",
    "Basement parking B1",
  ],
  users: [
    {
      name: "Dewi Operator",
      email: "operator@streetproof.test",
      roles: ["operator"],
    },
    {
      name: "Budi Technician",
      email: "technician@streetproof.test",
      roles: ["technician"],
    },
    {
      name: "Rina Technician",
      email: "technician2@streetproof.test",
      roles: ["technician"],
    },
    {
      name: "Sari Supervisor",
      email: "supervisor@streetproof.test",
      roles: ["supervisor"],
    },
    {
      name: "Admin Graha",
      email: "admin@streetproof.test",
      roles: ["tenant_admin", "operator", "supervisor"],
    },
  ],
});

// A second tenant exists so tenant isolation can be tested against real rows.
await seedTenant({
  tenantName: "Kampus Contoh (synthetic)",
  siteName: "Kampus Contoh Main Building",
  locationNames: ["Library", "Hall B"],
  users: [
    {
      name: "Other Tenant Operator",
      email: "operator@kampus.streetproof.test",
      roles: ["operator"],
    },
  ],
});

await pool.end();

const storage = createStorage(storageConfigFromEnv());
await storage.ensureBucket();

console.log(
  `Seeded two synthetic tenants. Sign in with any @streetproof.test email and "${DEMO_PASSWORD}".`,
);
console.log(`Bucket "${storage.bucket}" is ready.`);
