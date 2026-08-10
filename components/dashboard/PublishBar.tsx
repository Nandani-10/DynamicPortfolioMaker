"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Globe, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useSiteOrigin } from "@/hooks/useSiteOrigin";
import { setPublished } from "@/lib/firestore/portfolio";
import { burst } from "@/lib/confetti";

/**
 * Publish state and the public link, pinned to the top of every dashboard page.
 *
 * It used to live only on the overview, which meant finishing an edit and
 * wanting to publish was a navigation away — and the live/private state, the
 * thing an owner most wants to be sure of, wasn't visible anywhere else.
 */
export function PublishBar() {
  const { profile } = useAuth();
  const { portfolio, loading } = useOwnerPortfolio();
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const origin = useSiteOrigin();

  const publicUrl = profile ? `${origin}/${profile.username}` : "";
  const published = !!portfolio?.published;

  async function toggle() {
    if (!profile || !portfolio) return;
    setToggling(true);
    try {
      const next = !published;
      await setPublished(profile.username, next);
      if (next) burst();
    } finally {
      setToggling(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Nothing useful to show — and no link to copy — until the portfolio loads.
  if (!profile || (loading && !portfolio)) return null;

  return (
    <div className="sticky top-14 z-20 -mx-5 mb-6 border-b border-[var(--border)] bg-[var(--bg)]/85 px-5 py-2.5 backdrop-blur sm:-mx-8 sm:px-8 md:top-0">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            published
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-[var(--surface-alt)] text-[var(--text-muted)]"
          }`}
        >
          {published ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          {published ? "Live" : "Private"}
        </span>

        <code className="hidden min-w-0 flex-1 truncate text-xs text-[var(--text-muted)] sm:block">
          {publicUrl}
        </code>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={copy}
            aria-label="Copy public link"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy link
              </>
            )}
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View
          </a>

          <button
            type="button"
            onClick={toggle}
            disabled={toggling}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
              published
                ? "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                : "bg-[linear-gradient(120deg,var(--accent-2),var(--accent-3))] text-white"
            }`}
          >
            {toggling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {published ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
