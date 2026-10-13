"use client";

import { useState } from "react";
import { useApp } from "./AppProvider";

export default function Newsletter() {
  const { toast } = useApp();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setEmail("");
    toast("You're in! Check your inbox 💌");
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 rounded-full border border-blush bg-white px-5 py-3 text-sm focus:border-terracotta focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-terracotta/90"
      >
        {done ? "Subscribed ✓" : "Subscribe"}
      </button>
    </form>
  );
}
