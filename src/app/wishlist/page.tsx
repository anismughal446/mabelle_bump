"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import ProductCard, { ProductSummary } from "@/components/ProductCard";
import { Spinner } from "@/components/Skeleton";

export default function WishlistPage() {
  const { user, loading: authLoading } = useApp();
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((d) => {
        setItems((d.items || []).map((i: ProductSummary & { productId: number }) => ({ ...i, id: i.productId })));
        setLoading(false);
      });
  }, []);

  if (authLoading || loading) return <Spinner />;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-5xl">♡</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-plum">Sign in to see your wishlist</h1>
        <Link href="/login?redirect=/wishlist" className="mt-6 inline-block rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-plum">Your Wishlist</h1>
      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-blush bg-white py-20 text-center">
          <p className="text-4xl">♡</p>
          <p className="mt-3 font-display text-xl text-plum">Nothing saved yet</p>
          <p className="mt-1 text-sm text-ink/60">Tap the heart on any piece to save it here.</p>
          <Link href="/shop" className="mt-4 inline-block rounded-full bg-terracotta px-5 py-2 text-sm font-semibold text-white">
            Browse pieces
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
