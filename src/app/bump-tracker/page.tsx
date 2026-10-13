"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Spinner } from "@/components/Skeleton";

type Entry = {
  id: number;
  weekNumber: number;
  imageUrl: string;
  note: string | null;
  entryDate: string;
};

export default function BumpTrackerPage() {
  const { user, loading: authLoading, toast } = useApp();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/bump");
    const d = await res.json();
    setEntries(d.entries || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      toast("Please pick an image under 2MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!image || !week) {
      toast("Add a week number and photo.", "error");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/bump", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekNumber: week, imageUrl: image, note }),
    });
    setSaving(false);
    if (res.ok) {
      setWeek("");
      setNote("");
      setImage("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
      toast("Bump entry saved! 📸");
    } else {
      toast("Could not save entry.", "error");
    }
  }

  async function remove(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/bump/${id}`, { method: "DELETE" });
    toast("Entry removed");
  }

  if (authLoading || loading) return <Spinner />;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-5xl">📸</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-plum">Sign in to track your bump</h1>
        <p className="mt-2 text-sm text-ink/60">Upload a weekly photo and watch your journey unfold.</p>
        <Link href="/login?redirect=/bump-tracker" className="mt-6 inline-block rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-plum">Bump Growth Tracker</h1>
        <p className="mt-1 text-ink/60">Capture a weekly photo and build your pregnancy timeline.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={addEntry} className="h-fit rounded-2xl border border-blush bg-white p-6 lg:col-span-1">
          <h2 className="font-display text-lg font-bold text-plum">Add this week</h2>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium text-plum">Week number</span>
            <input
              type="number"
              min={1}
              max={45}
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="w-full rounded-lg border border-blush px-3 py-2 text-sm"
              placeholder="e.g. 22"
            />
          </label>
          <div className="mt-3">
            <span className="mb-1 block text-sm font-medium text-plum">Photo</span>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-blush bg-blush/20 text-center text-sm text-ink/50"
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <span>📷 Tap to upload</span>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          </div>
          <label className="mt-3 block">
            <span className="mb-1 block text-sm font-medium text-plum">Note (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-blush px-3 py-2 text-sm"
              placeholder="Feeling great this week..."
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full rounded-full bg-terracotta py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save entry"}
          </button>
        </form>

        <div className="lg:col-span-2">
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-blush bg-white py-20 text-center">
              <p className="text-4xl">🤰</p>
              <p className="mt-3 font-display text-xl text-plum">Your timeline starts here</p>
              <p className="mt-1 text-sm text-ink/60">Add your first weekly photo to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {entries.map((e) => (
                <div key={e.id} className="group relative overflow-hidden rounded-2xl border border-blush bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.imageUrl} alt={`Week ${e.weekNumber}`} className="aspect-square w-full object-cover" />
                  <button
                    onClick={() => remove(e.id)}
                    className="absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-full bg-white/90 text-terracotta group-hover:flex"
                  >
                    ✕
                  </button>
                  <div className="p-3">
                    <p className="font-display font-bold text-plum">Week {e.weekNumber}</p>
                    <p className="text-xs text-ink/50">{e.entryDate}</p>
                    {e.note && <p className="mt-1 line-clamp-2 text-xs text-ink/70">{e.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
