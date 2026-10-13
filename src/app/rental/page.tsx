import Link from "next/link";
import { db, isDemoMode } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProductCard from "@/components/ProductCard";
import { getDemoProducts } from "@/db/demo";

export const dynamic = "force-dynamic";

const PLANS = [
  { name: "Essentials", price: 39, items: 2, perks: ["2 pieces / month", "Free shipping both ways", "Swap anytime"] },
  { name: "Signature", price: 69, items: 4, perks: ["4 pieces / month", "Free shipping both ways", "Priority new arrivals", "Swap anytime"], featured: true },
  { name: "Full Bump", price: 99, items: 6, perks: ["6 pieces / month", "Free shipping both ways", "Free stylist session", "Keep 1 piece / quarter"] },
];

export default async function RentalPage() {
  const rentables = isDemoMode
    ? getDemoProducts({ limit: 4 }).map((p) => ({ ...p, isRentable: true }))
    : await db!.select().from(products).where(eq(products.isRentable, true)).limit(4);

  return (
    <div>
      <section className="bg-blush/40 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-plum">New</span>
          <h1 className="mt-4 font-display text-4xl font-bold text-plum">Rent the Bump</h1>
          <p className="mt-3 text-lg text-ink/70">
            You only wear maternity clothes for a few months. Rent a rotating wardrobe, swap
            whenever you like, and send it all back after baby arrives.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border p-6 ${p.featured ? "border-terracotta bg-white shadow-lg" : "border-blush bg-white"}`}
            >
              {p.featured && (
                <span className="rounded-full bg-terracotta px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="mt-3 font-display text-2xl font-bold text-plum">{p.name}</h3>
              <p className="mt-2">
                <span className="font-display text-3xl font-bold text-terracotta">${p.price}</span>
                <span className="text-sm text-ink/50">/month</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink/70">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <span className="text-sage">✓</span> {perk}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full rounded-full bg-plum py-2.5 text-sm font-semibold text-white transition hover:bg-plum/90">
                Choose {p.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {rentables.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-plum">Popular to rent</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {rentables.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/shop" className="text-sm font-semibold text-terracotta hover:underline">
              Browse all rentable pieces →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
