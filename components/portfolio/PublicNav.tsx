"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

export function PublicNav({ name, links }: { name: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-40 px-6 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a href="#top" className="font-[family-name:var(--font-display)] text-sm font-semibold">
          {name}
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          aria-label="Toggle navigation"
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
              className="rounded-lg px-2 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
