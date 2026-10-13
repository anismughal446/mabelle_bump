"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function Confirmation() {
  const params = useSearchParams();
  const id = params.get("id");
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-6xl">🎉</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-plum">Order confirmed!</h1>
      <p className="mt-2 text-ink/60">
        Thank you for shopping with Mabelle Bump. {id && <>Your order #{id} is being prepared.</>}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/account" className="rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white">
          Track my order
        </Link>
        <Link href="/shop" className="rounded-full border border-plum/30 px-6 py-3 text-sm font-semibold text-plum">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Confirmation />
    </Suspense>
  );
}
