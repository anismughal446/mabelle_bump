import { db } from "@/db";
import { cartItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  const { quantity } = await req.json();
  if (quantity < 1) return Response.json({ error: "Quantity must be >= 1." }, { status: 400 });
  await db
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.id, parseInt(id, 10)), eq(cartItems.userId, session.id)));
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, parseInt(id, 10)), eq(cartItems.userId, session.id)));
  return Response.json({ ok: true });
}
