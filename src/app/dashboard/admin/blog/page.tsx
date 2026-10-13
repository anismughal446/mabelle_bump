"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Spinner } from "@/components/Skeleton";

type Post = { id: number; title: string; excerpt: string; slug: string; author: string; tags: string[] };

export default function AdminBlog() {
  const { toast } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");

  async function load() {
    const res = await fetch("/api/blog");
    const d = await res.json();
    setPosts(d.posts || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        excerpt,
        content,
        coverImage: coverImage || undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setTitle("");
      setExcerpt("");
      setContent("");
      setCoverImage("");
      setTags("");
      load();
      toast("Article published");
    } else {
      toast("Could not publish.", "error");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-plum">Journal</h1>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white">
          {showForm ? "Close" : "+ New article"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={add} className="mt-6 space-y-3 rounded-2xl border border-blush bg-white p-6">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Title" className="w-full rounded-lg border border-blush px-3 py-2 text-sm" />
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short excerpt" className="w-full rounded-lg border border-blush px-3 py-2 text-sm" />
          <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Cover image URL (optional)" className="w-full rounded-lg border border-blush px-3 py-2 text-sm" />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full rounded-lg border border-blush px-3 py-2 text-sm" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={6} placeholder="Write your article (use blank lines between paragraphs)..." className="w-full rounded-lg border border-blush px-3 py-2 text-sm" />
          <button type="submit" className="rounded-full bg-plum px-6 py-2.5 text-sm font-semibold text-white">
            Publish
          </button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="rounded-2xl border border-blush bg-white p-5">
            <h2 className="font-display text-lg font-bold text-plum">{p.title}</h2>
            <p className="mt-1 text-sm text-ink/60">{p.excerpt}</p>
            <p className="mt-2 text-xs text-ink/40">By {p.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
