import Link from "next/link";

/**
 * Mabelle Bump brand logo — uses the official logo artwork.
 * Compact for navbar / footer; full for splash moments.
 */
export default function Logo({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const heights = { sm: 40, md: 52, lg: 72 };
  const h = heights[size];

  return (
    <Link
      href="/"
      className={`inline-flex items-center transition hover:opacity-90 ${className}`}
      aria-label="Mabelle Bump home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-mabelle.png"
        alt="Mabelle Bump — Beautiful Journey Ahead"
        height={h}
        style={{ height: h, width: "auto" }}
        className="object-contain"
      />
    </Link>
  );
}
