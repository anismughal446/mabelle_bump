import { db } from "@/db";
import { bumpEntries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ entries: [] });
  const rows = await db
    .select()
    .from(bumpEntries)
    .where(eq(bumpEntries.userId, session.id))
    .orderBy(bumpEntries.weekNumber);
  return Response.json({ entries: rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please log in." }, { status: 401 });
  const { weekNumber, imageUrl, note, entryDate } = await req.json();
  if (!weekNumber || !imageUrl) {
    return Response.json({ error: "Week number and image are required." }, { status: 400 });
  }
  const [entry] = await db
    .insert(bumpEntries)
    .values({
      userId: session.id,
      weekNumber: parseInt(weekNumber, 10),
      imageUrl,
      note: note || null,
      entryDate: entryDate || new Date().toISOString().slice(0, 10),
    })
    .returning();
  return Response.json({ entry });
}
