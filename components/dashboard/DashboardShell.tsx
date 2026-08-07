"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X, ExternalLink } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { LivePreview } from "@/components/dashboard/LivePreview";
import { AiAssistant } from "@/components/dashboard/AiAssistant";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";
import type { ReactNode } from "react";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasUnsaved = useUnsavedChangesGuard();

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Mobile topbar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 py-3 backdrop-blur md:hidden">
        <span className="font-[family-name:var(--font-display)] text-base font-semibold">
          Portfolio<span className="gradient-text">Maker</span>
          {hasUnsaved && (
            <span
              title="You have unsaved changes"
              className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-middle"
            />
          )}
        </span>
        <button
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg border border-[var(--border)] p-2"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur transition-transform duration-300 md:static md:translate-x-0 md:bg-[var(--surface)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-4 pb-6 pt-6 md:pt-8">
          <Link
            href="/"
            className="mb-8 hidden px-2 font-[family-name:var(--font-display)] text-lg font-semibold md:block"
          >
            Portfolio<span className="gradient-text">Maker</span>
          </Link>

          {hasUnsaved && (
            <p className="mb-4 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              Unsaved changes on this page
            </p>
          )}

          <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto pr-1">
            {DASHBOARD_NAV.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-[var(--accent-2)]/15 font-medium text-[var(--accent-3)] dark:text-[var(--accent-1)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
            {profile?.username && (
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
              >
                <ExternalLink className="h-4 w-4" />
                View public page
              </a>
            )}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
        />
      )}

      <main className="min-w-0 flex-1 px-5 pb-24 pt-20 sm:px-8 md:pt-10">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>

      <AiAssistant />
      <LivePreview />
    </div>
  );
}
