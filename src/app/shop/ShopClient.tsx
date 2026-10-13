"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard, { ProductSummary } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { TRIMESTERS, OCCASIONS, SIZES, cn } from "@/lib/utils";

type Category = { id: number; name: string; slug: string };

export default function ShopClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const trimester = params.get("trimester") || "";
  const category = params.get("category") || "";
  const occasion = params.get("occasion") || "";
  const size = params.get("size") || "";
  const sort = params.get("sort") || "newest";
  const search = params.get("search") || "";
  const page = parseInt(params.get("page") || "1", 10);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      router.push(`/shop?${next.toString()}`);
    },
    [params, router],
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (trimester) qs.set("trimester", trimester);
    if (category) qs.set("category", category);
    if (occasion) qs.set("occasion", occasion);
    if (size) qs.set("size", size);
    if (sort) qs.set("sort", sort);
    if (search) qs.set("search", search);
    qs.set("page", String(page));
    fetch(`/api/products?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setLoading(false);
      });
  }, [trimester, category, occasion, size, sort, search, page]);

  const hasFilters = trimester || category || occasion || size || search;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-plum">Shop All</h1>
          <p className="text-sm text-ink/60">{total} pieces found</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="rounded-full border border-blush bg-white px-4 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="rounded-full border border-blush bg-white px-4 py-2 text-sm font-medium md:hidden"
          >
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={cn("w-56 shrink-0 md:block", filtersOpen ? "block" : "hidden")}>
          <FilterGroup title="Trimester">
            {TRIMESTERS.map((t) => (
              <Chip key={t.key} active={trimester === t.key} onClick={() => setParam("trimester", trimester === t.key ? "" : t.key)}>
                {t.label}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup title="Category">
            {categories.map((c) => (
              <Chip key={c.id} active={category === c.slug} onClick={() => setParam("category", category === c.slug ? "" : c.slug)}>
                {c.name}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup title="Occasion">
            {OCCASIONS.map((o) => (
              <Chip key={o} active={occasion === o} onClick={() => setParam("occasion", occasion === o ? "" : o)}>
                <span className="capitalize">{o}</span>
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup title="Size">
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setParam("size", size === s ? "" : s)}
                  className={cn(
                    "h-9 w-9 rounded-full border text-xs font-semibold",
                    size === s ? "border-terracotta bg-terracotta text-white" : "border-blush bg-white text-ink/70",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </FilterGroup>
          {hasFilters && (
            <button
              onClick={() => router.push("/shop")}
              className="mt-2 text-sm font-medium text-terracotta hover:underline"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-blush bg-white py-20 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 font-display text-xl text-plum">No pieces match your filters</p>
              <p className="mt-1 text-sm text-ink/60">Try clearing a filter or two.</p>
              <button
                onClick={() => router.push("/shop")}
                className="mt-4 rounded-full bg-terracotta px-5 py-2 text-sm font-semibold text-white"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setParam("page", String(i + 1))}
                      className={cn(
                        "h-9 w-9 rounded-full text-sm font-semibold",
                        page === i + 1 ? "bg-terracotta text-white" : "bg-white text-ink/70 border border-blush",
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 border-b border-blush/60 pb-4">
      <p className="mb-2 text-sm font-semibold text-plum">{title}</p>
      <div className="flex flex-col items-start gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left text-sm transition",
        active ? "font-semibold text-terracotta" : "text-ink/70 hover:text-terracotta",
      )}
    >
      {active ? "● " : "○ "}
      {children}
    </button>
  );
}
