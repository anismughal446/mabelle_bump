"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/AppProvider";

function LoginForm() {
  const { refreshUser, refreshCart, refreshWishlist, toast } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    await Promise.all([refreshUser(), refreshCart(), refreshWishlist()]);
    toast(`Welcome back, ${data.user.name.split(" ")[0]}!`);
    const redirect = params.get("redirect");
    if (redirect) router.push(redirect);
    else if (data.user.role === "admin") router.push("/dashboard/admin");
    else if (data.user.role === "vendor") router.push("/dashboard/vendor");
    else router.push("/");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-plum">Welcome back</h1>
      <p className="mt-1 text-sm text-ink/60">Sign in to continue your journey.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {error && <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{error}</p>}
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-terracotta py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-4 rounded-xl bg-blush/40 p-3 text-xs text-ink/60">
        <p className="font-semibold text-plum">Demo accounts (password: password123)</p>
        <p>customer@mabellebump.com · vendor@mabellebump.com · admin@mabellebump.com</p>
      </div>

      <p className="mt-6 text-center text-sm text-ink/60">
        New here?{" "}
        <Link href="/register" className="font-semibold text-terracotta hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-plum">{label}</span>
      <input
        type={type}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-blush bg-white px-3 py-2.5 text-sm focus:border-terracotta focus:outline-none"
      />
    </label>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
