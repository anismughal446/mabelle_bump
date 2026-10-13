import { db, isDemoMode } from "@/db";
import { getDemoProductBySlug, getDemoProducts, getDemoCategories } from "@/db/demo";
import { products, reviews, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function resolveProduct(idOrSlug: string) {
  if (isDemoMode) {
    const asNum = parseInt(idOrSlug, 10);
    if (!Number.isNaN(asNum) && String(asNum) === idOrSlug) {
      return getDemoProducts().find((p) => p.id === asNum) ?? null;
    }
    return getDemoProductBySlug(idOrSlug);
  }
  const asNum = parseInt(idOrSlug, 10);
  if (!Number.isNaN(asNum) && String(asNum) === idOrSlug) {
    return (await db!.select().from(products).where(eq(products.id, asNum)).limit(1))[0];
  }
  return (await db!.select().from(products).where(eq(products.slug, idOrSlug)).limit(1))[0];
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await resolveProduct(id);
  if (!product) return Response.json({ error: "Product not found." }, { status: 404 });

  if (isDemoMode) {
    const cats = getDemoCategories();
    const category = product.categoryId
      ? cats.find((c) => c.id === product.categoryId) ?? null
      : null;
    return Response.json({ product, reviews: [], category });
  }

  const productReviews = await db!
    .select()
    .from(reviews)
    .where(eq(reviews.productId, product.id));
  let category = null;
  if (product.categoryId) {
    category =
      (await db!.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1))[0] ??
      null;
  }
  return Response.json({ product, reviews: productReviews, category });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (isDemoMode) {
    return Response.json({ error: "Demo mode — writes disabled." }, { status: 503 });
  }
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authorized." }, { status: 403 });
  const { id } = await params;
  const existing = await resolveProduct(id);
  if (!existing) return Response.json({ error: "Product not found." }, { status: 404 });
  if (session.role !== "admin" && existing.vendorId !== session.id) {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await req.json();
  const [updated] = await db!
    .update(products)
    .set({
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      price: body.price ?? existing.price,
      stock: body.stock ?? existing.stock,
      image: body.image ?? existing.image,
      featured: body.featured ?? existing.featured,
    })
    .where(eq(products.id, existing.id))
    .returning();
  return Response.json({ product: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (isDemoMode) {
    return Response.json({ error: "Demo mode — writes disabled." }, { status: 503 });
  }
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authorized." }, { status: 403 });
  const { id } = await params;
  const existing = await resolveProduct(id);
  if (!existing) return Response.json({ error: "Product not found." }, { status: 404 });
  if (session.role !== "admin" && existing.vendorId !== session.id) {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  await db!.delete(reviews).where(eq(reviews.productId, existing.id));
  await db!.delete(products).where(eq(products.id, existing.id));
  return Response.json({ ok: true });
}
