"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";

/**
 * Click-to-flip card. The two faces are stacked and rotated in 3D, so both
 * need to occupy the same box — the caller sets a fixed height rather than
 * letting content size it, otherwise the back face clips.
 *
 * Exposed as a button so it's reachable by keyboard and announced as
 * interactive; the flip state is mirrored via aria-pressed.
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

  return (
    <div className={`[perspective:1600px] ${heightClass} ${className ?? ""}`}>
      <motion.button
        type="button"
        aria-pressed={flipped}
        aria-label={flipped ? "Show summary" : "Show details"}
        onClick={() => setFlipped((v) => !v)}
        className="relative h-full w-full cursor-pointer text-left [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">{front}</div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </motion.button>
    </div>
  );
}
