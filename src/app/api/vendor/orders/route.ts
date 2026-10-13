import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Return orders that contain at least one of the vendor's products
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "vendor") {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  const myProducts = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.vendorId, session.id));
  const myIds = new Set(myProducts.map((p) => p.id));

  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const relevant = allOrders
    .map((o) => ({
      ...o,
      items: o.items.filter((it) => myIds.has(it.productId)),
    }))
    .filter((o) => o.items.length > 0)
    .map((o) => ({
      ...o,
      vendorTotal: o.items.reduce((s, it) => s + it.price * it.quantity, 0),
    }));

  return Response.json({ orders: relevant });
}
