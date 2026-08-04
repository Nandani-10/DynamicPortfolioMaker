import Link from "next/link";

export default function PortfolioNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--bg)] px-6 text-center text-[var(--text)]">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        Portfolio not found
      </h1>
      <p className="text-sm text-[var(--text-muted)]">
        This username doesn&apos;t have a published portfolio.
      </p>
      <Link
        href="/"
        className="mt-2 text-sm font-medium text-[var(--accent-2)] hover:underline"
      >
        Go back home
      </Link>
    </div>
  );
}
