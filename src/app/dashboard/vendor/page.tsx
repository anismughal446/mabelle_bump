"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { formatCurrency } from "@/lib/utils";

export default function VendorOverview() {
  const { user } = useApp();
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/products?vendorId=${user.id}&limit=48`)
      .then((r) => r.json())
      .then((d) => setProductCount(d.total || 0));
    fetch("/api/vendor/orders")
      .then((r) => r.json())
      .then((d) => {
        const orders = d.orders || [];
        setOrderCount(orders.length);
        setRevenue(orders.reduce((s: number, o: { vendorTotal: number }) => s + o.vendorTotal, 0));
      });
  }, [user]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-plum">Vendor Overview</h1>
      <p className="mt-1 text-ink/60">Welcome back, {user?.name}.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Products listed" value={String(productCount)} icon="👗" />
        <Stat label="Orders received" value={String(orderCount)} icon="📦" />
        <Stat label="Revenue (est.)" value={formatCurrency(revenue)} icon="💰" />
      </div>

      <div className="mt-8 rounded-2xl border border-blush bg-white p-6">
        <h2 className="font-display text-lg font-bold text-plum">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/dashboard/vendor/products" className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white">
            + Add a product
          </Link>
          <Link href="/dashboard/vendor/orders" className="rounded-full border border-plum/30 px-5 py-2.5 text-sm font-semibold text-plum">
            View orders
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-blush bg-white p-5">
      <div className="text-2xl">{icon}</div>
      <p className="mt-2 font-display text-2xl font-bold text-plum">{value}</p>
      <p className="text-sm text-ink/60">{label}</p>
    </div>
  );
}
