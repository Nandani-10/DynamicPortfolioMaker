import { GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import type { EducationItem } from "@/types/portfolio";

export function EducationSection({ items, title }: { items: EducationItem[]; title?: string }) {
  if (items.length === 0) return null;

  return (
    <section id="education" className="mx-auto max-w-3xl px-6 py-24">
      <SectionHeading eyebrow="Academics" title={title ?? "Education"} />
      <div className="relative space-y-8 border-l border-[var(--border)] pl-8">
        {items.map((item, i) => (
          <ScrollReveal key={item.id} delay={i * 0.05} direction="left">
            <div className="relative">
              <span className="absolute -left-[2.55rem] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-2)] text-white">
                <GraduationCap className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                {item.startDate}
                {item.endDate ? ` – ${item.endDate}` : ""}
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-medium">
                {item.degree}
                {item.field ? `, ${item.field}` : ""}
              </h3>
              <p className="text-sm text-[var(--accent-3)] dark:text-[var(--accent-1)]">
                {item.institution}
              </p>
              {item.grade && (
                <p className="mt-1 text-xs text-[var(--text-muted)]">Grade: {item.grade}</p>
              )}
              {item.description && (
                <p className="mt-2 text-sm text-[var(--text-muted)]">{item.description}</p>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
