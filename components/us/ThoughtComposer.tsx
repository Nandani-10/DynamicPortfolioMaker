"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { THOUGHT_PLACEHOLDERS, pickRandom } from "@/lib/us/content";
import { useUsActions } from "@/hooks/useUsActions";

/**
 * A thought is a note left lying around rather than a message demanding an
 * answer. It lands in the thread *and* in the drawer on the Ours page, where
 * it waits to be found.
 */
export function ThoughtComposer({ onClose }: { onClose: () => void }) {
  const actions = useUsActions();
  const [text, setText] = useState("");
  const [placeholder] = useState(() => pickRandom(THOUGHT_PLACEHOLDERS));
  const [saving, setSaving] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-[58] flex items-end justify-center px-4 pb-6 sm:items-center sm:pb-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Leave a thought"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0"
        style={{ background: "color-mix(in srgb, var(--us-bg) 76%, transparent)" }}
        onClick={onClose}
      />
      <motion.form
        className="us-card relative w-full max-w-md p-5"
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        onSubmit={async (event) => {
          event.preventDefault();
          if (!text.trim() || saving) return;
          setSaving(true);
          try {
            await actions.sendThought(text);
            onClose();
          } finally {
            setSaving(false);
          }
        }}
      >
        <h2 className="us-title text-base font-medium">Leave a little thought</h2>
        <p className="us-muted mt-1 text-sm">
          No reply needed. They&apos;ll find it whenever they open the drawer.
        </p>
        <textarea
          className="us-input mt-3 min-h-24 resize-none"
          placeholder={placeholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={280}
          autoFocus
        />
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" className="us-chip text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="us-primary" disabled={!text.trim() || saving}>
            {saving ? "Leaving it…" : "Leave it"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
