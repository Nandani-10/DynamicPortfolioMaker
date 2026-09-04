"use client";

import type { DrawingPayload, DrawingSticker, DrawingStroke } from "@/types/us";

/** Doodles are stored in 0–1 space so they redraw crisply at any size. */
export const DRAWING_ASPECT = 4 / 3;

export const DRAWING_COLORS = [
  "#2f2a3d",
  "#e07a5f",
  "#d1497f",
  "#8a6fd8",
  "#4a90c2",
  "#3f9a7d",
  "#e0b64a",
  "#f5f2ee",
];

export const DRAWING_STICKERS = ["⭐", "✦", "🌙", "☀️", "🌸", "😭", "😂", "🐈", "☕", "💤"];

function applyTool(
  ctx: CanvasRenderingContext2D,
  stroke: DrawingStroke,
  scale: number
) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalCompositeOperation =
    stroke.tool === "eraser" ? "destination-out" : "source-over";
  ctx.globalAlpha = stroke.tool === "pencil" ? 0.55 : 1;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = Math.max(1, stroke.size * scale);
}

/**
 * Renders strokes onto a context. `progress` (0–1) draws only the first part
 * of the doodle, which is what makes the replay look like it is being drawn.
 */
export function renderDrawing(
  ctx: CanvasRenderingContext2D,
  payload: DrawingPayload,
  width: number,
  height: number,
  progress = 1
) {
  ctx.clearRect(0, 0, width, height);
  const scale = width / 600;
  const strokes = payload.strokes ?? [];
  const totalPoints = strokes.reduce((sum, s) => sum + s.points.length / 2, 0);
  let budget = Math.max(0, Math.round(totalPoints * progress));

  for (const stroke of strokes) {
    const count = stroke.points.length / 2;
    if (budget <= 0) break;
    const take = Math.min(count, budget);
    budget -= take;
    if (take < 1) continue;

    applyTool(ctx, stroke, scale);
    ctx.beginPath();
    for (let i = 0; i < take; i += 1) {
      const x = stroke.points[i * 2] * width;
      const y = stroke.points[i * 2 + 1] * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // A single tap should still leave a dot.
    if (take === 1) {
      ctx.lineTo(stroke.points[0] * width + 0.01, stroke.points[1] * height);
    }
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  const stickers: DrawingSticker[] = payload.stickers ?? [];
  const stickerProgress = progress >= 0.98 ? stickers.length : Math.floor(stickers.length * progress);
  stickers.slice(0, stickerProgress).forEach((sticker) => {
    ctx.font = `${sticker.size * scale}px system-ui, "Apple Color Emoji", "Segoe UI Emoji"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sticker.emoji, sticker.x * width, sticker.y * height);
  });
}

export function countPoints(payload: DrawingPayload): number {
  return (payload.strokes ?? []).reduce((sum, s) => sum + s.points.length / 2, 0);
}

/**
 * Keeps documents small: consecutive points closer than `minDistance` (in
 * normalized units) add nothing a viewer can see.
 */
export function shouldKeepPoint(
  points: number[],
  x: number,
  y: number,
  minDistance = 0.004
): boolean {
  if (points.length < 2) return true;
  const dx = x - points[points.length - 2];
  const dy = y - points[points.length - 1];
  return dx * dx + dy * dy >= minDistance * minDistance;
}
