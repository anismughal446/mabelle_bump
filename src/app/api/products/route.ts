import { db, isDemoMode } from "@/db";
import { getDemoProducts, getDemoCategories } from "@/db/demo";
import { products, categories } from "@/db/schema";
import { and, eq, gte, lte, sql, desc, asc, SQL } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trimester = searchParams.get("trimester");
  const category = searchParams.get("category");
  const occasion = searchParams.get("occasion");
  const size = searchParams.get("size");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");
  const rentable = searchParams.get("rentable");
  const vendorId = searchParams.get("vendorId");
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(60, parseInt(searchParams.get("limit") || "24", 10));

  // ---- DEMO MODE (no Postgres) ----
  if (isDemoMode) {
    let list = getDemoProducts();
    const cats = getDemoCategories();
    if (featured === "true") list = list.filter((p) => p.featured);
    if (rentable === "true") list = list.filter((p) => p.isRentable);
    if (occasion) list = list.filter((p) => p.occasion === occasion);
    if (size) list = list.filter((p) => (p.sizes as string[]).includes(size));
    if (trimester) list = list.filter((p) => (p.trimesterTags as string[]).includes(trimester));
    if (minPrice) list = list.filter((p) => p.price >= parseFloat(minPrice));
    if (maxPrice) list = list.filter((p) => p.price <= parseFloat(maxPrice));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (category) {
      const cat = cats.find((c) => c.slug === category);
      if (cat) list = list.filter((p) => p.categoryId === cat.id);
      else list = [];
    }
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    const total = list.length;
    const rows = list.slice((page - 1) * limit, page * limit);
    return Response.json({ products: rows, total, page, totalPages: Math.ceil(total / limit) || 1 });
  }

  const conds: SQL[] = [];
  if (trimester) conds.push(sql`${products.trimesterTags} @> ${JSON.stringify([trimester])}::jsonb`);
  if (size) conds.push(sql`${products.sizes} @> ${JSON.stringify([size])}::jsonb`);
  if (occasion) conds.push(eq(products.occasion, occasion));
  if (featured === "true") conds.push(eq(products.featured, true));
  if (rentable === "true") conds.push(eq(products.isRentable, true));
  if (vendorId) conds.push(eq(products.vendorId, parseInt(vendorId, 10)));
  if (minPrice) conds.push(gte(products.price, parseFloat(minPrice)));
  if (maxPrice) conds.push(lte(products.price, parseFloat(maxPrice)));
  if (search) conds.push(sql`${products.name} ILIKE ${"%" + search + "%"}`);
  if (category) {
    const cat = await db!.select().from(categories).where(eq(categories.slug, category)).limit(1);
    if (cat[0]) conds.push(eq(products.categoryId, cat[0].id));
    else conds.push(sql`1=0`);
  }

  const where = conds.length ? and(...conds) : undefined;
  const orderBy =
    sort === "price_asc"
      ? asc(products.price)
      : sort === "price_desc"
        ? desc(products.price)
        : desc(products.createdAt);

  const rows = await db!
    .select()
    .from(products)
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset((page - 1) * limit);

  const countRows = await db.select({ count: sql<number>`count(*)::int` }).from(products).where(where);
  const total = countRows[0]?.count ?? 0;

  return Response.json({ products: rows, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== "vendor" && session.role !== "admin")) {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.name || !body.price || !body.description) {
      return Response.json({ error: "Name, price and description are required." }, { status: 400 });
    }
    const slug = slugify(body.name) + "-" + Math.random().toString(36).slice(2, 6);
    const [product] = await db
      .insert(products)
      .values({
        name: body.name,
        slug,
        description: body.description,
        price: parseFloat(body.price),
        compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : null,
        image: body.image || "/images/placeholder.jpg",
        categoryId: body.categoryId ? parseInt(body.categoryId, 10) : null,
        trimesterTags: body.trimesterTags || [],
        sizes: body.sizes || [],
        occasion: body.occasion || "everyday",
        stock: parseInt(body.stock ?? "0", 10),
        isRentable: !!body.isRentable,
        wearItThreeWays: !!body.wearItThreeWays,
        nursingFriendly: !!body.nursingFriendly,
        featured: session.role === "admin" ? !!body.featured : false,
        vendorId: session.id,
      })
      .returning();
    return Response.json({ product });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to create product." }, { status: 500 });
  }
}
