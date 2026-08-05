"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { ReactNode } from "react";

/**
 * A faint radial highlight that tracks the cursor across the card — the
 * restrained hover treatment used by Linear/Vercel. It reads as the surface
 * catching light rather than as a colour effect, which is what keeps it from
 * looking decorative.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  const background = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--accent-2) 14%, transparent), transparent 75%)`;

  return (
    <div
      className={`group/spotlight relative ${className ?? ""}`}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX.set(event.clientX - rect.left);
        mouseY.set(event.clientY - rect.top);
      }}
      onPointerLeave={() => {
        mouseX.set(-500);
        mouseY.set(-500);
      }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{ background }}
      />
      {children}
    </div>
  );
}
