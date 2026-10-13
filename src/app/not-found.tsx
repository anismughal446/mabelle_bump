import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl">🤰</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-plum">Page not found</h1>
      <p className="mt-2 text-ink/60">We couldn&apos;t find what you were looking for.</p>
      <Link href="/" className="mt-6 rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white">
        Back home
      </Link>
    </div>
  );
}
