"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Eye, Monitor, RotateCw, Smartphone, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

type Device = "desktop" | "mobile";

/**
 * Slide-over preview of the owner's public page.
 *
 * It shows the *saved* portfolio, not the editor's in-progress state — the
 * public page reads Firestore directly, so the frame catches up the moment
 * changes are saved rather than as they're typed. The header says so, since
 * a preview that silently lags edits is worse than no preview.
 */
export function LivePreview() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
  // Bumping this remounts the iframe, which is the only way to force a
  // cross-origin-ish reload without reaching into its document.
  const [reloadToken, setReloadToken] = useState(0);

  if (!profile?.username) return null;
  const url = `/${profile.username}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-[linear-gradient(120deg,var(--accent-2),var(--accent-3))] px-4 py-3 text-xs font-medium text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105 xl:bottom-8 xl:right-8"
      >
        <Eye className="h-4 w-4" /> Preview
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              aria-label="Close preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[42rem] flex-col border-l border-[var(--border)] bg-[var(--surface)]"
            >
              <header className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">Live preview</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    Shows your saved portfolio — save to see new edits.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--border)] p-0.5">
                  <button
                    type="button"
                    onClick={() => setDevice("desktop")}
                    aria-label="Desktop width"
                    aria-pressed={device === "desktop"}
                    className={`rounded-full p-1.5 ${
                      device === "desktop"
                        ? "bg-[var(--surface-alt)] text-[var(--text)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice("mobile")}
                    aria-label="Mobile width"
                    aria-pressed={device === "mobile"}
                    className={`rounded-full p-1.5 ${
                      device === "mobile"
                        ? "bg-[var(--surface-alt)] text-[var(--text)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setReloadToken((t) => t + 1)}
                  aria-label="Reload preview"
                  className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open in a new tab"
                  className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close preview"
                  className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-[var(--bg)] p-3">
                <iframe
                  key={reloadToken}
                  src={url}
                  title="Portfolio preview"
                  className={`h-full rounded-xl border border-[var(--border)] bg-white transition-[width] duration-300 ${
                    device === "mobile" ? "w-[24rem] max-w-full" : "w-full"
                  }`}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
