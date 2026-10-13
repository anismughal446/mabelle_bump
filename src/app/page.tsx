import Link from "next/link";
import { db, isDemoMode } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProductCard from "@/components/ProductCard";
import Newsletter from "@/components/Newsletter";
import TrimesterIcon from "@/components/TrimesterIcon";
import { TRIMESTERS } from "@/lib/utils";
import { getDemoProducts, getDemoCategories } from "@/db/demo";

export const dynamic = "force-dynamic";

// Emoji icon for each category so the shop-by-category grid feels alive
const CATEGORY_ICONS: Record<string, string> = {
  Dresses: "👗",
  "Tops & Blouses": "👚",
  "Bottoms & Leggings": "🩳",
  Workwear: "💼",
  Loungewear: "🛋️",
  "Nursing Wear": "🤱",
  "Maternity Bras": "🎀",
  Underwear: "🩲",
  Shapewear: "✨",
  "Belly Support": "🤰",
  "Breast Pumps": "🍼",
  "Feeding Aids": "🍶",
  "Nursing Pillows": "🛏️",
  "Mama Skincare": "🧴",
  "Baby Essentials": "🧸",
};

export default async function Home() {
  const featured = isDemoMode
    ? getDemoProducts({ featured: true, limit: 8 })
    : await db!.select().from(products).where(eq(products.featured, true)).limit(8);
  const allCategories = isDemoMode
    ? getDemoCategories()
    : await db!.select().from(categories).orderBy(categories.name);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
          <div className="animate-fade-up">
            <span className="inline-block rounded-full bg-blush px-3 py-1 text-xs font-semibold tracking-wide text-plum">
              Beautiful Journey Ahead ♥
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-plum sm:text-5xl lg:text-6xl">
              Clothes that grow <span className="text-terracotta">with you.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink/70">
              Everything for your pregnancy journey in one place — maternity clothes, nursing bras,
              breast pumps, shapewear, skincare and baby essentials. Shop by trimester, track your
              bump, and get a wardrobe tailored to you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-terracotta/90"
              >
                Shop the Collection
              </Link>
              <Link
                href="/quiz"
                className="rounded-full border border-plum/30 px-6 py-3 text-sm font-semibold text-plum transition hover:bg-white"
              >
                Take the Style Quiz
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[2.5rem] bg-gradient-to-br from-blush via-terracotta/20 to-sage/20 blur-sm" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero.jpg"
              alt="Beautiful maternity journey — Mabelle Bump"
              className="aspect-[3/4] w-full rounded-[2rem] object-cover shadow-2xl ring-4 ring-white"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/85 px-4 py-3 text-center backdrop-blur">
              <p className="font-display text-sm font-semibold text-plum">Beautiful Journey Ahead ♥</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust guarantee bar */}
      <section className="border-y border-blush bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 py-6 sm:px-6 md:grid-cols-4">
          {[
            ["🚚", "Free Shipping", "On all orders over $75"],
            ["↩️", "7-Day Returns", "Easy returns & exchanges"],
            ["🔒", "Secure Checkout", "Your data stays safe"],
            ["💬", "Mama Support", "Real help, 7 days a week"],
          ].map(([icon, title, sub]) => (
            <div key={title} className="flex items-center gap-3 px-2 py-2">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-plum">{title}</p>
                <p className="text-xs text-ink/55">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trimester shop */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold text-plum">Shop by Trimester</h2>
          <p className="mt-2 text-ink/60">Because S / M / L doesn&apos;t tell the whole story.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {TRIMESTERS.map((t) => (
            <Link
              key={t.key}
              href={`/shop?trimester=${t.key}`}
              className="group rounded-2xl border border-blush bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center transition group-hover:scale-110">
                <TrimesterIcon stage={t.key} />
              </div>
              <p className="font-semibold text-plum">{t.label}</p>
              <p className="mt-1 text-xs text-terracotta group-hover:underline">Shop now →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by category — everything a mama needs */}
      <section className="bg-blush/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold text-plum">Everything for Your Journey</h2>
            <p className="mt-2 text-ink/60">
              From bump to baby — clothes, bras, pumps, skincare and more, all in one place.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {allCategories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="group flex flex-col items-center rounded-2xl border border-blush bg-white p-4 text-center transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-3xl transition group-hover:scale-110">
                  {CATEGORY_ICONS[c.name] ?? "🛍️"}
                </span>
                <p className="mt-2 text-xs font-semibold leading-tight text-plum sm:text-sm">
                  {c.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold text-plum">Loved by Mamas</h2>
          <Link href="/shop" className="text-sm font-semibold text-terracotta hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Feature strip */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            emoji="📸"
            title="Bump Growth Tracker"
            body="Upload a weekly photo and watch your journey unfold in a beautiful timeline."
            href="/bump-tracker"
          />
          <FeatureCard
            emoji="✨"
            title="AI Style Quiz"
            body="Answer a few questions and get a personalized capsule wardrobe in seconds."
            href="/quiz"
          />
          <FeatureCard
            emoji="🔁"
            title="Rent the Bump"
            body="Only need it for a few months? Rent 4 pieces a month and swap anytime."
            href="/rental"
          />
        </div>
      </section>

      {/* Social proof — let mamas speak */}
      <section className="bg-blush/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-2xl text-terracotta">★★★★★</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-plum">Loved by 7,000+ Mamas</h2>
            <p className="mt-1 text-sm text-ink/60">Rated 4.9 / 5 from thousands of real reviews</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                quote:
                  "Finally a maternity store that gets it. The trimester filter saved me so much time, and I'm still wearing half my pieces post-baby.",
                name: "Sophie",
                tag: "mama of two",
              },
              {
                quote:
                  "Ordered the nursing bras, belly band and a pump — everything in one place, delivered fast and the quality is beautiful.",
                name: "Ayesha",
                tag: "first-time mum",
              },
              {
                quote:
                  "The bump tracker made me log in every week. Such a sweet way to look back on the whole journey. Highly recommend!",
                name: "Maria",
                tag: "35 weeks",
              },
            ].map((r) => (
              <div key={r.name} className="rounded-2xl border border-blush bg-white p-6 shadow-sm">
                <p className="text-terracotta">★★★★★</p>
                <blockquote className="mt-3 text-sm leading-relaxed text-ink/75">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <p className="mt-4 text-sm font-semibold text-plum">
                  {r.name} <span className="font-normal text-ink/50">· {r.tag}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold text-plum">Join the Mabelle Bump family</h2>
        <p className="mx-auto mt-2 max-w-md text-ink/60">
          Weekly pregnancy tips, early access to drops, and a little extra off your first order.
        </p>
<Newsletter />
      </section>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  body,
  href,
}: {
  emoji: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-blush bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-3 text-3xl">{emoji}</div>
      <h3 className="font-display text-xl font-bold text-plum">{title}</h3>
      <p className="mt-2 text-sm text-ink/60">{body}</p>
    </Link>
  );
}
