import { db } from "@/db";
import { orders, products, users } from "@/db/schema";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  const allOrders = await db.select().from(orders);
  const revenue = allOrders.reduce((s, o) => s + o.totalAmount, 0);
  const productCount = (await db.select({ c: sql<number>`count(*)::int` }).from(products))[0].c;
  const userCount = (await db.select({ c: sql<number>`count(*)::int` }).from(users))[0].c;
  const vendorCount = (
    await db.select({ c: sql<number>`count(*)::int` }).from(users).where(sql`${users.role} = 'vendor'`)
  )[0].c;

  // revenue by month (last 6 months)
  const byMonth: Record<string, number> = {};
  for (const o of allOrders) {
    const key = new Date(o.createdAt).toLocaleString("en-US", { month: "short" });
    byMonth[key] = (byMonth[key] || 0) + o.totalAmount;
  }

  const statusCounts: Record<string, number> = {};
  for (const o of allOrders) statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;

  return Response.json({
    revenue: Math.round(revenue * 100) / 100,
    orderCount: allOrders.length,
    productCount,
    userCount,
    vendorCount,
    byMonth,
    statusCounts,
  });
}
