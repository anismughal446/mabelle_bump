export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-blush/60 bg-white">
          <div className="shimmer aspect-[4/5] w-full" />
          <div className="space-y-2 p-4">
            <div className="shimmer h-3 w-1/2 rounded" />
            <div className="shimmer h-4 w-3/4 rounded" />
            <div className="shimmer h-4 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blush border-t-terracotta" />
    </div>
  );
}
