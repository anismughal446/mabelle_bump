"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard/admin") || pathname?.startsWith("/dashboard/vendor")) {
    return null;
  }
  return (
    <footer className="mt-20 border-t border-blush bg-blush/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Logo size="lg" />
          <p className="mt-4 max-w-xs text-sm text-ink/60">
            Beautiful journey ahead — thoughtfully designed maternity wear, care essentials and
            baby basics for every trimester and beyond.
          </p>
        </div>
        <FooterCol title="Shop" links={[["Shop All", "/shop"], ["Rent the Bump", "/rental"], ["Style Quiz", "/quiz"]]} />
        <FooterCol
          title="Support"
          links={[["Bump Tracker", "/bump-tracker"], ["My Account", "/account"], ["Tips & Guides", "/blog"]]}
        />
        <FooterCol title="Sell" links={[["Become a Vendor", "/register?role=vendor"], ["Sign in", "/login"]]} />
      </div>
      <div className="border-t border-blush py-5 text-center text-xs text-ink/50">
        © {new Date().getFullYear()} Mabelle Bump. Made with care for growing families.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink">{title}</p>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-ink/60 hover:text-terracotta">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
