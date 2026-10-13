import { demoCategories, demoProducts, demoBlogPosts } from "./demo-data";

export type DemoProduct = (typeof demoProducts)[number];
export type DemoCategory = (typeof demoCategories)[number];
export type DemoBlogPost = (typeof demoBlogPosts)[number];

export function getDemoProducts(opts?: {
  featured?: boolean;
  categoryId?: number;
  limit?: number;
  slug?: string;
}) {
  let list = [...demoProducts] as DemoProduct[];
  if (opts?.featured) list = list.filter((p) => p.featured);
  if (opts?.categoryId) list = list.filter((p) => p.categoryId === opts.categoryId);
  if (opts?.slug) list = list.filter((p) => p.slug === opts.slug);
  if (opts?.limit) list = list.slice(0, opts.limit);
  return list;
}

export function getDemoCategories() {
  return [...demoCategories] as DemoCategory[];
}

export function getDemoProductBySlug(slug: string) {
  return demoProducts.find((p) => p.slug === slug) ?? null;
}

export function getDemoBlogPosts(tag?: string) {
  let list = [...demoBlogPosts] as DemoBlogPost[];
  if (tag) {
    list = list.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
    );
  }
  return list;
}

export function getDemoBlogPostBySlug(slug: string) {
  return demoBlogPosts.find((p) => p.slug === slug) ?? null;
}
