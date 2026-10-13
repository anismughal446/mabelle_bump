import { db } from "@/db";
import { orders, cartItems, products, coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ orders: [] });
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.id))
    .orderBy(orders.createdAt);
  return Response.json({ orders: rows.reverse() });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please log in." }, { status: 401 });
  const { shippingAddress, couponCode } = await req.json();
  if (!shippingAddress || !shippingAddress.line1) {
    return Response.json({ error: "Shipping address is required." }, { status: 400 });
  }

  const cart = await db
    .select({
      productId: cartItems.productId,
      size: cartItems.size,
      quantity: cartItems.quantity,
      name: products.name,
      price: products.price,
      image: products.image,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, session.id));

  if (!cart.length) return Response.json({ error: "Your cart is empty." }, { status: 400 });

  let total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let appliedCoupon: string | null = null;
  if (couponCode) {
    const coupon = (
      await db.select().from(coupons).where(eq(coupons.code, couponCode.toUpperCase())).limit(1)
    )[0];
    if (coupon && coupon.active) {
      appliedCoupon = coupon.code;
      total =
        coupon.discountType === "percent"
          ? total * (1 - coupon.discountValue / 100)
          : Math.max(0, total - coupon.discountValue);
    }
  }

  const items = cart.map((i) => ({
    productId: i.productId,
    name: i.name,
    image: i.image,
    price: i.price,
    size: i.size,
    quantity: i.quantity,
  }));

  const [order] = await db
    .insert(orders)
    .values({
      userId: session.id,
      items,
      totalAmount: Math.round(total * 100) / 100,
      status: "processing",
      paymentStatus: "paid",
      shippingAddress,
      couponCode: appliedCoupon,
    })
    .returning();

  // decrement stock and clear cart
  for (const i of cart) {
    await db
      .update(products)
      .set({ stock: Math.max(0, i.stock - i.quantity) })
      .where(eq(products.id, i.productId));
  }
  await db.delete(cartItems).where(eq(cartItems.userId, session.id));

  return Response.json({ order });
}
