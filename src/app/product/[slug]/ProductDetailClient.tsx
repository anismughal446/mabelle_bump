"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { Stars } from "@/components/Stars";
import { formatCurrency, cn } from "@/lib/utils";

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  sizes: string[];
  trimesterTags: string[];
  stock: number;
  isRentable: boolean;
  wearItThreeWays: boolean;
  nursingFriendly: boolean;
};

type Review = {
  id: number;
  userName: string;
  rating: number;
  comment: string;
};

export default function ProductDetailClient({
  product,
  initialReviews,
  category,
}: {
  product: Product;
  initialReviews: Review[];
  category: { name: string; slug: string } | null;
}) {
  const { user, refreshCart, refreshWishlist, wishlistIds, toast } = useApp();
  const router = useRouter();
  const [size, setSize] = useState(product.sizes[0] || "M");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const wished = wishlistIds.includes(product.id);

  async function addToCart() {
    if (!user) {
      toast("Please sign in to shop.", "error");
      router.push("/login");
      return;
    }
    setAdding(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, size, quantity: qty }),
    });
    setAdding(false);
    if (res.ok) {
      await refreshCart();
      toast("Added to your bag 🛍️");
    } else {
      const d = await res.json();
      toast(d.error || "Could not add.", "error");
    }
  }

  async function toggleWishlist() {
    if (!user) {
      toast("Sign in to save favorites.", "error");
      return;
    }
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    const d = await res.json();
    await refreshWishlist();
    toast(d.added ? "Saved ♥" : "Removed from wishlist");
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast("Sign in to leave a review.", "error");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, rating, comment }),
    });
    setSubmitting(false);
    if (res.ok) {
      const d = await res.json();
      setReviews([d.review, ...reviews]);
      setComment("");
      toast("Thanks for your review!");
    } else {
      toast("Could not submit review.", "error");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="mb-6 text-sm text-ink/50">
        <Link href="/shop" className="hover:text-terracotta">
          Shop
        </Link>
        {category && (
          <>
            {" / "}
            <Link href={`/shop?category=${category.slug}`} className="hover:text-terracotta">
              {category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-ink/80">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/5] w-full rounded-2xl object-cover shadow"
          />
          <div className="absolute left-4 top-4 flex flex-col gap-1">
            {product.wearItThreeWays && (
              <span className="rounded-full bg-sage px-3 py-1 text-xs font-semibold text-white">
                Wear it 3 Ways
              </span>
            )}
            {product.isRentable && (
              <span className="rounded-full bg-plum px-3 py-1 text-xs font-semibold text-white">
                Available to Rent
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap gap-1">
            {product.trimesterTags.map((t) => (
              <span key={t} className="rounded-full bg-blush px-2 py-0.5 text-xs font-medium text-plum">
                {t === "postpartum" ? "Postpartum" : `${t} Trimester`}
              </span>
            ))}
          </div>
          <h1 className="font-display text-3xl font-bold text-plum">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Stars value={avgRating} />
            <span className="text-sm text-ink/50">
              {reviews.length ? `${avgRating.toFixed(1)} (${reviews.length})` : "No reviews yet"}
            </span>
          </div>
<div className="mt-4 flex items-center gap-3">
            <p className="font-display text-3xl font-bold text-terracotta">
              {formatCurrency(product.price)}
            </p>
            {!!product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <p className="text-xl text-ink/40 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </p>
                <span className="rounded-full bg-terracotta/10 px-2.5 py-1 text-xs font-bold text-terracotta">
                  Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                </span>
              </>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">{product.description}</p>

          {product.nursingFriendly && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-sage/15 px-3 py-2 text-sm text-sage">
              🤱 Nursing-friendly design
            </p>
          )}

          {/* size */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-plum">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "h-10 w-12 rounded-lg border text-sm font-semibold",
                    size === s ? "border-terracotta bg-terracotta text-white" : "border-blush bg-white",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-terracotta">Size guide</summary>
              <div className="mt-2 rounded-lg bg-blush/40 p-3 text-xs text-ink/70">
                Our maternity sizing is designed to grow with you. If between sizes, size down —
                the stretch fabric accommodates your bump through the third trimester.
              </div>
            </details>
          </div>

          {/* qty */}
          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-blush">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2 text-lg">
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2 text-lg">
                +
              </button>
            </div>
            <span className={cn("text-sm", product.stock > 0 ? "text-sage" : "text-terracotta")}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={addToCart}
              disabled={adding || product.stock === 0}
              className="flex-1 rounded-full bg-terracotta py-3 text-sm font-semibold text-white transition hover:bg-terracotta/90 disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add to Bag"}
            </button>
            <button
              onClick={toggleWishlist}
              className={cn(
                "rounded-full border px-5 text-lg",
                wished ? "border-terracotta bg-terracotta text-white" : "border-blush bg-white",
              )}
            >
              {wished ? "♥" : "♡"}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-plum">Reviews</h2>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          <form onSubmit={submitReview} className="rounded-2xl border border-blush bg-white p-5">
            <p className="text-sm font-semibold text-plum">Leave a review</p>
            <div className="mt-3 flex gap-1 text-2xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  className={n <= rating ? "text-terracotta" : "text-ink/20"}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did it fit? Would you recommend it?"
              required
              rows={4}
              className="mt-3 w-full rounded-lg border border-blush p-3 text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-3 w-full rounded-full bg-plum py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Review"}
            </button>
          </form>

          <div className="md:col-span-2">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-blush bg-white py-12 text-center text-ink/50">
                Be the first to review this piece ✍️
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-blush bg-white p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-ink">{r.userName}</p>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-2 text-sm text-ink/70">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
