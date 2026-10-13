import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { code } = await req.json();
  if (!code) return Response.json({ error: "Enter a code." }, { status: 400 });
  const coupon = (
    await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1)
  )[0];
  if (!coupon || !coupon.active) {
    return Response.json({ error: "Invalid or expired coupon." }, { status: 404 });
  }
  return Response.json({
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
  });
}
