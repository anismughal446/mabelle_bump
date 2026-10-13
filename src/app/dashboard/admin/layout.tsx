import DashboardShell from "@/components/DashboardShell";

const NAV = [
  { href: "/dashboard/admin", label: "Overview", icon: "📊" },
  { href: "/dashboard/admin/products", label: "Products", icon: "👗" },
  { href: "/dashboard/admin/orders", label: "Orders", icon: "📦" },
  { href: "/dashboard/admin/users", label: "Users", icon: "👥" },
  { href: "/dashboard/admin/coupons", label: "Coupons", icon: "🏷️" },
  { href: "/dashboard/admin/blog", label: "Journal", icon: "📝" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="admin" nav={NAV}>
      {children}
    </DashboardShell>
  );
}
