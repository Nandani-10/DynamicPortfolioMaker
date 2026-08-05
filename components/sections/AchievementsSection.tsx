import { Trophy } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import type { AchievementItem } from "@/types/portfolio";

export function AchievementsSection({ items, title }: { items: AchievementItem[]; title?: string }) {
  if (items.length === 0) return null;

  return (
    <section id="achievements" className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading eyebrow="Milestones" title={title ?? "Achievements"} />
      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <StaggerItem key={item.id}>
            <div className="card-surface flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-2)]/20 text-[var(--accent-3)] dark:text-[var(--accent-1)]">
                <Trophy className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-medium">{item.title}</h3>
                {item.date && <p className="text-xs text-[var(--text-muted)]">{item.date}</p>}
                {item.description && (
                  <p className="mt-1.5 text-sm text-[var(--text-muted)]">{item.description}</p>
                )}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
