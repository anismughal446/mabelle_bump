"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Spinner } from "@/components/Skeleton";
import { formatCurrency, cn, trimesterFromDueDate, TRIMESTERS } from "@/lib/utils";

type OrderItem = { name: string; image: string; price: number; size: string; quantity: number };
type Order = {
  id: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: { line1: string; city: string; state: string; zip: string };
};
type Address = { id: string; label: string; line1: string; city: string; state: string; zip: string; country: string };

const STATUS_STEPS = ["processing", "shipped", "delivered"];

export default function AccountPage() {
  const { user, loading: authLoading, refreshUser, toast } = useApp();
  const [tab, setTab] = useState<"orders" | "profile" | "addresses">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddr, setNewAddr] = useState({ label: "Home", line1: "", city: "", state: "", zip: "", country: "USA" });

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setLoading(false);
      });
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setName(d.user.name);
          setDueDate(d.user.dueDate || "");
          setAddresses(d.user.addresses || []);
        }
      });
  }, []);

  async function saveProfile() {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, dueDate: dueDate || null }),
    });
    if (res.ok) {
      await refreshUser();
      toast("Profile updated");
    }
  }

  async function addAddress() {
    if (!newAddr.line1) return;
    const next = [...addresses, { ...newAddr, id: `a${Date.now()}` }];
    setAddresses(next);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: next }),
    });
    setNewAddr({ label: "Home", line1: "", city: "", state: "", zip: "", country: "USA" });
    toast("Address saved");
  }

  async function removeAddress(id: string) {
    const next = addresses.filter((a) => a.id !== id);
    setAddresses(next);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: next }),
    });
  }

  if (authLoading || loading) return <Spinner />;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-plum">Sign in to view your account</h1>
        <Link href="/login?redirect=/account" className="mt-6 inline-block rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  const currentTrimester = trimesterFromDueDate(dueDate);
  const trimesterLabel = TRIMESTERS.find((t) => t.key === currentTrimester)?.label;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-plum">Hi, {user.name.split(" ")[0]} 👋</h1>
      {trimesterLabel && (
        <p className="mt-1 text-ink/60">
          You&apos;re in your <span className="font-semibold text-terracotta">{trimesterLabel}</span> —{" "}
          <Link href={`/shop?trimester=${currentTrimester}`} className="underline">shop your stage</Link>.
        </p>
      )}

      <div className="mt-6 flex gap-2 border-b border-blush">
        {(["orders", "profile", "addresses"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize",
              tab === t ? "border-b-2 border-terracotta text-terracotta" : "text-ink/60",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "orders" && (
          orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-blush bg-white py-16 text-center">
              <p className="text-4xl">📦</p>
              <p className="mt-3 font-display text-xl text-plum">No orders yet</p>
              <Link href="/shop" className="mt-4 inline-block rounded-full bg-terracotta px-5 py-2 text-sm font-semibold text-white">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-blush bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-plum">Order #{o.id}</p>
                      <p className="text-xs text-ink/50">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="font-display font-bold text-terracotta">{formatCurrency(o.totalAmount)}</p>
                  </div>

                  {/* status tracker */}
                  {o.status !== "cancelled" ? (
                    <div className="mt-4 flex items-center">
                      {STATUS_STEPS.map((s, i) => {
                        const active = STATUS_STEPS.indexOf(o.status) >= i;
                        return (
                          <div key={s} className="flex flex-1 items-center last:flex-none">
                            <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs", active ? "bg-sage text-white" : "bg-blush text-ink/40")}>
                              {active ? "✓" : i + 1}
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={cn("h-0.5 flex-1", active ? "bg-sage" : "bg-blush")} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-terracotta">Cancelled</p>
                  )}
                  <p className="mt-2 text-xs capitalize text-ink/60">Status: {o.status}</p>

                  <div className="mt-4 flex gap-2 overflow-x-auto">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex shrink-0 items-center gap-2 rounded-lg bg-blush/30 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.image} alt={it.name} className="h-12 w-10 rounded object-cover" />
                        <div className="text-xs">
                          <p className="font-medium text-ink">{it.name}</p>
                          <p className="text-ink/50">Size {it.size} · ×{it.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "profile" && (
          <div className="max-w-md space-y-4 rounded-2xl border border-blush bg-white p-6">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-plum">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-blush px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-plum">Email</span>
              <input value={user.email} disabled className="w-full rounded-lg border border-blush bg-blush/20 px-3 py-2 text-sm text-ink/50" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-plum">Due date</span>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-lg border border-blush px-3 py-2 text-sm" />
            </label>
            <button onClick={saveProfile} className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-white">
              Save changes
            </button>
          </div>
        )}

        {tab === "addresses" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              {addresses.length === 0 && <p className="text-sm text-ink/50">No saved addresses yet.</p>}
              {addresses.map((a) => (
                <div key={a.id} className="rounded-2xl border border-blush bg-white p-4">
                  <div className="flex justify-between">
                    <p className="font-semibold text-plum">{a.label}</p>
                    <button onClick={() => removeAddress(a.id)} className="text-xs text-terracotta">Remove</button>
                  </div>
                  <p className="mt-1 text-sm text-ink/60">
                    {a.line1}, {a.city}, {a.state} {a.zip}, {a.country}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-fit rounded-2xl border border-blush bg-white p-5">
              <p className="mb-3 text-sm font-semibold text-plum">Add an address</p>
              <div className="space-y-2">
                <input placeholder="Label" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} className="w-full rounded-lg border border-blush px-3 py-2 text-sm" />
                <input placeholder="Address" value={newAddr.line1} onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })} className="w-full rounded-lg border border-blush px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <input placeholder="City" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className="w-full rounded-lg border border-blush px-3 py-2 text-sm" />
                  <input placeholder="State" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} className="w-24 rounded-lg border border-blush px-3 py-2 text-sm" />
                </div>
                <input placeholder="ZIP" value={newAddr.zip} onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })} className="w-full rounded-lg border border-blush px-3 py-2 text-sm" />
                <button onClick={addAddress} className="w-full rounded-full bg-plum py-2 text-sm font-semibold text-white">
                  Add address
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
