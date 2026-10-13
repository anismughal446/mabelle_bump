"use client";

import { useEffect, useState } from "react";
import { TRIMESTERS, OCCASIONS, SIZES, cn } from "@/lib/utils";

type Category = { id: number; name: string };

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  image: string;
  categoryId: string;
  trimesterTags: string[];
  sizes: string[];
  occasion: string;
  stock: string;
  isRentable: boolean;
  wearItThreeWays: boolean;
  nursingFriendly: boolean;
  featured: boolean;
};

const DEFAULT: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  image: "https://images.pexels.com/photos/9603625/pexels-photo-9603625.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  categoryId: "",
  trimesterTags: [],
  sizes: ["S", "M", "L"],
  occasion: "everyday",
  stock: "10",
  isRentable: false,
  wearItThreeWays: false,
  nursingFriendly: false,
  featured: false,
};

export default function ProductForm({
  initial,
  onSubmit,
  onCancel,
  showFeatured,
  submitLabel = "Save product",
}: {
  initial?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  showFeatured?: boolean;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<ProductFormValues>({ ...DEFAULT, ...initial });
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  function toggle(field: "trimesterTags" | "sizes", val: string) {
    setValues((v) => {
      const arr = v[field].includes(val) ? v[field].filter((x) => x !== val) : [...v[field], val];
      return { ...v, [field]: arr };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSubmit(values);
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Name" value={values.name} onChange={(v) => setValues({ ...values, name: v })} required />
        <Field label="Price ($)" type="number" value={values.price} onChange={(v) => setValues({ ...values, price: v })} required />
        <Field
          label="Compare-at ($) — optional"
          type="number"
          value={values.compareAtPrice}
          onChange={(v) => setValues({ ...values, compareAtPrice: v })}
        />
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-plum">Description</span>
        <textarea
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          required
          rows={3}
          className="w-full rounded-lg border border-blush px-3 py-2 text-sm"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Image URL" value={values.image} onChange={(v) => setValues({ ...values, image: v })} />
        <Field label="Stock" type="number" value={values.stock} onChange={(v) => setValues({ ...values, stock: v })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-plum">Category</span>
          <select
            value={values.categoryId}
            onChange={(e) => setValues({ ...values, categoryId: e.target.value })}
            className="w-full rounded-lg border border-blush px-3 py-2 text-sm"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-plum">Occasion</span>
          <select
            value={values.occasion}
            onChange={(e) => setValues({ ...values, occasion: e.target.value })}
            className="w-full rounded-lg border border-blush px-3 py-2 text-sm capitalize"
          >
            {OCCASIONS.map((o) => (
              <option key={o} value={o} className="capitalize">
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-plum">Trimester tags</span>
        <div className="flex flex-wrap gap-2">
          {TRIMESTERS.map((t) => (
            <Pill key={t.key} active={values.trimesterTags.includes(t.key)} onClick={() => toggle("trimesterTags", t.key)}>
              {t.label}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-plum">Sizes</span>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <Pill key={s} active={values.sizes.includes(s)} onClick={() => toggle("sizes", s)}>
              {s}
            </Pill>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Check label="Rentable" checked={values.isRentable} onChange={(v) => setValues({ ...values, isRentable: v })} />
        <Check label="Wear it 3 ways" checked={values.wearItThreeWays} onChange={(v) => setValues({ ...values, wearItThreeWays: v })} />
        <Check label="Nursing-friendly" checked={values.nursingFriendly} onChange={(v) => setValues({ ...values, nursingFriendly: v })} />
        {showFeatured && (
          <Check label="Featured" checked={values.featured} onChange={(v) => setValues({ ...values, featured: v })} />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? "Saving..." : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-plum/30 px-6 py-2.5 text-sm font-semibold text-plum">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-plum">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-blush px-3 py-2 text-sm focus:border-terracotta focus:outline-none"
      />
    </label>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold",
        active ? "border-terracotta bg-terracotta text-white" : "border-blush bg-white text-ink/70",
      )}
    >
      {children}
    </button>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink/70">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-terracotta" />
      {label}
    </label>
  );
}
