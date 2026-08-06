"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { TestimonialItem } from "@/types/portfolio";

const AUTOPLAY_MS = 7000;

function Avatar({ testimonial }: { testimonial: TestimonialItem }) {
  if (testimonial.avatar) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--surface-alt)] text-base font-medium">
      {testimonial.name.charAt(0)}
    </div>
  );
}

export function TestimonialsSection({
  items,
  title,
}: {
  items: TestimonialItem[];
  title?: string;
}) {
  const [index, setIndex] = useState(0);
  // Direction drives which way the quote slides, so paging back doesn't
  // animate as though it were paging forward.
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const page = useCallback(
    (delta: number) => {
      setDirection(delta);
      setIndex((current) => (current + delta + items.length) % items.length);
    },
    [items.length]
  );

  // Advance on its own, but never while the reader is hovering, focused
  // inside, or has asked for reduced motion.
  useEffect(() => {
    if (paused || reducedMotion || items.length < 2) return;
    const timer = window.setInterval(() => page(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, items.length, page]);

  if (items.length === 0) return null;

  const testimonial = items[index];

  return (
    <section id="testimonials" className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading eyebrow="Kind words" title={title ?? "Testimonials"} />

      <ScrollReveal>
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          className="relative"
        >
          {/* Fixed height keeps the surrounding page from jumping as quotes of
              different lengths cycle through. */}
          <div className="card-surface glass relative flex min-h-[19rem] items-center overflow-hidden p-8 sm:min-h-[16rem] sm:p-10">
            <Quote className="absolute right-6 top-6 h-16 w-16 text-[var(--accent-2)]/10" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.blockquote
                key={testimonial.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -28 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full"
              >
                <p className="text-base leading-relaxed text-[var(--text)] sm:text-lg">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <Avatar testimonial={testimonial} />
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {[testimonial.role, testimonial.company].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {items.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => page(-1)}
                aria-label="Previous testimonial"
                className="rounded-full border border-[var(--border)] p-2 text-[var(--text-muted)] transition-colors hover:border-[var(--accent-2)] hover:text-[var(--text)]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setDirection(i > index ? 1 : -1);
                      setIndex(i);
                    }}
                    aria-label={`Show testimonial from ${item.name}`}
                    aria-current={i === index}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index
                        ? "w-6 bg-[var(--accent-2)]"
                        : "w-1.5 bg-[var(--border)] hover:bg-[var(--text-muted)]"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => page(1)}
                aria-label="Next testimonial"
                className="rounded-full border border-[var(--border)] p-2 text-[var(--text-muted)] transition-colors hover:border-[var(--accent-2)] hover:text-[var(--text)]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
