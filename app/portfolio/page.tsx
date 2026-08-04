"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { PortfolioLoadingSkeleton } from "@/components/ui/Skeleton";
import { subscribeToPortfolio } from "@/lib/firestore/portfolio";
import { normalizeUsername } from "@/lib/portfolio-defaults";
import type { Portfolio } from "@/types/portfolio";

/**
 * Public portfolio page.
 *
 * The site is a static export (Firebase Hosting free tier has no server), so
 * this single page backs every `/{username}` URL: Hosting rewrites unmatched
 * paths here, the browser URL stays `/{username}`, and we read the username
 * off the path and fetch that portfolio from Firestore client-side.
 */
export default function PublicPortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const segment = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
    const clean = normalizeUsername(decodeURIComponent(segment));

    if (!clean || clean === "portfolio") {
      setUsername(null);
      setLoading(false);
      return;
    }

    setUsername(clean);
    const unsubscribe = subscribeToPortfolio(clean, (data) => {
      setPortfolio(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!portfolio) return;
    const role = portfolio.hero.roles[0];
    document.title = role
      ? `${portfolio.hero.name} — ${role}`
      : `${portfolio.hero.name} — Portfolio`;
  }, [portfolio]);

  if (loading) {
    return <PortfolioLoadingSkeleton />;
  }

  if (!username || !portfolio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--bg)] px-6 text-center text-[var(--text)]">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Portfolio not found
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {username
            ? `No portfolio exists at /${username}.`
            : "No portfolio was specified in this URL."}
        </p>
        <Link
          href="/"
          className="mt-2 text-sm font-medium text-[var(--accent-2)] hover:underline"
        >
          Create your own portfolio
        </Link>
      </div>
    );
  }

  return <PortfolioView portfolio={portfolio} />;
}
