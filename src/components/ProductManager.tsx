"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "./AppProvider";
import ProductForm, { ProductFormValues } from "./ProductForm";
import { Spinner } from "./Skeleton";
import { formatCurrency } from "@/lib/utils";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  stock: number;
  categoryId: number | null;
  description: string;
  trimesterTags: string[];
  sizes: string[];
  occasion: string;
  isRentable: boolean;
  wearItThreeWays: boolean;
  nursingFriendly: boolean;
  featured: boolean;
};

export default function ProductManager({
  scope,
  vendorId,
}: {
  scope: "admin" | "vendor";
  vendorId?: number;
}) {
  const { toast } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = vendorId ? `?vendorId=${vendorId}&limit=48` : "?limit=48";
    const res = await fetch(`/api/products${qs}`);
    const d = await res.json();
    setProducts(d.products || []);
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(values: ProductFormValues) {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      toast("Product added");
      setShowForm(false);
      load();
    } else {
      toast("Could not add product.", "error");
    }
  }

  async function update(values: ProductFormValues) {
    if (!editing) return;
    const res = await fetch(`/api/products/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      toast("Product updated");
      setEditing(null);
      load();
    } else {
      toast("Could not update.", "error");
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id)); // optimistic
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) toast("Product deleted");
    else {
      toast("Could not delete.", "error");
      load();
    }
  }

  if (loading) return <Spinner />;

  if (showForm || editing) {
    const p = editing;
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-plum">
          {editing ? "Edit product" : "Add product"}
        </h1>
        <div className="mt-5 rounded-2xl border border-blush bg-white p-6">
          <ProductForm
            showFeatured={scope === "admin"}
            submitLabel={editing ? "Update product" : "Add product"}
            initial={
              p
                ? {
                    name: p.name,
                    description: p.description,
                    price: String(p.price),
                    compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
                    image: p.image,
                    categoryId: p.categoryId ? String(p.categoryId) : "",
                    trimesterTags: p.trimesterTags,
                    sizes: p.sizes,
                    occasion: p.occasion,
                    stock: String(p.stock),
                    isRentable: p.isRentable,
                    wearItThreeWays: p.wearItThreeWays,
                    nursingFriendly: p.nursingFriendly,
                    featured: p.featured,
                  }
                : undefined
            }
            onSubmit={editing ? update : create}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-plum">Products</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Add product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-blush bg-white py-16 text-center">
          <p className="text-4xl">👗</p>
          <p className="mt-3 font-display text-xl text-plum">No products yet</p>
          <button onClick={() => setShowForm(true)} className="mt-4 rounded-full bg-terracotta px-5 py-2 text-sm font-semibold text-white">
            Add your first product
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-blush bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-blush text-left text-ink/50">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Tags</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-blush/50 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name} className="h-12 w-10 rounded object-cover" />
                      <span className="font-medium text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4">{formatCurrency(p.price)}</td>
                  <td className="p-4">
                    <span className={p.stock > 0 ? "text-sage" : "text-terracotta"}>{p.stock}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {p.trimesterTags.map((t) => (
                        <span key={t} className="rounded bg-blush px-1.5 py-0.5 text-[10px] text-plum">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setEditing(p)} className="mr-2 text-plum hover:underline">
                      Edit
                    </button>
                    <button onClick={() => remove(p.id)} className="text-terracotta hover:underline">
                      Delete
                    </button>
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
