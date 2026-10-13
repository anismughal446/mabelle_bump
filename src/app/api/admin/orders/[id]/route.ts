import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const { status } = await req.json();
  const [updated] = await db
    .update(orders)
    .set({ status })
    .where(eq(orders.id, parseInt(id, 10)))
    .returning();
  return Response.json({ order: updated });
}
