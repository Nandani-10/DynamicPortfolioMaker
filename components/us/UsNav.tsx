"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useUs } from "@/components/us/UsProvider";

const TABS = [
  { href: "/us", label: "Today", icon: "☀" },
  { href: "/us/chat", label: "Chat", icon: "✉" },
  { href: "/us/play", label: "Play", icon: "◆" },
  { href: "/us/memories", label: "Ours", icon: "❖" },
  { href: "/us/settings", label: "Us", icon: "❤" },
] as const;

export function UsNav() {
  const pathname = usePathname();
  const { messages, uid, thoughts } = useUs();

  const unread = messages.filter(
    (m) => m.senderUid !== uid && !(m.seenBy ?? []).includes(uid)
  ).length;
  const undiscovered = thoughts.filter(
    (t) => t.authorUid !== uid && !t.discoveredAt
  ).length;

  function badgeFor(href: string): number {
    if (href === "/us/chat") return unread;
    if (href === "/us/memories") return undiscovered;
    return 0;
  }

  return (
    <nav
      className="us-card fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-1 p-1.5 sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:w-auto sm:-translate-x-1/2 sm:gap-2 sm:px-2"
      aria-label="Sections"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/us" ? pathname === "/us" : pathname.startsWith(tab.href);
        const badge = badgeFor(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-[0.68rem] font-medium sm:flex-none sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
            style={{ color: active ? "var(--us-text)" : "var(--us-muted)" }}
          >
            {active && (
              <motion.span
                layoutId="us-nav-pill"
                className="absolute inset-0 -z-10 rounded-2xl"
                style={{ background: "color-mix(in srgb, var(--us-accent) 20%, transparent)" }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span aria-hidden className="text-base leading-none sm:text-sm">
              {tab.icon}
            </span>
            {tab.label}
            {badge > 0 && (
              <span
                className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full sm:right-1.5"
                style={{ background: "var(--us-accent-2)" }}
                aria-label={`${badge} new`}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
