import { GitBranch, Star } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import type { OpenSourceItem } from "@/types/portfolio";

export function OpenSourceSection({ items }: { items: OpenSourceItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="open-source" className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading eyebrow="Community" title="Open Source Contributions" />
      <StaggerGroup className="space-y-3">
        {items.map((item) => (
          <StaggerItem key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="card-surface group flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-alt)] text-[var(--accent-3)] dark:text-[var(--accent-1)]">
                <GitBranch className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium">{item.repo}</h3>
                {item.description && (
                  <p className="truncate text-xs text-[var(--text-muted)]">{item.description}</p>
                )}
              </div>
              {item.role && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--surface-alt)] px-3 py-1 text-[11px] text-[var(--text-muted)]">
                  <Star className="h-3 w-3" /> {item.role}
                </span>
              )}
            </a>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
