"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/Skeleton";
import { formatCurrency } from "@/lib/utils";

type Order = {
  id: number;
  items: { name: string; quantity: number; size: string; price: number }[];
  status: string;
  vendorTotal: number;
  createdAt: string;
  shippingAddress: { city: string; state: string };
};

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/orders")
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-plum">Orders</h1>
      <p className="mt-1 text-ink/60">Orders that include your products.</p>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-blush bg-white py-16 text-center">
          <p className="text-4xl">📦</p>
          <p className="mt-3 font-display text-xl text-plum">No orders yet</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-blush bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-plum">Order #{o.id}</p>
                  <p className="text-xs text-ink/50">
                    {new Date(o.createdAt).toLocaleDateString()} · Ships to {o.shippingAddress.city}, {o.shippingAddress.state}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-blush px-3 py-1 text-xs font-semibold capitalize text-plum">{o.status}</span>
                  <p className="mt-1 font-display font-bold text-terracotta">{formatCurrency(o.vendorTotal)}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 border-t border-blush pt-3 text-sm text-ink/70">
                {o.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {it.name} (Size {it.size}) ×{it.quantity}
                    </span>
                    <span>{formatCurrency(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
