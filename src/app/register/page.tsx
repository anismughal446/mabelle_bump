"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/AppProvider";

function RegisterForm() {
  const { refreshUser, toast } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [role, setRole] = useState(params.get("role") === "vendor" ? "vendor" : "customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, dueDate: dueDate || null }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    await refreshUser();
    toast("Account created — welcome! 🎉");
    if (data.user.role === "vendor") router.push("/dashboard/vendor");
    else router.push("/");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-plum">Join Mabelle Bump</h1>
      <p className="mt-1 text-sm text-ink/60">Create your account to start shopping & tracking.</p>

      <div className="mt-5 flex rounded-full bg-blush/50 p-1 text-sm">
        <button
          onClick={() => setRole("customer")}
          className={`flex-1 rounded-full py-2 font-medium ${role === "customer" ? "bg-white text-plum shadow" : "text-ink/60"}`}
        >
          I&apos;m shopping
        </button>
        <button
          onClick={() => setRole("vendor")}
          className={`flex-1 rounded-full py-2 font-medium ${role === "vendor" ? "bg-white text-plum shadow" : "text-ink/60"}`}
        >
          I&apos;m a vendor
        </button>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4">
        {error && <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{error}</p>}
        <Field label="Full name" type="text" value={name} onChange={setName} />
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        {role === "customer" && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-plum">Due date (optional)</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-blush bg-white px-3 py-2.5 text-sm focus:border-terracotta focus:outline-none"
            />
            <span className="mt-1 block text-xs text-ink/50">We&apos;ll tailor recommendations to your trimester.</span>
          </label>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-terracotta py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-terracotta hover:underline">
          Sign in
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

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
