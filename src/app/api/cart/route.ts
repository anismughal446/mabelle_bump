import { db, isDemoMode } from "@/db";
import { cartItems, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ items: [] });
  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      size: cartItems.size,
      quantity: cartItems.quantity,
      name: products.name,
      price: products.price,
      image: products.image,
      stock: products.stock,
      slug: products.slug,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, session.id));
  return Response.json({ items: rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please log in to add to cart." }, { status: 401 });
  const { productId, size, quantity } = await req.json();
  if (!productId || !size) return Response.json({ error: "Missing fields." }, { status: 400 });
  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.userId, session.id),
        eq(cartItems.productId, productId),
        eq(cartItems.size, size),
      ),
    )
    .limit(1);
  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + (quantity || 1) })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      userId: session.id,
      productId,
      size,
      quantity: quantity || 1,
    });
  }
  return Response.json({ ok: true });
}
