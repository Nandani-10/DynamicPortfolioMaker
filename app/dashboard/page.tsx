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

  const checklist = [
    { label: "Hero introduction", done: !!portfolio?.hero.intro },
    { label: "Profile photo", done: !!portfolio?.hero.profileImage },
    { label: "About bio", done: !!portfolio?.about.bio },
    { label: "At least one project", done: (portfolio?.projects.length ?? 0) > 0 },
    { label: "At least one skill", done: (portfolio?.skills.length ?? 0) > 0 },
    { label: "Contact email", done: !!portfolio?.contact.email },
  ];

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
        <p className="mb-4 text-sm font-medium">Profile checklist</p>
        <ul className="space-y-2.5">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5 text-sm">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  item.done
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-[var(--surface-alt)] text-[var(--text-muted)]"
                }`}
              >
                {item.done && <Check className="h-3 w-3" />}
              </span>
              <span className={item.done ? "" : "text-[var(--text-muted)]"}>{item.label}</span>
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
