import { db } from "@/db";
import { bumpEntries } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  await db
    .delete(bumpEntries)
    .where(and(eq(bumpEntries.id, parseInt(id, 10)), eq(bumpEntries.userId, session.id)));
  return Response.json({ ok: true });
}
