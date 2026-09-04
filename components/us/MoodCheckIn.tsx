"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MOODS } from "@/lib/us/content";
import { useUs } from "@/components/us/UsProvider";
import { useUsActions } from "@/hooks/useUsActions";
import { relativeTime } from "@/lib/us/format";

/** "How are you feeling today?" — one tap, optionally a few words. */
export function MoodCheckIn() {
  const { me, partner } = useUs();
  const actions = useUsActions();
  const [picked, setPicked] = useState<{ emoji: string; label: string } | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  // Twelve chips at once is a wall; six is a question you can answer.
  const [showAll, setShowAll] = useState(false);
  const moods = showAll ? MOODS : MOODS.slice(0, 6);

  return (
    <section className="us-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="us-title text-base font-medium">How are you feeling today?</h2>
        {me?.mood && (
          <span className="us-muted text-xs">
            You: {me.mood.emoji} {relativeTime(me.mood.at)}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {moods.map((mood) => {
          const active = picked?.label === mood.label;
          return (
            <motion.button
              key={mood.label}
              type="button"
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -2 }}
              className="us-chip text-xs"
              data-active={active}
              onClick={() => setPicked(active ? null : mood)}
            >
              <span className="text-base leading-none">{mood.emoji}</span> {mood.label}
            </motion.button>
          );
        })}
        {!showAll && (
          <button
            type="button"
            className="us-chip text-xs"
            onClick={() => setShowAll(true)}
          >
            More
          </button>
        )}
      </div>

      {picked && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex flex-col gap-2 sm:flex-row"
        >
          <input
            className="us-input flex-1"
            placeholder={`${picked.label}, because… (optional)`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={120}
          />
          <button
            type="button"
            className="us-primary"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await actions.sendMood(picked, note);
                setPicked(null);
                setNote("");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "…" : "Share it"}
          </button>
        </motion.div>
      )}

      {partner?.mood && (
        <p className="us-muted mt-3 text-xs">
          {partner.name} felt {partner.mood.emoji} {partner.mood.label.toLowerCase()}{" "}
          {relativeTime(partner.mood.at)}.
        </p>
      )}
    </section>
  );
}
