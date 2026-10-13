import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return Response.json({ coupons: rows });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  const { code, discountType, discountValue, expiryDate } = await req.json();
  if (!code || !discountValue) return Response.json({ error: "Code and value required." }, { status: 400 });
  const [coupon] = await db
    .insert(coupons)
    .values({
      code: code.toUpperCase(),
      discountType: discountType || "percent",
      discountValue: parseFloat(discountValue),
      expiryDate: expiryDate || null,
    })
    .returning();
  return Response.json({ coupon });
}
