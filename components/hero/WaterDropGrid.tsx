"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";

const GAP = 32;
const RIPPLE_THROTTLE_MS = 260;
const BASE_OPACITY = 0.1;

/**
 * Water-drop hero background: a dot grid that ripples outward from wherever
 * the pointer moves, using anime.js grid staggering with `from` set to the
 * dot under the cursor.
 *
 * Tuned to stay in the background rather than compete with the hero: a single
 * muted colour instead of the theme accents, low contrast, and a radial mask
 * that fades the grid out behind the name and intro. The ripple is meant to
 * be noticed on the second glance, not the first.
 */
export function WaterDropGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const lastRippleAt = useRef(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setGrid({
        cols: Math.max(1, Math.floor(width / GAP)),
        rows: Math.max(1, Math.floor(height / GAP)),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ripple = useCallback(
    (index: number) => {
      const el = containerRef.current;
      if (!el || reducedMotion.current) return;
      const dots = el.querySelectorAll(".water-dot");
      if (dots.length === 0) return;

      animate(dots, {
        scale: [
          { to: 1.7, ease: "outSine", duration: 240 },
          { to: 1, ease: "inOutQuad", duration: 900 },
        ],
        opacity: [
          { to: 0.34, ease: "outSine", duration: 240 },
          { to: BASE_OPACITY, ease: "inOutQuad", duration: 900 },
        ],
        delay: stagger(52, {
          grid: [grid.cols, grid.rows],
          from: index,
        }),
      });
    },
    [grid.cols, grid.rows]
  );

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const now = Date.now();
    if (now - lastRippleAt.current < RIPPLE_THROTTLE_MS) return;
    lastRippleAt.current = now;

    const rect = event.currentTarget.getBoundingClientRect();
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * grid.cols);
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * grid.rows);
    ripple(row * grid.cols + col);
  }

  // Occasional idle ripple so the grid isn't inert before anyone interacts,
  // spaced out enough that it reads as ambient rather than as motion demanding
  // attention.
  useEffect(() => {
    const total = grid.cols * grid.rows;
    if (total === 0) return;
    const id = window.setInterval(() => {
      if (Date.now() - lastRippleAt.current < 5000) return;
      ripple(Math.floor(Math.random() * total));
    }, 6500);
    return () => window.clearInterval(id);
  }, [grid.cols, grid.rows, ripple]);

  const total = grid.cols * grid.rows;
  // Keeps the grid off the headline: fully transparent through the middle of
  // the hero, easing back in toward the edges.
  const fadeMask =
    "radial-gradient(ellipse 62% 52% at 50% 44%, transparent 10%, black 78%)";

  return (
    <div
      ref={containerRef}
      aria-hidden
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      className="absolute inset-0 z-0 overflow-hidden"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
        gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        placeItems: "center",
        maskImage: fadeMask,
        WebkitMaskImage: fadeMask,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="water-dot rounded-full"
          style={{
            width: 3,
            height: 3,
            opacity: BASE_OPACITY,
            background: "var(--text-muted)",
          }}
        />
      ))}
    </div>
  );
}
