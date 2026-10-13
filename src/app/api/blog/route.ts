import { db, isDemoMode } from "@/db";
import { blogPosts } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isDemoMode) {
    return Response.json({ posts: [] });
  }
  const rows = await db!.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  return Response.json({ posts: rows });
}
