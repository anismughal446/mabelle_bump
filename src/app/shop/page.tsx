import { Suspense } from "react";
import ShopClient from "./ShopClient";
import { ProductGridSkeleton } from "@/components/Skeleton";

export const dynamic = "force-dynamic";

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <ProductGridSkeleton />
        </div>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
