import { db } from "@/db";
import { reviews } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please log in to review." }, { status: 401 });
  const { productId, rating, comment } = await req.json();
  if (!productId || !rating || !comment) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }
  const [review] = await db
    .insert(reviews)
    .values({
      productId,
      userId: session.id,
      userName: session.name,
      rating: Math.min(5, Math.max(1, rating)),
      comment,
    })
    .returning();
  return Response.json({ review });
}
