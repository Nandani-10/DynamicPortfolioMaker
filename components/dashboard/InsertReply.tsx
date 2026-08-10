"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CornerDownLeft } from "lucide-react";
import { useAiFields } from "@/lib/ai/field-registry";

/**
 * "Use this" under an assistant reply: drops the text straight into one of the
 * fields on the current dashboard page.
 *
 * With exactly one field on screen it's a single button — asking someone to
 * choose from a list of one is a click for nothing. With several it opens a
 * picker, and with none it renders nothing rather than offering an action that
 * can't go anywhere.
 */
export function InsertReply({ text }: { text: string }) {
  const fields = useAiFields();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (fields.length === 0 || !text.trim()) return null;

  function insert(apply: (value: string) => void) {
    apply(text.trim());
    setOpen(false);
    setDone(true);
    // Long enough to read, short enough that the button is usable again if the
    // reply suits a second field too.
    setTimeout(() => setDone(false), 2500);
  }

  if (done) {
    return (
      <span className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-500">
        <Check className="h-3.5 w-3.5" /> Added — remember to save the page.
      </span>
    );
  }

  const single = fields.length === 1 ? fields[0] : null;

  return (
    <div ref={wrapRef} className="relative mt-1.5">
      <button
        type="button"
        onClick={() => (single ? insert(single.apply) : setOpen((v) => !v))}
        aria-expanded={single ? undefined : open}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--accent-2)]"
      >
        <CornerDownLeft className="h-3.5 w-3.5" />
        {single ? `Use this in ${single.label}` : "Use this…"}
      </button>

      {open && !single && (
        <div className="absolute bottom-full left-0 z-50 mb-1 max-h-64 w-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-soft)]">
          <p className="px-2 py-1.5 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
            Insert into
          </p>
          {fields.map((field) => (
            <button
              key={field.id}
              type="button"
              onClick={() => insert(field.apply)}
              className="block w-full rounded-lg px-2 py-1.5 text-left text-xs hover:bg-[var(--surface-alt)]"
            >
              {field.label}
              {field.context && (
                <span className="block truncate text-[11px] text-[var(--text-muted)]">
                  {field.context}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
