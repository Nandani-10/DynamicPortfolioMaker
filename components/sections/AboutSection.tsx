import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import type { AboutContent } from "@/types/portfolio";

export function AboutSection({ about }: { about: AboutContent }) {
  if (!about.bio && about.highlights.length === 0) return null;

  return (
    <section id="about" className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading eyebrow="Get to know me" title="About Me" />
      <ScrollReveal>
        <p className="whitespace-pre-line text-center text-lg leading-relaxed text-[var(--text-muted)]">
          {about.bio}
        </p>
      </ScrollReveal>

      {about.highlights.length > 0 && (
        <StaggerGroup className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {about.highlights.map((h, i) => (
            <StaggerItem key={i}>
              <div className="card-surface flex items-center gap-3 p-4">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent-2)]" />
                <span className="text-sm">{h}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </section>
  );
}
