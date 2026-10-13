"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Spinner } from "@/components/Skeleton";

type Coupon = { id: number; code: string; discountType: string; discountValue: number; active: boolean };

export default function AdminCoupons() {
  const { toast } = useApp();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");

  async function load() {
    const res = await fetch("/api/admin/coupons");
    const d = await res.json();
    setCoupons(d.coupons || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, discountType, discountValue }),
    });
    if (res.ok) {
      setCode("");
      setDiscountValue("");
      load();
      toast("Coupon created");
    } else {
      toast("Could not create coupon.", "error");
    }
  }

  async function remove(id: number) {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    toast("Coupon deleted");
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-plum">Coupons</h1>

      <form onSubmit={add} className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-blush bg-white p-5">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-plum">Code</span>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="SPRING20" className="rounded-lg border border-blush px-3 py-2 text-sm uppercase" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-plum">Type</span>
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="rounded-lg border border-blush px-3 py-2 text-sm">
            <option value="percent">Percent %</option>
            <option value="fixed">Fixed $</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-plum">Value</span>
          <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required className="w-24 rounded-lg border border-blush px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white">
          Add coupon
        </button>
      </form>

      {coupons.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-blush bg-white py-12 text-center text-ink/50">
          No coupons yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-2xl border border-blush bg-white p-4">
              <div>
                <p className="font-display text-lg font-bold text-plum">{c.code}</p>
                <p className="text-sm text-terracotta">
                  {c.discountType === "percent" ? `${c.discountValue}% off` : `$${c.discountValue} off`}
                </p>
              </div>
              <button onClick={() => remove(c.id)} className="text-xs text-terracotta hover:underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
