export function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ""}`} />;
}

export function PortfolioLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-16">
      <div className="flex flex-col items-center gap-6 text-center">
        <Skeleton className="h-32 w-32 rounded-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    </div>
  );
}
