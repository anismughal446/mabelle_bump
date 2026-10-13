import { db } from "@/db";
import { users, Address } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authorized." }, { status: 401 });
  const { name, dueDate, addresses } = await req.json();
  const existing = (await db.select().from(users).where(eq(users.id, session.id)).limit(1))[0];
  if (!existing) return Response.json({ error: "Not found." }, { status: 404 });
  const [updated] = await db
    .update(users)
    .set({
      name: name ?? existing.name,
      dueDate: dueDate !== undefined ? dueDate : existing.dueDate,
      addresses: (addresses ?? existing.addresses) as Address[],
    })
    .where(eq(users.id, session.id))
    .returning();
  return Response.json({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      dueDate: updated.dueDate,
      addresses: updated.addresses,
    },
  });
}
