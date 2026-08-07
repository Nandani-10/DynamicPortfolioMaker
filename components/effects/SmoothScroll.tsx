"use client";

import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Lenis smooth scrolling for the public portfolio.
 *
 * The parallax in the project gallery samples scroll position every frame;
 * native wheel scrolling arrives in coarse jumps, so the depth layers step
 * rather than glide. Lenis interpolates between those jumps.
 *
 * Renders nothing — it only installs the scroll loop.
 */
export function SmoothScroll() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Smoothing hijacks the scroll the OS setting asked to keep plain.
    if (reducedMotion) return;

    let raf = 0;
    let cancelled = false;
    let instance: { raf: (time: number) => void; destroy: () => void } | null = null;

    // Loaded on demand so it stays out of the initial bundle.
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({
        // Long enough to feel eased, short enough that anchor jumps from the
        // nav don't feel like they're travelling.
        duration: 1.05,
        smoothWheel: true,
        // Touch devices already have momentum scrolling; layering ours on top
        // fights the platform and feels wrong.
        syncTouch: false,
      });
      instance = lenis;

      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      instance?.destroy();
    };
  }, [reducedMotion]);

  return null;
}
