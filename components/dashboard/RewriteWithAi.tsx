"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { useAiSettings } from "@/hooks/useAiSettings";
import { rewriteField } from "@/lib/ai/tasks";
import { AiKeyForm } from "@/components/dashboard/AiKeyForm";
import { TextArea } from "@/components/dashboard/fields";

/**
 * "Rewrite with AI" for one text field.
 *
 * Sits below the input rather than inside its label: `Field` wraps everything
 * in a `<label>`, and a button nested in a label is invalid and swallows its
 * own clicks in some browsers.
 *
 * The rewrite never lands straight in the field — it's shown first, and the
 * owner chooses to keep it. An editor that silently overwrites what someone
 * wrote is a worse tool than one that asks.
 */

const PRESETS = [
  { label: "Shorter", instruction: "Make it shorter and tighter without losing any fact." },
  { label: "Expand", instruction: "Add a little more detail, but only about facts already present." },
  { label: "More professional", instruction: "Make the tone more professional and confident." },
  { label: "More human", instruction: "Make it sound less corporate and more like a real person wrote it." },
  { label: "Fix grammar", instruction: "Fix grammar, spelling and punctuation. Change nothing else." },
];

export function RewriteWithAi({
  label,
  description,
  value,
  onApply,
}: {
  /** How the field is named in the dashboard, e.g. "About — bio". */
  label: string;
  /** One line on what the field is for, so the model picks the right register. */
  description: string;
  value: string;
  onApply: (text: string) => void;
}) {
  const { settings, hasKey } = useAiSettings();
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const empty = value.trim().length === 0;

  function close() {
    setOpen(false);
    setResult(null);
    setError(null);
    setInstruction("");
    abortRef.current?.abort();
  }

  // Escape and outside clicks close the popover, the same as any other menu.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) close();
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function run(extra?: string) {
    if (busy || empty) return;
    const controller = new AbortController();
    abortRef.current = controller;

    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const text = await rewriteField(
        settings,
        {
          label,
          description,
          text: value,
          instruction: extra ?? (instruction.trim() || undefined),
        },
        controller.signal
      );
      setResult(text);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  return (
    <div ref={wrapRef} className="relative mt-1.5 flex justify-end">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        disabled={empty}
        title={empty ? "Write something first" : `Rewrite ${label} with AI`}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--accent-2)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Rewrite with AI
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full z-40 mt-2 w-[min(24rem,calc(100vw-3rem))] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-soft)]"
          >
            {!hasKey ? (
              <AiKeyForm />
            ) : result !== null ? (
              <>
                <p className="mb-2 text-xs font-medium">Suggested rewrite</p>
                <div className="scrollbar-thin max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-alt)] p-3 text-sm leading-relaxed">
                  {result}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onApply(result);
                      close();
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-[linear-gradient(120deg,var(--accent-2),var(--accent-3))] px-3 py-1.5 text-xs font-medium text-white"
                  >
                    <Check className="h-3.5 w-3.5" /> Use this
                  </button>
                  <button
                    type="button"
                    onClick={() => run()}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Try again
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    <X className="h-3.5 w-3.5" /> Discard
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 text-xs text-[var(--text-muted)]">
                  Rewriting <span className="text-[var(--text)]">{label}</span>. It
                  keeps your facts — nothing gets invented.
                </p>

                <div className="mb-2 flex flex-wrap gap-1.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={busy}
                      onClick={() => run(preset.instruction)}
                      className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--text-muted)] transition-colors hover:border-[var(--accent-2)] hover:text-[var(--text)] disabled:opacity-40"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <TextArea
                  rows={2}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Or say what to change…"
                  className="text-xs"
                />

                <button
                  type="button"
                  onClick={() => run()}
                  disabled={busy}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[linear-gradient(120deg,var(--accent-2),var(--accent-3))] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rewriting…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Rewrite
                    </>
                  )}
                </button>

                {error && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-red-400">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {error}
                  </p>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
