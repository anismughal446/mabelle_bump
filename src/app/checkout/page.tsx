"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Spinner } from "@/components/Skeleton";
import { formatCurrency } from "@/lib/utils";

type CartItem = { id: number; name: string; price: number; image: string; size: string; quantity: number };

export default function CheckoutPage() {
  const { user, loading: authLoading, refreshCart, toast } = useApp();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState<{ type: string; value: number; code: string } | null>(null);
  const [addr, setAddr] = useState({ label: "Home", line1: "", city: "", state: "", zip: "", country: "USA" });

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setLoading(false);
      });
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        const a = d.user?.addresses?.[0];
        if (a) setAddr({ ...a });
      });
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = discount
    ? discount.type === "percent"
      ? subtotal * (discount.value / 100)
      : Math.min(subtotal, discount.value)
    : 0;
  const total = Math.max(0, subtotal - discountAmount);

  async function applyCoupon() {
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon }),
    });
    const d = await res.json();
    if (res.ok) {
      setDiscount({ type: d.coupon.discountType, value: d.coupon.discountValue, code: d.coupon.code });
      toast(`Coupon ${d.coupon.code} applied!`);
    } else {
      toast(d.error, "error");
    }
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setPlacing(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingAddress: { id: "s1", ...addr },
        couponCode: discount?.code || null,
      }),
    });
    const d = await res.json();
    setPlacing(false);
    if (res.ok) {
      await refreshCart();
      toast("Order placed! 🎉");
      router.push(`/order-confirmation?id=${d.order.id}`);
    } else {
      toast(d.error || "Could not place order.", "error");
    }
  }

  if (authLoading || loading) return <Spinner />;
  if (!user) {
    router.push("/login?redirect=/checkout");
    return <Spinner />;
  }
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-5xl">🛍️</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-plum">Your bag is empty</h1>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white">
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-plum">Checkout</h1>
      <form onSubmit={placeOrder} className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-blush bg-white p-6">
            <h2 className="font-display text-lg font-bold text-plum">Shipping address</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input label="Address" value={addr.line1} onChange={(v) => setAddr({ ...addr, line1: v })} required full />
              <Input label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} required />
              <Input label="State" value={addr.state} onChange={(v) => setAddr({ ...addr, state: v })} required />
              <Input label="ZIP" value={addr.zip} onChange={(v) => setAddr({ ...addr, zip: v })} required />
              <Input label="Country" value={addr.country} onChange={(v) => setAddr({ ...addr, country: v })} required />
            </div>
          </section>

          <section className="rounded-2xl border border-blush bg-white p-6">
            <h2 className="font-display text-lg font-bold text-plum">Payment</h2>
            <p className="mt-1 text-xs text-ink/50">Demo checkout — no real card charged (Stripe test mode).</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input label="Card number" value="4242 4242 4242 4242" onChange={() => {}} full />
              <Input label="Expiry" value="12 / 30" onChange={() => {}} />
              <Input label="CVC" value="123" onChange={() => {}} />
            </div>
          </section>
        </div>

        <div className="h-fit rounded-2xl border border-blush bg-white p-6">
          <h2 className="font-display text-lg font-bold text-plum">Order</h2>
          <div className="mt-3 space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-ink/70">
                  {i.name} ×{i.quantity}
                </span>
                <span>{formatCurrency(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon (BUMP15)"
              className="flex-1 rounded-lg border border-blush px-3 py-2 text-sm"
            />
            <button type="button" onClick={applyCoupon} className="rounded-lg bg-plum px-3 text-sm font-semibold text-white">
              Apply
            </button>
          </div>
          <div className="mt-4 space-y-1 border-t border-blush pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount && (
              <div className="flex justify-between text-sage">
                <span>Discount ({discount.code})</span>
                <span>−{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 font-semibold text-plum">
              <span>Total</span>
              <span className="font-display text-lg text-terracotta">{formatCurrency(total)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={placing}
            className="mt-5 w-full rounded-full bg-terracotta py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {placing ? "Placing order..." : `Pay ${formatCurrency(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={full ? "sm:col-span-2" : ""}>
      <span className="mb-1 block text-xs font-medium text-plum">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-blush px-3 py-2 text-sm focus:border-terracotta focus:outline-none"
      />
    </label>
  );
}
