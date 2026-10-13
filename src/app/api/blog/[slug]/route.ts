import { db, isDemoMode } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (isDemoMode) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const { slug } = await params;
  const post = (await db!.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1))[0];
  if (!post) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json({ post });
}
