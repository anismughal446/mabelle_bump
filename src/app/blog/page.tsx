import Link from "next/link";
import { db, isDemoMode } from "@/db";
import { blogPosts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getDemoBlogPosts } from "@/db/demo";

export const dynamic = "force-dynamic";

const GUIDE_TOPICS = [
  { label: "All Guides", tag: "" },
  { label: "1st Trimester", tag: "1st trimester" },
  { label: "2nd Trimester", tag: "2nd trimester" },
  { label: "3rd Trimester", tag: "3rd trimester" },
  { label: "Postpartum", tag: "postpartum" },
  { label: "Breastfeeding", tag: "breastfeeding" },
  { label: "Style Tips", tag: "style tips" },
  { label: "Self-Care", tag: "self-care" },
];

export default async function TipsGuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const all = isDemoMode
    ? getDemoBlogPosts()
    : await db!.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  const posts = tag
    ? all.filter((p) => p.tags.some((t: string) => t.toLowerCase() === tag.toLowerCase()))
    : all;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <span className="rounded-full bg-blush px-3 py-1 text-xs font-semibold tracking-wide text-plum">
          Mama knowledge hub
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold text-plum">Tips & Guides</h1>
        <p className="mx-auto mt-2 max-w-xl text-ink/60">
          Practical pregnancy tips, trimester guides, breastfeeding help, style advice and
          postpartum recovery — written for real mamas.
        </p>
      </div>

      {/* Topic chips */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {GUIDE_TOPICS.map((t) => {
          const active = (tag || "") === t.tag;
          const href = t.tag ? `/blog?tag=${encodeURIComponent(t.tag)}` : "/blog";
          return (
            <Link
              key={t.label}
              href={href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-terracotta text-white"
                  : "border border-blush bg-white text-ink/70 hover:border-terracotta hover:text-terracotta"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-blush bg-white py-20 text-center text-ink/50">
          No guides in this topic yet — try another filter.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-blush bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.coverImage}
                alt={p.title}
                className="aspect-[16/10] w-full object-cover transition group-hover:scale-105"
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex flex-wrap gap-1">
                  {p.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-blush px-2 py-0.5 text-[10px] font-medium capitalize text-plum"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="font-display text-lg font-bold leading-snug text-plum group-hover:text-terracotta">
                  {p.title}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink/60">{p.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-ink/40">
                  <span>By {p.author}</span>
                  <span className="font-semibold text-terracotta group-hover:underline">
                    Read guide →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick tip boxes */}
      <section className="mt-16">
        <h2 className="mb-6 text-center font-display text-2xl font-bold text-plum">
          Quick Tips for Every Stage
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              stage: "1st Trimester",
              tip: "Prioritize rest, loose waistbands, and nausea-friendly snacks. Don’t rush a full maternity wardrobe yet.",
              href: "/blog?tag=1st%20trimester",
            },
            {
              stage: "2nd Trimester",
              tip: "Invest in a good belly band, over-bump leggings, and a stretchy wrap dress you’ll wear on repeat.",
              href: "/blog?tag=2nd%20trimester",
            },
            {
              stage: "3rd Trimester",
              tip: "Focus on comfort: soft bras, support belts, easy nursing tops, and shoes you can slip on.",
              href: "/blog?tag=3rd%20trimester",
            },
            {
              stage: "Postpartum",
              tip: "Pack nursing bras, disposable underwear, a recovery wrap, and button-friendly tops before baby arrives.",
              href: "/blog?tag=postpartum",
            },
          ].map((q) => (
            <Link
              key={q.stage}
              href={q.href}
              className="rounded-2xl border border-blush bg-white p-5 transition hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                {q.stage}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{q.tip}</p>
              <p className="mt-3 text-xs font-semibold text-plum">More tips →</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
