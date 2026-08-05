import Image from "next/image";
import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import { TiltCard } from "@/components/effects/TiltCard";
import type { TestimonialItem } from "@/types/portfolio";

export function TestimonialsSection({ items, title }: { items: TestimonialItem[]; title?: string }) {
  if (items.length === 0) return null;

  return (
    <section id="testimonials" className="mx-auto max-w-5xl px-6 py-24">
      <SectionHeading eyebrow="Kind words" title={title ?? "Testimonials"} />
      <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {items.map((t) => (
          <StaggerItem key={t.id}>
            <TiltCard>
              <div className="card-surface glass h-full p-6">
                <Quote className="mb-3 h-6 w-6 text-[var(--accent-2)]" />
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  {t.avatar ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-alt)] text-sm font-medium">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {[t.role, t.company].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
