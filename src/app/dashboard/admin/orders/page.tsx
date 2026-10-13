"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Spinner } from "@/components/Skeleton";
import { formatCurrency } from "@/lib/utils";

type Order = {
  id: number;
  items: { name: string; quantity: number }[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
};

const STATUSES = ["processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const { toast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/orders");
    const d = await res.json();
    setOrders(d.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: number, status: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o))); // optimistic
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast(`Order #${id} → ${status}`);
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-plum">Orders</h1>
      {orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-blush bg-white py-16 text-center text-ink/50">
          No orders yet.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-blush bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-blush text-left text-ink/50">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-blush/50 last:border-0">
                  <td className="p-4">
                    <p className="font-medium text-ink">#{o.id}</p>
                    <p className="text-xs text-ink/50">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-ink">{o.customerName}</p>
                    <p className="text-xs text-ink/50">{o.customerEmail}</p>
                  </td>
                  <td className="p-4 text-ink/70">{o.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                  <td className="p-4 font-semibold text-terracotta">{formatCurrency(o.totalAmount)}</td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="rounded-lg border border-blush px-2 py-1 text-xs capitalize"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
