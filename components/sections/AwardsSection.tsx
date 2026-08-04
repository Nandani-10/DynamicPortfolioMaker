import { Award } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import type { AwardItem } from "@/types/portfolio";

export function AwardsSection({ items }: { items: AwardItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="awards" className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading eyebrow="Recognition" title="Awards & Recognition" />
      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((award) => (
          <StaggerItem key={award.id}>
            <div className="card-surface flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-1)]/20 text-[var(--accent-3)] dark:text-[var(--accent-1)]">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-medium">{award.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {award.issuer} · {award.date}
                </p>
                {award.description && (
                  <p className="mt-1.5 text-sm text-[var(--text-muted)]">{award.description}</p>
                )}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
