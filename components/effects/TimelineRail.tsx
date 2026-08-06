"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Timeline wrapper whose vertical line fills in as the reader scrolls past
 * it, so the eye is pulled down the entries instead of meeting a static rule.
 *
 * Two lines are stacked: a full-height track in the border colour, and an
 * accent line scaled from the top by scroll progress. Scaling avoids
 * animating height, which would trigger layout on every frame.
 */
export function TimelineRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 55%"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div ref={ref} className={`relative space-y-8 pl-8 ${className ?? ""}`}>
      <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-[var(--border)]" />
      <motion.span
        aria-hidden
        style={{ scaleY }}
        className="absolute inset-y-0 left-0 w-px origin-top bg-[linear-gradient(180deg,var(--accent-1),var(--accent-2),var(--accent-3))]"
      />
      {children}
    </div>
  );
}
