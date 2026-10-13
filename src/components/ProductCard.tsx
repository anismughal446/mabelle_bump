"use client";

import Link from "next/link";
import { useApp } from "./AppProvider";
import { formatCurrency } from "@/lib/utils";

export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  trimesterTags?: string[];
  wearItThreeWays?: boolean;
  nursingFriendly?: boolean;
  isRentable?: boolean;
};

export default function ProductCard({ product }: { product: ProductSummary }) {
  const { wishlistIds, refreshWishlist, toast, user } = useApp();
  const wished = wishlistIds.includes(product.id);
  const onSale = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = onSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      toast("Sign in to save favorites.", "error");
      return;
    }
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    const data = await res.json();
    await refreshWishlist();
    toast(data.added ? "Saved to wishlist ♡" : "Removed from wishlist");
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-blush/60 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-blush/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <button
          onClick={toggleWishlist}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-lg shadow ${
            wished ? "bg-terracotta text-white" : "bg-white/90 text-ink/70"
          }`}
          aria-label="Wishlist"
        >
          {wished ? "♥" : "♡"}
        </button>
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {onSale && (
            <span className="rounded-full bg-terracotta px-2 py-0.5 text-[10px] font-bold text-white shadow">
              -{discountPct}%
            </span>
          )}
          {product.wearItThreeWays && (
            <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-semibold text-white">
              Wear it 3 Ways
            </span>
          )}
          {product.isRentable && (
            <span className="rounded-full bg-plum px-2 py-0.5 text-[10px] font-semibold text-white">
              Rentable
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 text-center">
        <div className="mb-2 flex flex-wrap justify-center gap-1">
          {(product.trimesterTags || []).slice(0, 2).map((t) => (
            <span key={t} className="rounded bg-blush px-1.5 py-0.5 text-[10px] font-medium text-plum">
              {t === "postpartum" ? "Postpartum" : `${t} Tri`}
            </span>
          ))}
        </div>
        {/* Product name shown clearly under the image */}
        <h3 className="font-display text-base font-bold leading-snug text-ink group-hover:text-terracotta">
          {product.name}
        </h3>
        <div className="mt-3 flex items-center justify-center gap-2 pt-1">
          <p className="font-display text-lg font-bold text-terracotta">
            {formatCurrency(product.price)}
          </p>
          {onSale && (
            <p className="text-sm text-ink/40 line-through">{formatCurrency(product.compareAtPrice!)}</p>
          )}
        </div>
        {product.nursingFriendly && (
          <span className="mt-1 text-[11px] text-sage">🤱 Nursing-friendly</span>
        )}
      </div>
    </Link>
  );
}
