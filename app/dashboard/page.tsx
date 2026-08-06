"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { setPublished } from "@/lib/firestore/portfolio";
import { Button } from "@/components/ui/Button";
import { PageFadeIn } from "@/components/effects/PageFadeIn";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";
import { burst } from "@/lib/confetti";

function useSiteOrigin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

export default function DashboardOverview() {
  const { profile } = useAuth();
  const { portfolio, loading } = useOwnerPortfolio();
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const origin = useSiteOrigin();

  const publicUrl = profile ? `${origin}/${profile.username}` : "";

  async function handleTogglePublish() {
    if (!profile || !portfolio) return;
    setToggling(true);
    try {
      const next = !portfolio.published;
      await setPublished(profile.username, next);
      if (next) burst();
    } finally {
      setToggling(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Everything a visitor notices the absence of, weighted equally. Optional
  // sections (awards, blogs, testimonials) are deliberately excluded — a
  // portfolio isn't incomplete for lacking press coverage.
  const checklist = [
    { label: "Hero introduction", done: !!portfolio?.hero.intro, href: "/dashboard/hero" },
    { label: "Roles for the typing effect", done: (portfolio?.hero.roles.length ?? 0) > 0, href: "/dashboard/hero" },
    { label: "Profile photo", done: !!portfolio?.hero.profileImage, href: "/dashboard/hero" },
    { label: "About bio", done: !!portfolio?.about.bio, href: "/dashboard/about" },
    { label: "Resume PDF", done: !!portfolio?.hero.resumeUrl, href: "/dashboard/about" },
    { label: "At least one project", done: (portfolio?.projects.length ?? 0) > 0, href: "/dashboard/projects" },
    { label: "At least one skill", done: (portfolio?.skills.length ?? 0) > 0, href: "/dashboard/skills" },
    { label: "Experience or education", done: (portfolio?.experience.length ?? 0) + (portfolio?.education.length ?? 0) > 0, href: "/dashboard/experience" },
    { label: "Contact email", done: !!portfolio?.contact.email, href: "/dashboard/contact" },
    { label: "A social link", done: Object.values(portfolio?.social ?? {}).some(Boolean), href: "/dashboard/contact" },
  ];

  const completed = checklist.filter((item) => item.done).length;
  const percent = Math.round((completed / checklist.length) * 100);

  return (
    <PageFadeIn>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Welcome{profile ? `, ${profile.displayName?.split(" ")[0] ?? ""}` : ""} 👋
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Customize your portfolio, then publish it to share your unique link.
        </p>
      </div>

      <div className="card-surface mb-6 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Your public link
            </p>
            <p className="mt-1 truncate font-medium">{publicUrl || "…"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 py-2 text-xs font-medium transition-colors hover:border-[var(--accent-2)]"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 py-2 text-xs font-medium transition-colors hover:border-[var(--accent-2)]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Preview
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-[var(--surface-alt)] px-4 py-3">
          <div>
            <p className="text-sm font-medium">
              {loading
                ? "Loading status…"
                : portfolio?.published
                ? "Your portfolio is live"
                : "Your portfolio is private"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {portfolio?.published
                ? "Anyone with the link can view it."
                : "Publish to make it visible to visitors."}
            </p>
          </div>
          <Button onClick={handleTogglePublish} disabled={loading || toggling} magnetic={false}>
            {toggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : portfolio?.published ? (
              "Unpublish"
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>

      <div className="card-surface mb-6 p-6">
        <div className="mb-1 flex items-baseline justify-between">
          <p className="text-sm font-medium">Portfolio completeness</p>
          <p className="text-sm font-medium tabular-nums">{percent}%</p>
        </div>
        <p className="mb-4 text-xs text-[var(--text-muted)]">
          {completed} of {checklist.length} essentials filled in
          {percent < 100 ? " — the unchecked ones link straight to their editor." : "."}
        </p>

        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-alt)]">
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Portfolio completeness"
            style={{ width: `${percent}%` }}
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-1),var(--accent-2),var(--accent-3))] transition-[width] duration-500"
          />
        </div>

        <ul className="space-y-2.5">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  item.done
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-[var(--surface-alt)] text-[var(--text-muted)]"
                }`}
              >
                {item.done && <Check className="h-3 w-3" />}
              </span>
              {item.done ? (
                <span>{item.label}</span>
              ) : (
                <a
                  href={item.href}
                  className="text-[var(--text-muted)] underline-offset-2 hover:text-[var(--text)] hover:underline"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DASHBOARD_NAV.slice(1).map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="card-surface flex flex-col items-start gap-2 p-4 transition-transform hover:-translate-y-0.5"
          >
            <item.icon className="h-4 w-4 text-[var(--accent-3)] dark:text-[var(--accent-1)]" />
            <span className="text-sm font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </PageFadeIn>
  );
}
