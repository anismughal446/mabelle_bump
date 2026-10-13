import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  await db.delete(coupons).where(eq(coupons.id, parseInt(id, 10)));
  return Response.json({ ok: true });
}
