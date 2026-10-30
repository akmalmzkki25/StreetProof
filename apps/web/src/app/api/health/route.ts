import { getDb, schema } from "@streetproof/db";
import { connection } from "next/server";

// For container health checks. It says nothing beyond up or down.
export async function GET() {
  await connection();
  try {
    await getDb()
      .select({ id: schema.tenants.id })
      .from(schema.tenants)
      .limit(1);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Health check failed", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
