"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { ProjectItem } from "@/types/portfolio";

/**
 * Full-bleed horizontal gallery: oversized cards in mixed organic shapes
 * gliding through an endless loop, tilting toward the cursor, drifting at
 * different parallax depths, and lit by a highlight that follows the pointer.
 *
 * The loop is driven by an animation frame rather than a CSS keyframe. A
 * keyframe can't be eased in and out — hovering would snap the motion dead —
 * and it leaves no per-frame hook for the parallax and tilt to read from.
 */

const CURSOR_LABEL = "( OPEN )";
/** Pixels per second. Slow enough to read as ambient drift, not a carousel. */
const SPEED = 46;

/**
 * Shape language, cycled by index. Mixing silhouettes is what stops a row of
 * images reading as a plain filmstrip.
 */
const SHAPES = [
  { name: "capsule", radius: "9999px", aspect: "aspect-[3/4.6]" },
  { name: "rect", radius: "1.75rem", aspect: "aspect-[4/5]" },
  { name: "blob", radius: "62% 38% 46% 54% / 54% 46% 54% 46%", aspect: "aspect-square" },
  { name: "arch", radius: "14rem 14rem 2rem 2rem", aspect: "aspect-[3/4.2]" },
  { name: "circle", radius: "50%", aspect: "aspect-square" },
  { name: "blob-alt", radius: "38% 62% 57% 43% / 43% 57% 43% 57%", aspect: "aspect-[4/4.4]" },
] as const;

/** Keeps a value inside [min, max) — the seam that makes the loop endless. */
function wrap(min: number, max: number, value: number): number {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

function GalleryCard({
  project,
  index,
  scrollProgress,
  onOpen,
  onHoverChange,
}: {
  project: ProjectItem;
  index: number;
  scrollProgress: MotionValue<number>;
  onOpen: () => void;
  onHoverChange: (hovering: boolean) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const shape = SHAPES[index % SHAPES.length];

  // Tilt, driven by where the pointer sits within the card. Springs give the
  // motion weight so it settles rather than tracking the cursor rigidly.
  const tiltX = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: 0.5 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: 0.5 });
  // Magnetic pull toward the cursor.
  const pullX = useSpring(useMotionValue(0), { stiffness: 180, damping: 20, mass: 0.6 });
  const pullY = useSpring(useMotionValue(0), { stiffness: 180, damping: 20, mass: 0.6 });

  // Parallax: alternating depths so the row separates into planes instead of
  // sliding as one flat sheet.
  const depth = 1 + (index % 3) * 0.9;
  const parallaxY = useTransform(scrollProgress, [0, 1], [depth * 34, depth * -34]);

  function handleMove(event: React.MouseEvent<HTMLButtonElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const relX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relY = (event.clientY - bounds.top) / bounds.height - 0.5;
    tiltY.set(relX * 16);
    tiltX.set(relY * -16);
    pullX.set(relX * 22);
    pullY.set(relY * 22);
  }

  function reset() {
    tiltX.set(0);
    tiltY.set(0);
    pullX.set(0);
    pullY.set(0);
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onOpen}
      onMouseMove={handleMove}
      onMouseEnter={() => {
        setHovered(true);
        onHoverChange(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHoverChange(false);
        reset();
      }}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
      aria-label={`Open ${project.title}`}
      style={{
        x: pullX,
        y: parallaxY,
        rotateX: tiltX,
        rotateY: tiltY,
        translateZ: hovered ? 80 : 0,
        transformStyle: "preserve-3d",
      }}
      animate={{ scale: hovered ? 1.06 : 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      data-shape={shape.name}
      className={`group/card relative h-full shrink-0 ${shape.aspect} cursor-pointer bg-transparent outline-none`}
    >
      <span
        aria-hidden
        style={{ borderRadius: shape.radius }}
        className="absolute inset-0 overflow-hidden"
      >
        {project.thumbnail && (
          <Image
            src={project.thumbnail}
            alt=""
            fill
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-110"
            sizes="(min-width: 768px) 28rem, 70vw"
          />
        )}

        {/* Glass sheet that lifts as the card comes forward. */}
        <span
          className={`absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85),rgba(0,0,0,0.1)_45%,transparent)] transition-opacity duration-500 ${
            hovered ? "opacity-100" : "opacity-70"
          }`}
        />

        <span
          className={`absolute inset-x-0 bottom-0 p-5 text-left transition-all duration-500 ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <span className="block font-[family-name:var(--font-display)] text-base font-medium text-white">
            {project.title}
          </span>
          {project.techStack.length > 0 && (
            <span className="mt-1 block truncate text-xs text-white/65">
              {project.techStack.slice(0, 3).join(" · ")}
            </span>
          )}
        </span>
      </span>

      {/* Accent glow behind the card, strongest when it's forward. */}
      <span
        aria-hidden
        style={{ borderRadius: shape.radius }}
        className={`pointer-events-none absolute -inset-4 -z-10 blur-2xl transition-opacity duration-500 ${
          hovered ? "opacity-45" : "opacity-0"
        } bg-[radial-gradient(circle_at_center,var(--accent-2),transparent_70%)]`}
      />
    </motion.button>
  );
}

export function ProjectMarquee({
  projects,
  onOpen,
}: {
  projects: ProjectItem[];
  onOpen: (project: ProjectItem) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pointerInside, setPointerInside] = useState(false);
  const [hovering, setHovering] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const baseX = useMotionValue(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const cursorX = useSpring(pointerX, { stiffness: 280, damping: 28, mass: 0.4 });
  const cursorY = useSpring(pointerY, { stiffness: 280, damping: 28, mass: 0.4 });
  // Eases the drift to a stop on hover instead of snapping it.
  const speed = useSpring(useMotionValue(SPEED), { stiffness: 90, damping: 24 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  useAnimationFrame((_, delta) => {
    if (reducedMotion) return;
    const half = (trackRef.current?.scrollWidth ?? 0) / 2;
    if (half === 0) return;
    speed.set(hovering ? 0 : SPEED);
    // Wrapping at exactly half the track width lands on an identical frame,
    // so the restart is invisible.
    baseX.set(wrap(-half, 0, baseX.get() - (speed.get() * delta) / 1000));
  });

  const withThumbnails = projects.filter((project) => project.thumbnail);
  // Under four cards the duplicated track is too short to fill a wide screen
  // and the seam becomes visible.
  if (withThumbnails.length < 4) return null;

  const cards = [...withThumbnails, ...withThumbnails];

  function handlePointerMove(event: React.MouseEvent<HTMLDivElement>) {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    pointerX.set(event.clientX - bounds.left);
    pointerY.set(event.clientY - bounds.top);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onMouseEnter={() => setPointerInside(true)}
      onMouseLeave={() => {
        setPointerInside(false);
        setHovering(false);
      }}
      // Full-bleed: escape the section's max-width so the gallery runs edge to
      // edge. The vertical padding gives the scaled/glowing cards room.
      className="relative left-1/2 mb-16 w-screen -translate-x-1/2 overflow-hidden py-10"
      style={{ perspective: 1400 }}
    >
      {/* Edges fade into the page so cards enter and leave rather than being
          chopped off at the viewport. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-32 bg-[linear-gradient(to_right,var(--bg),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-20 w-32 bg-[linear-gradient(to_left,var(--bg),transparent)]"
      />

      <motion.div
        ref={trackRef}
        style={{ x: baseX, transformStyle: "preserve-3d" }}
        className="flex h-[22rem] w-max gap-8 px-8 sm:h-[26rem]"
      >
        {cards.map((project, index) => (
          <GalleryCard
            // The list is duplicated, so ids repeat — index disambiguates.
            key={`${project.id}-${index}`}
            project={project}
            index={index}
            scrollProgress={scrollYProgress}
            onOpen={() => onOpen(project)}
            onHoverChange={setHovering}
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {pointerInside && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ x: cursorX, y: cursorY }}
            className="pointer-events-none absolute left-0 top-0 z-30 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[10px] font-medium tracking-[0.18em] text-white shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
          >
            {CURSOR_LABEL}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
