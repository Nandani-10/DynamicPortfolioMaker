"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";

const GAP = 28;
const RIPPLE_THROTTLE_MS = 220;

/**
 * Water-drop hero background: a grid of dots that ripples outward from
 * wherever the pointer moves, plus a slow idle ripple so the hero still
 * breathes when nobody is interacting. Powered by anime.js grid staggering,
 * where `from` is the index the wave originates at.
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
          { to: 2.4, ease: "outSine", duration: 190 },
          { to: 1, ease: "inOutQuad", duration: 760 },
        ],
        opacity: [
          { to: 0.85, ease: "outSine", duration: 190 },
          { to: 0.22, ease: "inOutQuad", duration: 760 },
        ],
        delay: stagger(58, {
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

  // Idle ripples so the hero animates before the visitor touches anything.
  useEffect(() => {
    const total = grid.cols * grid.rows;
    if (total === 0) return;
    const id = window.setInterval(() => {
      if (Date.now() - lastRippleAt.current < 2500) return;
      ripple(Math.floor(Math.random() * total));
    }, 3200);
    return () => window.clearInterval(id);
  }, [grid.cols, grid.rows, ripple]);

  const total = grid.cols * grid.rows;

  return (
    <div
      ref={containerRef}
      aria-hidden
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      className="absolute inset-0 overflow-hidden"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
        gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        placeItems: "center",
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="water-dot rounded-full"
          style={{
            width: 4,
            height: 4,
            opacity: 0.22,
            background:
              i % 3 === 0
                ? "var(--accent-2)"
                : i % 3 === 1
                ? "var(--accent-3)"
                : "var(--accent-1)",
          }}
        />
      ))}
    </div>
  );
}
