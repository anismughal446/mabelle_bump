import { notFound } from "next/navigation";
import { db, isDemoMode } from "@/db";
import { products, reviews as reviewsTable, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProductDetailClient from "./ProductDetailClient";
import { getDemoProductBySlug, getDemoCategories } from "@/db/demo";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (isDemoMode) {
    const product = getDemoProductBySlug(slug);
    if (!product) notFound();
    const cats = getDemoCategories();
    const category = cats.find((c) => c.id === product.categoryId) ?? null;
    return (
      <ProductDetailClient
        product={product as any}
        initialReviews={[]}
        category={category as any}
      />
    );
  }

  const product = (await db!.select().from(products).where(eq(products.slug, slug)).limit(1))[0];
  if (!product) notFound();
  const productReviews = await db!
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, product.id));
  let category = null;
  if (product.categoryId) {
    category =
      (await db!.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1))[0] ??
      null;
  }
  return <ProductDetailClient product={product} initialReviews={productReviews} category={category} />;
}
