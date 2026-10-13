import DashboardShell from "@/components/DashboardShell";

const NAV = [
  { href: "/dashboard/vendor", label: "Overview", icon: "📊" },
  { href: "/dashboard/vendor/products", label: "My Products", icon: "👗" },
  { href: "/dashboard/vendor/orders", label: "Orders", icon: "📦" },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="vendor" nav={NAV}>
      {children}
    </DashboardShell>
  );
}
