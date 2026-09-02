"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import {
  DRAWING_ASPECT,
  DRAWING_COLORS,
  DRAWING_STICKERS,
  renderDrawing,
  shouldKeepPoint,
} from "@/lib/us/drawing";
import { DRAWING_PROMPTS, pickRandom } from "@/lib/us/content";
import type { DrawingPayload, DrawingSticker, DrawingStroke } from "@/types/us";

type Tool = "pen" | "pencil" | "eraser" | "sticker";

/**
 * A small drawing pad. Strokes are captured in normalized coordinates so the
 * same doodle replays correctly on a phone and on a laptop.
 */
export function DrawCanvas({
  onSend,
  onCancel,
  sending,
}: {
  onSend: (payload: DrawingPayload) => void | Promise<void>;
  onCancel?: () => void;
  sending?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [stickers, setStickers] = useState<DrawingSticker[]>([]);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(DRAWING_COLORS[1]);
  const [size, setSize] = useState(4);
  const [sticker, setSticker] = useState(DRAWING_STICKERS[0]);
  const [note, setNote] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const drawing = useRef(false);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = width / DRAWING_ASPECT;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    renderDrawing(ctx, { strokes, stickers }, width, height, 1);
  }, [strokes, stickers]);

  useEffect(() => {
    paint();
  }, [paint]);

  useEffect(() => {
    const onResize = () => paint();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [paint]);

  function positionOf(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  }

  function handleDown(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const { x, y } = positionOf(event);

    if (tool === "sticker") {
      setStickers((prev) => [...prev, { emoji: sticker, x, y, size: 34 }]);
      return;
    }

    drawing.current = true;
    setStrokes((prev) => [
      ...prev,
      {
        color: tool === "eraser" ? "#000000" : color,
        size: tool === "pencil" ? Math.max(1, size - 1) : size,
        tool,
        points: [x, y],
      },
    ]);
  }

  function handleMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const { x, y } = positionOf(event);
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (!shouldKeepPoint(last.points, x, y)) return prev;
      const next = [...prev];
      next[next.length - 1] = { ...last, points: [...last.points, x, y] };
      return next;
    });
  }

  function handleUp() {
    drawing.current = false;
  }

  function undo() {
    // Undo peels back whichever mark was made last.
    if (stickers.length > 0 && strokes.length === 0) {
      setStickers((prev) => prev.slice(0, -1));
      return;
    }
    setStrokes((prev) => prev.slice(0, -1));
  }

  const isEmpty = strokes.length === 0 && stickers.length === 0;

  return (
    <div className="us-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="us-title text-sm font-medium">
          {prompt ?? "Draw something for them"}
        </p>
        <button
          type="button"
          className="us-chip text-xs"
          onClick={() => setPrompt(pickRandom(DRAWING_PROMPTS, prompt ?? undefined))}
        >
          🎲 Prompt
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full touch-none rounded-2xl border"
        style={{
          background: "var(--us-surface-solid)",
          borderColor: "var(--us-border)",
          aspectRatio: `${DRAWING_ASPECT}`,
          cursor: tool === "sticker" ? "copy" : "crosshair",
        }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        onPointerCancel={handleUp}
        aria-label="Drawing canvas"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(["pen", "pencil", "eraser", "sticker"] as Tool[]).map((option) => (
          <button
            key={option}
            type="button"
            className="us-chip text-xs capitalize"
            data-active={tool === option}
            onClick={() => setTool(option)}
          >
            {option === "pen" ? "✒️" : option === "pencil" ? "✏️" : option === "eraser" ? "🧽" : "😊"}{" "}
            {option}
          </button>
        ))}
        <button type="button" className="us-chip text-xs" onClick={undo} disabled={isEmpty}>
          ↩ Undo
        </button>
        <button
          type="button"
          className="us-chip text-xs"
          onClick={() => {
            setStrokes([]);
            setStickers([]);
          }}
          disabled={isEmpty}
        >
          Clear
        </button>
      </div>

      {tool === "sticker" ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {DRAWING_STICKERS.map((option) => (
            <button
              key={option}
              type="button"
              className="us-chip px-2 py-1 text-base"
              data-active={sticker === option}
              onClick={() => setSticker(option)}
              aria-label={`Sticker ${option}`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5">
            {DRAWING_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                aria-label={`Colour ${option}`}
                onClick={() => {
                  setColor(option);
                  if (tool === "eraser") setTool("pen");
                }}
                className="h-6 w-6 rounded-full border-2 transition"
                style={{
                  background: option,
                  borderColor:
                    color === option ? "var(--us-accent)" : "var(--us-border)",
                  transform: color === option ? "scale(1.15)" : undefined,
                }}
              />
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs us-muted">
            Size
            <input
              type="range"
              min={1}
              max={18}
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
              className="w-24 accent-[var(--us-accent)]"
            />
          </label>
        </div>
      )}

      <input
        className="us-input mt-3"
        placeholder="Say something about it (optional)"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={140}
      />

      <div className="mt-3 flex items-center justify-end gap-2">
        {onCancel && (
          <button type="button" className="us-chip text-sm" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button
          type="button"
          className="us-primary"
          disabled={isEmpty || sending}
          onClick={() =>
            onSend({
              strokes,
              stickers,
              note: note.trim() ? note.trim() : undefined,
            })
          }
        >
          {sending ? "Sending…" : "Send drawing"}
        </button>
      </div>
    </div>
  );
}
