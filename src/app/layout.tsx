import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mabelle Bump — Beautiful Journey Ahead",
  description:
    "Shop maternity clothing by trimester, track your bump, and get personalized style recommendations at Mabelle Bump. Beautiful journey ahead.",
  icons: {
    icon: "/images/logo-mabelle.png",
    apple: "/images/logo-mabelle.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-ink antialiased">
        <AppProvider>
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
