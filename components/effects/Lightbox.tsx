"use client";

import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * Modal overlay shared by the certificate viewer and the project detail view:
 * closes on Escape or a backdrop click, and locks the page behind it so the
 * background doesn't scroll under the dialog.
 */
export function Lightbox({
  label,
  onClose,
  children,
  maxWidthClass = "max-w-3xl",
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-full w-full ${maxWidthClass} flex-col overflow-hidden rounded-2xl bg-[var(--surface)]`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
