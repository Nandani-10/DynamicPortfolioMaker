"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CONVERSATION_STARTERS,
  JUST_BE_HERE_LINES,
  MESSAGE_CATEGORIES,
  pickRandom,
} from "@/lib/us/content";
import type { MessageType } from "@/types/us";

/**
 * The signature feature: "I want to talk, but I don't know how."
 *
 * Three doors, none of which require you to produce a sentence — say
 * something, ask something, or just be present. Every line can be swapped
 * before it goes anywhere.
 */
export function IntrovertMode({
  onPick,
  onEdit,
}: {
  onPick: (text: string, type: MessageType) => void;
  onEdit?: (text: string) => void;
}) {
  const [mode, setMode] = useState<"say" | "ask" | "here" | null>(null);
  const [line, setLine] = useState<string | null>(null);

  // Statements only — the "ask something" door is where questions come from.
  const allSoftLines = MESSAGE_CATEGORIES.flatMap((category) =>
    category.id === "start" ? [] : category.lines
  );

  function generate(next: "say" | "ask" | "here") {
    setMode(next);
    const source =
      next === "say" ? allSoftLines : next === "ask" ? CONVERSATION_STARTERS : JUST_BE_HERE_LINES;
    setLine(pickRandom(source, line ?? undefined));
  }

  const type: MessageType = mode === "ask" ? "question" : "text";

  return (
    <div className="us-card p-5">
      <h2 className="us-title text-lg font-medium">
        I want to talk, but I don&apos;t know how
      </h2>
      <p className="us-muted mt-1 text-sm">No pressure. Pick a door.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Door
          active={mode === "say"}
          title="Say something for me"
          hint="A natural, ordinary message"
          onClick={() => generate("say")}
        />
        <Door
          active={mode === "ask"}
          title="Ask something for me"
          hint="A question to open the door"
          onClick={() => generate("ask")}
        />
        <Door
          active={mode === "here"}
          title="Just be here"
          hint="No topic, no expectation"
          onClick={() => generate("here")}
        />
      </div>

      {line && (
        <motion.div
          key={line}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="us-soft mt-4 p-4"
        >
          <p className="text-[0.95rem] leading-relaxed">{line}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="us-primary text-xs"
              onClick={() => onPick(line, type)}
            >
              Send this
            </button>
            <button
              type="button"
              className="us-chip text-xs"
              onClick={() => mode && generate(mode)}
            >
              ↻ Another one
            </button>
            {onEdit && (
              <button type="button" className="us-chip text-xs" onClick={() => onEdit(line)}>
                ✎ Change the words
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Door({
  title,
  hint,
  onClick,
  active,
}: {
  title: string;
  hint: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="us-soft p-3 text-left transition"
      style={{
        borderColor: active ? "var(--us-accent)" : "var(--us-border)",
        background: active
          ? "color-mix(in srgb, var(--us-accent) 14%, transparent)"
          : undefined,
      }}
    >
      <span className="block text-sm font-medium">{title}</span>
      <span className="us-muted mt-0.5 block text-xs">{hint}</span>
    </button>
  );
}
