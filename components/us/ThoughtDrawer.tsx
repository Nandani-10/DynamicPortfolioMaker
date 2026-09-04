"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUs } from "@/components/us/UsProvider";
import { discoverThought, deleteThought } from "@/lib/us/store";
import { useEffectsLayer } from "@/components/us/EffectsLayer";
import { relativeTime } from "@/lib/us/format";
import { ThoughtComposer } from "@/components/us/ThoughtComposer";

/**
 * Thoughts the other person left behind. Unopened ones stay folded until you
 * tap them — the point is finding something, not being notified at it.
 */
export function ThoughtDrawer() {
  const { thoughts, uid, partner } = useUs();
  const { play } = useEffectsLayer();
  const [writing, setWriting] = useState(false);
  const [opened, setOpened] = useState<string | null>(null);

  const forMe = thoughts.filter((thought) => thought.authorUid !== uid);
  const waiting = forMe.filter((thought) => !thought.discoveredAt);
  const found = forMe.filter((thought) => thought.discoveredAt);
  const mine = thoughts.filter((thought) => thought.authorUid === uid);

  return (
    <section className="us-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="us-title text-base font-medium">💭 Thought drawer</h2>
        <button type="button" className="us-chip text-xs" onClick={() => setWriting(true)}>
          Leave one
        </button>
      </div>

      {waiting.length > 0 ? (
        <>
          <p className="us-muted mt-3 text-sm">
            {waiting.length} folded note{waiting.length === 1 ? "" : "s"} from{" "}
            {partner?.name?.split(" ")[0] ?? "them"}.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {waiting.map((thought) => (
              <motion.button
                key={thought.id}
                type="button"
                whileHover={{ y: -3, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className="us-soft px-4 py-3 text-2xl"
                aria-label="Open this thought"
                onClick={() => {
                  setOpened(thought.id);
                  play("stars");
                  discoverThought(thought.id, uid).catch(() => {});
                }}
              >
                ✉️
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <p className="us-muted mt-3 text-sm">
          Nothing waiting. Leave one for {partner?.name?.split(" ")[0] ?? "them"} instead —
          they&apos;ll find it later.
        </p>
      )}

      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="us-soft mt-3 p-4 text-[0.95rem] leading-relaxed">
              {thoughts.find((thought) => thought.id === opened)?.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {(found.length > 0 || mine.length > 0) && (
        <div className="mt-5 space-y-2">
          <p className="us-muted text-[0.65rem] uppercase tracking-[0.2em]">Already found</p>
          {[...found, ...mine]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 12)
            .map((thought) => (
              <div key={thought.id} className="us-soft flex items-start gap-3 p-3">
                <span className="text-sm">{thought.authorUid === uid ? "🖊️" : "✉️"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{thought.text}</p>
                  <p className="us-muted mt-1 text-[0.68rem]">
                    {thought.authorUid === uid ? "You" : partner?.name?.split(" ")[0] ?? "Them"} ·{" "}
                    {relativeTime(thought.createdAt)}
                  </p>
                </div>
                {thought.authorUid === uid && (
                  <button
                    type="button"
                    className="us-muted text-xs"
                    aria-label="Delete this thought"
                    onClick={() => deleteThought(thought.id).catch(() => {})}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
        </div>
      )}

      <AnimatePresence>
        {writing && <ThoughtComposer onClose={() => setWriting(false)} />}
      </AnimatePresence>
    </section>
  );
}
