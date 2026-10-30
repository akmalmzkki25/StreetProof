import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString });
  return { db: drizzle(pool, { schema, casing: "snake_case" }), pool };
}

export type Db = ReturnType<typeof createDb>["db"];

let shared: Db | undefined;

// One pool per process, created on first use so importing the package never
// opens a connection.
export function getDb(): Db {
  if (!shared) {
    const url = process.env.DATABASE_URL;
    if (!url)
      throw new Error(
        "DATABASE_URL is not set. Copy .env.example to .env at the repo root.",
      );
    shared = createDb(url).db;
  }
  return shared;
}
