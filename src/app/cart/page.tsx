"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Spinner } from "@/components/Skeleton";
import { formatCurrency } from "@/lib/utils";

type CartItem = {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  slug: string;
};

export default function CartPage() {
  const { user, loading: authLoading, refreshCart, toast } = useApp();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQty(id: number, quantity: number) {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i))); // optimistic
    await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    refreshCart();
  }

  async function remove(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id)); // optimistic
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    refreshCart();
    toast("Removed from bag");
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (authLoading || loading) return <Spinner />;

  if (!user) {
    return (
      <EmptyState
        emoji="🔒"
        title="Sign in to view your bag"
        cta="Sign in"
        href="/login?redirect=/cart"
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState emoji="🛍️" title="Your bag is empty" cta="Start shopping" href="/shop" />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-plum">Your Bag</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((i) => (
            <div key={i.id} className="flex gap-4 rounded-2xl border border-blush bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.image} alt={i.name} className="h-24 w-20 rounded-lg object-cover" />
              <div className="flex flex-1 flex-col">
                <Link href={`/product/${i.slug}`} className="font-semibold text-ink hover:text-terracotta">
                  {i.name}
                </Link>
                <p className="text-sm text-ink/50">Size {i.size}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-blush">
                    <button onClick={() => updateQty(i.id, i.quantity - 1)} className="px-3 py-1">−</button>
                    <span className="w-6 text-center text-sm">{i.quantity}</span>
                    <button onClick={() => updateQty(i.id, i.quantity + 1)} className="px-3 py-1">+</button>
                  </div>
                  <p className="font-display font-bold text-terracotta">
                    {formatCurrency(i.price * i.quantity)}
                  </p>
                </div>
              </div>
              <button onClick={() => remove(i.id)} className="self-start text-ink/40 hover:text-terracotta">
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-blush bg-white p-6">
          <h2 className="font-display text-xl font-bold text-plum">Summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-ink/60">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-ink/60">Shipping</span>
            <span className="text-sage">Free</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-blush pt-4">
            <span className="font-semibold text-plum">Total</span>
            <span className="font-display text-xl font-bold text-terracotta">{formatCurrency(subtotal)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-5 block rounded-full bg-terracotta py-3 text-center text-sm font-semibold text-white"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  emoji,
  title,
  cta,
  href,
}: {
  emoji: string;
  title: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-5xl">{emoji}</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-plum">{title}</h1>
      <Link
        href={href}
        className="mt-6 inline-block rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white"
      >
        {cta}
      </Link>
    </div>
  );
}
