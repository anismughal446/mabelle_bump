import { db, isDemoMode } from "@/db";
import { products } from "@/db/schema";
import { and, sql, eq, lte, SQL } from "drizzle-orm";
import { getDemoProducts } from "@/db/demo";

export const dynamic = "force-dynamic";

// Simple rules-based "AI" recommendation engine.
export async function POST(req: Request) {
  const { trimester, occasion, budget, nursing } = await req.json();

  if (isDemoMode) {
    let list = getDemoProducts();
    if (trimester) {
      list = list.filter((p) => (p.trimesterTags as string[]).includes(trimester));
    }
    if (occasion && occasion !== "any") {
      list = list.filter((p) => p.occasion === occasion);
    }
    if (nursing) {
      list = list.filter((p) => p.nursingFriendly);
    }
    if (budget === "value") list = list.filter((p) => p.price <= 50);
    else if (budget === "mid") list = list.filter((p) => p.price <= 90);

    if (!list.length && trimester) {
      list = getDemoProducts().filter((p) =>
        (p.trimesterTags as string[]).includes(trimester),
      );
    }
    if (!list.length) list = getDemoProducts({ limit: 6 });

    return Response.json({ recommendations: list.slice(0, 6) });
  }

  const conds: SQL[] = [];
  if (trimester) conds.push(sql`${products.trimesterTags} @> ${JSON.stringify([trimester])}::jsonb`);
  if (occasion && occasion !== "any") conds.push(eq(products.occasion, occasion));
  if (nursing) conds.push(eq(products.nursingFriendly, true));
  if (budget === "value") conds.push(lte(products.price, 50));
  else if (budget === "mid") conds.push(lte(products.price, 90));

  let where = conds.length ? and(...conds) : undefined;
  let rows = await db!.select().from(products).where(where).limit(6);

  if (!rows.length && trimester) {
    where = sql`${products.trimesterTags} @> ${JSON.stringify([trimester])}::jsonb`;
    rows = await db!.select().from(products).where(where).limit(6);
  }
  if (!rows.length) {
    rows = await db!.select().from(products).limit(6);
  }

  return Response.json({ recommendations: rows });
}
