import { db, isDemoMode } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isDemoMode) {
    return Response.json({ ok: true, mode: "demo" });
  }
  try {
    await db!.execute(sql`select 1`);
    return Response.json({ ok: true, mode: "postgres" });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
