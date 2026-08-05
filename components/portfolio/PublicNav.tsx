"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

export function PublicNav({ name, links }: { name: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);

  // Highlight whichever section currently occupies the upper half of the
  // viewport, so the nav reflects where the reader actually is.
  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);

  return (
    <nav className="glass sticky top-0 z-40 px-6 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a href="#top" className="font-[family-name:var(--font-display)] text-sm font-semibold">
          {name}
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = activeHref === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {active && (
                  // Shared layoutId slides the pill between links instead of
                  // popping it, which is what makes the nav feel continuous.
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-[var(--surface-alt)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </a>
            );
          })}
        </div>

        <button
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-1.5 md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-3 flex max-w-6xl flex-col gap-1 border-t border-[var(--border)] pt-3 md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-2 py-2 text-sm ${
                activeHref === link.href
                  ? "bg-[var(--surface-alt)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
