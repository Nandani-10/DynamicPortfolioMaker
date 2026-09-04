"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { DRAWING_ASPECT, countPoints, renderDrawing } from "@/lib/us/drawing";
import type { DrawingPayload } from "@/types/us";

/**
 * Replays a doodle stroke by stroke, so opening one feels like watching the
 * other person draw it. Already-seen doodles render instantly (`animate` off).
 */
export function DrawingReplay({
  payload,
  animate = true,
  onDone,
}: {
  payload: DrawingPayload;
  animate?: boolean;
  onDone?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const doneRef = useRef(onDone);

  // Kept in a ref so a new callback identity doesn't restart the animation.
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let cancelled = false;

    const paint = (progress: number) => {
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = width / DRAWING_ASPECT;
      if (canvas.width !== Math.round(width * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      renderDrawing(ctx, payload, width, height, progress);
    };

    if (!animate || reduced) {
      paint(1);
      doneRef.current?.();
      return;
    }

    // ~90 points per second, with a floor so tiny doodles still animate.
    const total = Math.max(1, countPoints(payload));
    const duration = Math.min(4200, Math.max(900, (total / 90) * 1000));
    const start = performance.now();

    const step = (now: number) => {
      if (cancelled) return;
      const progress = Math.min(1, (now - start) / duration);
      paint(progress);
      if (progress < 1) frame = requestAnimationFrame(step);
      else doneRef.current?.();
    };
    frame = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [payload, animate, reduced]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-2xl"
      style={{ background: "var(--us-surface-solid)", aspectRatio: `${DRAWING_ASPECT}` }}
      role="img"
      aria-label={payload.note ? `Drawing: ${payload.note}` : "A drawing"}
    />
  );
}
