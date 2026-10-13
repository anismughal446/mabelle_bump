"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/Skeleton";
import { formatCurrency } from "@/lib/utils";

type Stats = {
  revenue: number;
  orderCount: number;
  productCount: number;
  userCount: number;
  vendorCount: number;
  byMonth: Record<string, number>;
  statusCounts: Record<string, number>;
};

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d));
  }, []);

  if (!stats) return <Spinner />;

  const months = Object.entries(stats.byMonth);
  const maxMonth = Math.max(1, ...months.map(([, v]) => v));

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-plum">Dashboard</h1>
      <p className="mt-1 text-ink/60">A snapshot of your store.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total revenue" value={formatCurrency(stats.revenue)} icon="💰" />
        <Stat label="Orders" value={String(stats.orderCount)} icon="📦" />
        <Stat label="Products" value={String(stats.productCount)} icon="👗" />
        <Stat label="Customers & vendors" value={String(stats.userCount)} icon="👥" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-blush bg-white p-6">
          <h2 className="font-display text-lg font-bold text-plum">Revenue by month</h2>
          {months.length === 0 ? (
            <p className="mt-6 text-sm text-ink/50">No sales data yet.</p>
          ) : (
            <div className="mt-6 flex items-end gap-3" style={{ height: 180 }}>
              {months.map(([m, v]) => (
                <div key={m} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-terracotta transition-all"
                    style={{ height: `${(v / maxMonth) * 140}px` }}
                    title={formatCurrency(v)}
                  />
                  <span className="text-xs text-ink/50">{m}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-blush bg-white p-6">
          <h2 className="font-display text-lg font-bold text-plum">Orders by status</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.statusCounts).length === 0 && (
              <p className="text-sm text-ink/50">No orders yet.</p>
            )}
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-ink/70">{status}</span>
                  <span className="font-semibold text-plum">{count}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-blush">
                  <div
                    className="h-full rounded-full bg-sage"
                    style={{ width: `${(count / stats.orderCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
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
