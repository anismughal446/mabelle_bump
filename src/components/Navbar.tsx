"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "./AppProvider";
import Logo from "./Logo";

export default function Navbar() {
  const { user, cartCount, logout } = useApp();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (pathname?.startsWith("/dashboard/admin") || pathname?.startsWith("/dashboard/vendor")) {
    return null;
  }

  const links = [
    { href: "/shop", label: "Shop Clothes" },
    { href: "/quiz", label: "Find My Style" },
    { href: "/rental", label: "Rent Clothes" },
    { href: "/bump-tracker", label: "My Bump" },
    { href: "/blog", label: "Tips & Guides" },
  ];

  async function handleLogout() {
    await logout();
    setMenu(false);
    router.push("/");
  }

  return (
    <>
      {/* Announcement / marquee bar */}
      <div className="bg-plum text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium sm:text-[13px]">
          <span className="hidden sm:inline">🚚 Free shipping over $75</span>
          <span className="hidden sm:inline text-cream/40">•</span>
          <span>✨ 7-day easy returns</span>
          <span className="text-cream/40">•</span>
          <span>
            Use code <span className="font-bold text-blush">BUMP15</span> for 15% off
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-blush bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo size="md" />

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition hover:text-terracotta ${
                pathname === l.href ? "text-terracotta" : "text-ink/80"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/wishlist" className="hidden text-ink/70 hover:text-terracotta sm:block" aria-label="Wishlist">
            ♡
          </Link>
          <Link href="/cart" className="relative text-ink/80 hover:text-terracotta" aria-label="Cart">
            <span className="text-lg">🛍️</span>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-plum text-sm font-semibold text-white"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              {menu && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl border border-blush bg-white p-2 shadow-xl"
                  onMouseLeave={() => setMenu(false)}
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-ink">{user.name}</p>
                    <p className="text-xs capitalize text-ink/50">{user.role}</p>
                  </div>
                  <MenuLink href="/account" onClick={() => setMenu(false)}>
                    My Account
                  </MenuLink>
                  <MenuLink href="/bump-tracker" onClick={() => setMenu(false)}>
                    Bump Tracker
                  </MenuLink>
                  {user.role === "vendor" && (
                    <MenuLink href="/dashboard/vendor" onClick={() => setMenu(false)}>
                      Vendor Dashboard
                    </MenuLink>
                  )}
                  {user.role === "admin" && (
                    <MenuLink href="/dashboard/admin" onClick={() => setMenu(false)}>
                      Admin Dashboard
                    </MenuLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-terracotta hover:bg-blush/50"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white transition hover:bg-terracotta/90"
            >
              Sign in
            </Link>
          )}

          <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <span className="text-xl">☰</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-blush bg-cream px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-ink/80"
            >
              {l.label}
            </Link>
          ))}
        </div>
        )}
      </header>
    </>
  );
}

function MenuLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-blush/50"
    >
      {children}
    </Link>
  );
}
