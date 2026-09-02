"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MESSAGE_CATEGORIES, pickSome } from "@/lib/us/content";

/**
 * "I don't know what to say", made concrete: pick a feeling, get four ways to
 * say it, then send / regenerate / edit. Nothing is generated over the network,
 * so it works instantly and offline.
 */
export function SuggestionSheet({
  onSend,
  onUseInComposer,
  compact,
}: {
  onSend: (text: string) => void | Promise<void>;
  /** Drops the line into the input instead of sending it, for editing. */
  onUseInComposer?: (text: string) => void;
  compact?: boolean;
}) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  const category = MESSAGE_CATEGORIES.find((c) => c.id === categoryId) ?? null;

  function choose(id: string) {
    const next = MESSAGE_CATEGORIES.find((c) => c.id === id);
    if (!next) return;
    setCategoryId(id);
    setOptions(pickSome(next.lines, 4));
  }

  return (
    <div className={compact ? "" : "us-card p-5"}>
      {!compact && (
        <>
          <h2 className="us-title text-lg font-medium">I don&apos;t know what to say</h2>
          <p className="us-muted mt-1 text-sm">
            Pick the feeling. The words are already here.
          </p>
        </>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {MESSAGE_CATEGORIES.map((option) => (
          <button
            key={option.id}
            type="button"
            className="us-chip text-xs"
            data-active={categoryId === option.id}
            onClick={() => choose(option.id)}
          >
            <span aria-hidden>{option.emoji}</span> {option.label}
          </button>
        ))}
      </div>

      {category && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          {options.map((line) => (
            <div
              key={line}
              className="us-soft flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <p className="text-sm leading-snug">{line}</p>
              <div className="flex shrink-0 items-center gap-1.5">
                {onUseInComposer && (
                  <button
                    type="button"
                    className="us-chip px-2 py-1 text-xs"
                    onClick={() => onUseInComposer(line)}
                    aria-label="Edit before sending"
                  >
                    ✎
                  </button>
                )}
                <button
                  type="button"
                  className="us-primary px-3 py-1.5 text-xs"
                  onClick={() => onSend(line)}
                >
                  Send
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="us-chip mt-1 text-xs"
            onClick={() => setOptions(pickSome(category.lines, 4))}
          >
            ↻ Show me others
          </button>
        </motion.div>
      )}
    </div>
  );
}
