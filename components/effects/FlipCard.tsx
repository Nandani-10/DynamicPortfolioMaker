"use client";

import { motion } from "framer-motion";
import { useState, type KeyboardEvent, type ReactNode } from "react";

/**
 * Click-to-flip card. The two faces are stacked and rotated in 3D, so both
 * need to occupy the same box — the caller sets a fixed height rather than
 * letting content size it, otherwise the back face clips.
 *
 * The faces carry their own links and buttons (repo links, a full-view
 * control), which is why this is a div with role="button" rather than a real
 * <button>: interactive elements can't legally nest inside one. Keyboard
 * support is wired by hand to compensate, and key presses that originate
 * from a nested control are left alone so Enter on a link still follows it.
 */
export function FlipCard({
  front,
  back,
  className,
  heightClass = "h-[26rem]",
}: {
  front: ReactNode;
  back: ReactNode;
  className?: string;
  heightClass?: string;
}) {
  const [flipped, setFlipped] = useState(false);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault(); // Space would otherwise scroll the page.
    setFlipped((v) => !v);
  }

  return (
    <div className={`[perspective:1600px] ${heightClass} ${className ?? ""}`}>
      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? "Show summary" : "Show details"}
        onClick={() => setFlipped((v) => !v)}
        onKeyDown={handleKeyDown}
        className="group/flip relative h-full w-full cursor-pointer text-left [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">{front}</div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </motion.div>
    </div>
  );
}
