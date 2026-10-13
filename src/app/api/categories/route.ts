import { db, isDemoMode } from "@/db";
import { categories } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { getDemoCategories } from "@/db/demo";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isDemoMode) {
    return Response.json({ categories: getDemoCategories() });
  }
  const rows = await db!.select().from(categories).orderBy(categories.name);
  return Response.json({ categories: rows });
}

export async function POST(req: Request) {
  if (isDemoMode) {
    return Response.json({ error: "Demo mode — write disabled." }, { status: 503 });
  }
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  const { name, description } = await req.json();
  if (!name) return Response.json({ error: "Name is required." }, { status: 400 });
  const [cat] = await db!
    .insert(categories)
    .values({ name, slug: slugify(name), description: description || null })
    .returning();
  return Response.json({ category: cat });
}
