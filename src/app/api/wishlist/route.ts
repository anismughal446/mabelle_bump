import { db, isDemoMode } from "@/db";
import { wishlist, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ items: [] });
  const rows = await db
    .select({
      id: wishlist.id,
      productId: wishlist.productId,
      name: products.name,
      price: products.price,
      image: products.image,
      slug: products.slug,
    })
    .from(wishlist)
    .innerJoin(products, eq(wishlist.productId, products.id))
    .where(eq(wishlist.userId, session.id));
  return Response.json({ items: rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please log in." }, { status: 401 });
  const { productId } = await req.json();
  const existing = await db
    .select()
    .from(wishlist)
    .where(and(eq(wishlist.userId, session.id), eq(wishlist.productId, productId)))
    .limit(1);
  if (existing[0]) {
    await db.delete(wishlist).where(eq(wishlist.id, existing[0].id));
    return Response.json({ added: false });
  }
  await db.insert(wishlist).values({ userId: session.id, productId });
  return Response.json({ added: true });
}
