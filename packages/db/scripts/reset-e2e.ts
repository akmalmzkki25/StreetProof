import "./load-root-env";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import pg from "pg";

// E2E tests run against their own database, so a run can't wipe the demo data in
// the main one, and a dev server or worker pointed at that one can't interfere.
const adminUrl = process.env.DATABASE_URL;
const e2eUrl = process.env.E2E_DATABASE_URL;
if (!adminUrl || !e2eUrl) {
  throw new Error("DATABASE_URL and E2E_DATABASE_URL must both be set.");
}

const databaseName = new URL(e2eUrl).pathname.slice(1);
if (!/^[a-z0-9_]+_e2e$/.test(databaseName)) {
  throw new Error(
    `Refusing to reset "${databaseName}": it doesn't end in _e2e.`,
  );
}

const client = new pg.Client({ connectionString: adminUrl });
await client.connect();
const { rowCount } = await client.query(
  "select 1 from pg_database where datname = $1",
  [databaseName],
);
if (!rowCount) {
  // The name was checked above; CREATE DATABASE can't take a bound parameter.
  await client.query(`create database ${databaseName}`);
}
await client.end();

for (const script of ["migrate.ts", "seed.ts"]) {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", fileURLToPath(new URL(script, import.meta.url))],
    { env: { ...process.env, DATABASE_URL: e2eUrl }, stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error(`${script} failed.`);
}
