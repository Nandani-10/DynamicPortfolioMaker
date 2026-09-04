"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  CHALLENGES,
  COMPLIMENTS,
  CONVERSATION_STARTERS,
  DRAWING_PROMPTS,
  MESSAGE_CATEGORIES,
  pickRandom,
} from "@/lib/us/content";
import { useUs } from "@/components/us/UsProvider";
import { useUsActions } from "@/hooks/useUsActions";
import { useEffectsLayer } from "@/components/us/EffectsLayer";
import type { MessageType } from "@/types/us";

interface Surprise {
  kind: string;
  title: string;
  text: string;
  /** Present when the surprise is something you can send as-is. */
  sendAs?: MessageType;
  href?: string;
  hrefLabel?: string;
}

/** 🎁 — one tap, one small unpredictable thing. */
export function SurpriseBox({ onClose }: { onClose: () => void }) {
  const { memories, nameFor } = useUs();
  const actions = useUsActions();
  const { play } = useEffectsLayer();
  const [surprise, setSurprise] = useState<Surprise | null>(null);
  const [sent, setSent] = useState(false);

  function draw() {
    setSent(false);
    const roll = Math.floor(Math.random() * 8);
    switch (roll) {
      case 0:
        setSurprise({
          kind: "compliment",
          title: "Something true",
          text: pickRandom(COMPLIMENTS),
          sendAs: "surprise",
        });
        break;
      case 1:
        setSurprise({
          kind: "question",
          title: "A question to ask",
          text: pickRandom(CONVERSATION_STARTERS),
          sendAs: "question",
        });
        break;
      case 2: {
        const memory = memories.length
          ? memories[Math.floor(Math.random() * memories.length)]
          : null;
        setSurprise(
          memory
            ? {
                kind: "memory",
                title: `From ${new Date(`${memory.date}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}`,
                text: `${memory.title}${memory.caption ? ` — ${memory.caption}` : ""} (saved by ${nameFor(memory.authorUid)})`,
                href: "/us/memories",
                hrefLabel: "Open the memory wall",
              }
            : {
                kind: "memory",
                title: "No memories saved yet",
                text: "Add the first one — a photo, a date, a line about what happened.",
                href: "/us/memories",
                hrefLabel: "Start the memory wall",
              }
        );
        break;
      }
      case 3:
        setSurprise({
          kind: "cute",
          title: "Say this",
          text: pickRandom(
            MESSAGE_CATEGORIES.find((c) => c.id === "small")?.lines ?? ["Hi."]
          ),
          sendAs: "text",
        });
        break;
      case 4:
        setSurprise({
          kind: "game",
          title: "Play something",
          text: "This or That, Would You Rather, or Two Truths — winner gets bragging rights.",
          href: "/us/play",
          hrefLabel: "Open the games",
        });
        break;
      case 5:
        setSurprise({
          kind: "challenge",
          title: "A tiny challenge",
          text: pickRandom(CHALLENGES),
          sendAs: "surprise",
        });
        break;
      case 6:
        setSurprise({
          kind: "draw",
          title: "Draw this",
          text: pickRandom(DRAWING_PROMPTS),
          href: "/us/chat",
          hrefLabel: "Open the canvas",
        });
        break;
      default:
        play("stars");
        setSurprise({
          kind: "hidden",
          title: "Nothing to do",
          text: "This one is just a small moment. Nothing to answer.",
        });
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[58] flex items-center justify-center px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Surprise"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0"
        style={{ background: "color-mix(in srgb, var(--us-bg) 78%, transparent)" }}
        onClick={onClose}
      />

      <motion.div
        className="us-card relative w-full max-w-sm p-6 text-center"
        initial={{ scale: 0.9, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <AnimatePresence mode="wait">
          {!surprise ? (
            <motion.div key="closed" exit={{ opacity: 0, scale: 0.9 }}>
              <motion.button
                type="button"
                onClick={draw}
                className="text-6xl"
                whileHover={{ scale: 1.08, rotate: -4 }}
                whileTap={{ scale: 0.94 }}
                aria-label="Open the surprise"
              >
                🎁
              </motion.button>
              <p className="us-muted mt-4 text-sm">Tap it. No idea what&apos;s inside.</p>
            </motion.div>
          ) : (
            <motion.div
              key={surprise.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="us-muted text-[0.65rem] uppercase tracking-[0.2em]">
                {surprise.title}
              </p>
              <p className="us-title mt-3 text-lg leading-snug">{surprise.text}</p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {surprise.sendAs && !sent && (
                  <button
                    type="button"
                    className="us-primary text-sm"
                    onClick={async () => {
                      await actions.sendText(surprise.text, undefined, surprise.sendAs);
                      setSent(true);
                    }}
                  >
                    Send it to them
                  </button>
                )}
                {sent && <span className="us-chip text-xs">Sent ✓</span>}
                {surprise.href && (
                  <Link href={surprise.href} className="us-chip text-xs" onClick={onClose}>
                    {surprise.hrefLabel}
                  </Link>
                )}
                <button type="button" className="us-chip text-xs" onClick={draw}>
                  ↻ Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button type="button" className="us-muted mt-6 text-xs" onClick={onClose}>
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
