"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUs } from "@/components/us/UsProvider";

/**
 * Notifications here are meant to feel like someone leaving something for you,
 * not like an app demanding attention: no counts, no sounds, no red.
 */
export function UsToasts() {
  const { toasts, dismissToast } = useUs();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            layout
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={() => dismissToast(toast.id)}
            className="us-card pointer-events-auto flex w-full max-w-sm items-center gap-3 px-4 py-3 text-left"
          >
            <span className="text-xl">{toast.emoji ?? "💌"}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{toast.title}</span>
              {toast.body && (
                <span className="us-muted block truncate text-xs">{toast.body}</span>
              )}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
