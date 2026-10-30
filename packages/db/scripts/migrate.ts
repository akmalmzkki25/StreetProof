import "./load-root-env";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "node:url";
import { createDb } from "../src/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set in the root .env.");

const { db, pool } = createDb(url);
await migrate(db, {
  migrationsFolder: fileURLToPath(new URL("../migrations", import.meta.url)),
});
await pool.end();
console.log("Migrations applied.");
