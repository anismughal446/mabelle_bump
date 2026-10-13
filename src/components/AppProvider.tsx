"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  dueDate?: string | null;
  addresses?: Address[];
};

export type Address = {
  id: string;
  label: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type Toast = { id: number; message: string; type: "success" | "error" };

type Ctx = {
  user: User | null;
  loading: boolean;
  cartCount: number;
  wishlistIds: number[];
  refreshUser: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  logout: () => Promise<void>;
  toast: (message: string, type?: "success" | "error") => void;
  toasts: Toast[];
};

const AppContext = createContext<Ctx | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
  }, []);

  const refreshCart = useCallback(async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setCartCount((data.items || []).reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
  }, []);

  const refreshWishlist = useCallback(async () => {
    const res = await fetch("/api/wishlist");
    const data = await res.json();
    setWishlistIds((data.items || []).map((i: { productId: number }) => i.productId));
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setCartCount(0);
    setWishlistIds([]);
  }, []);

  useEffect(() => {
    (async () => {
      await refreshUser();
      await Promise.all([refreshCart(), refreshWishlist()]);
      setLoading(false);
    })();
  }, [refreshUser, refreshCart, refreshWishlist]);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        cartCount,
        wishlistIds,
        refreshUser,
        refreshCart,
        refreshWishlist,
        logout,
        toast,
        toasts,
      }}
    >
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-fade-up rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
              t.type === "success" ? "bg-sage" : "bg-terracotta"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}
