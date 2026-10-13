import { notFound } from "next/navigation";
import Link from "next/link";
import { db, isDemoMode } from "@/db";
import { getDemoBlogPostBySlug, getDemoBlogPosts } from "@/db/demo";
import { blogPosts } from "@/db/schema";
import { eq, desc, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: any;
  let related: any[];

  if (isDemoMode) {
    post = getDemoBlogPostBySlug(slug);
    if (!post) notFound();
    related = getDemoBlogPosts().filter((p) => p.id !== post.id).slice(0, 3);
  } else {
    post = (await db!.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1))[0];
    if (!post) notFound();
    related = await db!
      .select()
      .from(blogPosts)
      .where(ne(blogPosts.id, post.id))
      .orderBy(desc(blogPosts.createdAt))
      .limit(3);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm font-medium text-terracotta hover:underline">
          ← Back to Tips & Guides
        </Link>

        <div className="mt-4 flex flex-wrap gap-1">
          {(post.tags || []).map((t: string) => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              className="rounded-full bg-blush px-2.5 py-0.5 text-xs font-medium capitalize text-plum hover:bg-terracotta/15"
            >
              {t}
            </Link>
          ))}
        </div>

        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-plum sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-2 text-sm text-ink/50">
          By {post.author || "Mabelle Team"} ·{" "}
          {new Date(post.createdAt).toLocaleDateString()} · Tips & Guides
        </p>

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover shadow-sm"
          />
        )}

        <p className="mt-6 rounded-2xl border border-blush bg-blush/30 p-4 text-sm font-medium leading-relaxed text-plum">
          {post.excerpt}
        </p>

        <div className="mt-8 space-y-4">
          {String(post.content || "")
            .split("\n\n")
            .map((para: string, i: number) => {
              if (para.includes("\n•") || para.trim().startsWith("•")) {
                const lines = para.split("\n").filter(Boolean);
                const titleLine = lines[0].startsWith("•") ? null : lines[0];
                const bullets = lines.filter((l) => l.trim().startsWith("•"));
                return (
                  <div key={i}>
                    {titleLine && <p className="mb-2 font-semibold text-plum">{titleLine}</p>}
                    <ul className="space-y-1.5 pl-1">
                      {bullets.map((b, j) => (
                        <li key={j} className="flex gap-2 text-ink/80">
                          <span className="text-terracotta">•</span>
                          <span>{b.replace(/^•\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              if (/\n\d+\./.test(para) || /^\d+\./.test(para.trim())) {
                const lines = para.split("\n").filter(Boolean);
                const titleLine = /^\d+\./.test(lines[0]) ? null : lines[0];
                const items = lines.filter((l) => /^\d+\./.test(l.trim()));
                return (
                  <div key={i}>
                    {titleLine && <p className="mb-2 font-semibold text-plum">{titleLine}</p>}
                    <ol className="list-decimal space-y-1.5 pl-5 text-ink/80">
                      {items.map((b, j) => (
                        <li key={j}>{b.replace(/^\d+\.\s*/, "")}</li>
                      ))}
                    </ol>
                  </div>
                );
              }
              return (
                <p key={i} className="leading-relaxed text-ink/80">
                  {para}
                </p>
              );
            })}
        </div>

        <div className="mt-10 rounded-2xl border border-blush bg-white p-6 text-center">
          <p className="font-display text-xl font-bold text-plum">Need pieces for this stage?</p>
          <p className="mt-1 text-sm text-ink/60">Shop maternity essentials chosen for real life.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-white"
          >
            Shop Clothes
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-plum">More Tips & Guides</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {related.map((r: any) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="rounded-2xl border border-blush bg-white p-4 transition hover:shadow-md"
              >
                {r.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.coverImage}
                    alt={r.title}
                    className="aspect-[16/10] w-full rounded-xl object-cover"
                  />
                )}
                <p className="mt-3 font-display font-bold text-plum">{r.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-ink/60">{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
