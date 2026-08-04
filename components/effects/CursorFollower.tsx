"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CursorFollower() {
  const [isTouch, setIsTouch] = useState(true);
  const [isPointerFine, setIsPointerFine] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40 });
  const springY = useSpring(y, { stiffness: 500, damping: 40 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setIsPointerFine(fine);
    setIsTouch(!fine);
    if (!fine) return;

    function handleMove(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement | null;
      setHovering(!!target?.closest("a, button, [data-cursor-hover]"));
    }

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [x, y]);

  if (isTouch || !isPointerFine) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[999] hidden rounded-full mix-blend-difference md:block"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        width: hovering ? 48 : 16,
        height: hovering ? 48 : 16,
        background: "white",
        transition: "width 0.25s ease, height 0.25s ease",
      }}
    />
  );
}
