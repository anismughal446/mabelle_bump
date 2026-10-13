"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";
import { Spinner } from "./Skeleton";
import Logo from "./Logo";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: string };

export default function DashboardShell({
  role,
  nav,
  children,
}: {
  role: "admin" | "vendor";
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== role)) {
      router.push("/login?redirect=" + pathname);
    }
  }, [loading, user, role, router, pathname]);

  if (loading || !user || user.role !== role) return <Spinner />;

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-blush bg-white transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-6">
            <Logo size="sm" />
          </div>
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
            {role} panel
          </p>
          <nav className="flex-1 space-y-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  pathname === n.href ? "bg-blush text-plum" : "text-ink/70 hover:bg-blush/40",
                )}
              >
                <span>{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-blush pt-4">
            <div className="mb-3 flex items-center gap-2 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-plum text-sm font-semibold text-white">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                <p className="truncate text-xs text-ink/50">{user.email}</p>
              </div>
            </div>
            <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-ink/60 hover:bg-blush/40">
              ← Back to store
            </Link>
            <button onClick={handleLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-terracotta hover:bg-blush/40">
              Log out
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={() => setOpen(false)} />}

      {/* main */}
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-blush bg-white/80 px-4 py-3 backdrop-blur md:hidden">
          <button onClick={() => setOpen(true)} className="text-xl">
            ☰
          </button>
          <span className="font-display font-bold text-plum">{role} panel</span>
          <span className="w-6" />
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
