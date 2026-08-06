import Image from "next/image";
import { Briefcase } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { TimelineRail } from "@/components/effects/TimelineRail";
import type { ExperienceItem } from "@/types/portfolio";

export function ExperienceSection({ items, title }: { items: ExperienceItem[]; title?: string }) {
  if (items.length === 0) return null;

  return (
    <section id="experience" className="mx-auto max-w-3xl px-6 py-24">
      <SectionHeading eyebrow="Career" title={title ?? "Work Experience"} />
      <TimelineRail>
        {items.map((item, i) => (
          <ScrollReveal key={item.id} delay={i * 0.05} direction="left">
            <div className="relative">
              <span className="absolute -left-[2.55rem] top-1 flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[var(--accent-3)] text-white">
                {item.companyLogo ? (
                  <Image src={item.companyLogo} alt="" fill className="object-cover" sizes="24px" />
                ) : (
                  <Briefcase className="h-3.5 w-3.5" />
                )}
              </span>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                {item.startDate} – {item.current ? "Present" : item.endDate}
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-medium">
                {item.role}
              </h3>
              <p className="text-sm text-[var(--accent-3)] dark:text-[var(--accent-1)]">
                {item.company}
                {item.location ? ` · ${item.location}` : ""}
              </p>
              {item.description && (
                <p className="mt-2 text-sm text-[var(--text-muted)]">{item.description}</p>
              )}
              {item.highlights && item.highlights.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--text-muted)]">
                  {item.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          </ScrollReveal>
        ))}
      </TimelineRail>
    </section>
  );
}
