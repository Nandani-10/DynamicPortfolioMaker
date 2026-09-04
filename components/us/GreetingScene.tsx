"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MORNING_REPLIES, NIGHT_REPLIES, REACTIONS } from "@/lib/us/content";

interface GreetingSceneProps {
  kind: "morning" | "night";
  text: string;
  /** Shown above the card, e.g. "From Nandani". Omitted when you sent it. */
  from?: string;
  /** Reply chips only make sense on a card you received. */
  onReply?: (text: string) => void;
  onReact?: (emoji: string) => void;
  onClose: () => void;
}

/**
 * A full-screen little film. Morning is a sunrise: the sky warms up, the sun
 * climbs from below the card, light spreads, birds cross, dust floats through
 * the rays. Night is the opposite: the sky deepens, stars fade in and twinkle,
 * the moon glows, and a shooting star crosses once.
 *
 * Both settle into the same quiet ending — the message, and an easy way to
 * answer it without having to think of words.
 */
export function GreetingScene({
  kind,
  text,
  from,
  onReply,
  onReact,
  onClose,
}: GreetingSceneProps) {
  const reduced = useReducedMotion();
  const [settled, setSettled] = useState(Boolean(reduced));
  const isMorning = kind === "morning";

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setSettled(true), 3400);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  // Close on Escape — the scene is skippable at any point.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: (i * 41.3) % 100,
        top: (i * 27.7) % 100,
        size: 1 + ((i * 17) % 3) * 0.7,
        delay: ((i * 11) % 30) / 10,
      })),
    []
  );

  const motes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: 8 + ((i * 33) % 84),
        delay: ((i * 13) % 30) / 8,
        duration: 6 + ((i * 7) % 5),
        size: 3 + ((i * 5) % 4),
      })),
    []
  );

  // An opaque floor under the animated gradients: whatever happens above it,
  // the page behind the scene never shows through.
  const skyBase = isMorning ? "#1d1b34" : "#5a4a72";
  const sky = isMorning
    ? [
        "linear-gradient(180deg,#1d1b34 0%,#4a3358 45%,#7d4d5a 100%)",
        "linear-gradient(180deg,#5f5f9a 0%,#c98a76 55%,#f0b183 100%)",
        "linear-gradient(180deg,#a9c6ea 0%,#f4c7a1 55%,#fde3c4 100%)",
      ]
    : [
        "linear-gradient(180deg,#5a4a72 0%,#8a6a7a 55%,#d69a72 100%)",
        "linear-gradient(180deg,#26264a 0%,#3a3560 55%,#5b4a72 100%)",
        "linear-gradient(180deg,#080c1c 0%,#101736 55%,#1a2246 100%)",
      ];

  const replies = isMorning ? MORNING_REPLIES : NIGHT_REPLIES;
  const reactions = isMorning
    ? ["☀️", "⭐", "🥹", "😌", "😴"]
    : ["🌙", "⭐", "🥹", "😌", "😴"];

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      role="dialog"
      aria-modal="true"
      aria-label={isMorning ? "Good morning" : "Good night"}
    >
      {/* Sky. Gradients can't be tweened, so the three stages are stacked and
          revealed in turn — each new stage fades in *over* the one below,
          which stays put. Cross-fading them instead would let the page show
          through in the middle of the transition. */}
      <div className="absolute inset-0" style={{ background: skyBase }} />
      {sky.map((background, index) => (
        <motion.div
          key={background}
          className="absolute inset-0"
          style={{ background }}
          initial={{ opacity: index === 0 ? 1 : 0 }}
          animate={{
            opacity: reduced
              ? 1
              : index === 0
                ? 1
                : index === 1
                  ? [0, 1, 1]
                  : [0, 0, 1],
          }}
          transition={{
            duration: reduced ? 0 : 4.2,
            times: [0, 0.45, 1],
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Sun climbing, or moon fading up */}
      {isMorning ? (
        <>
          <motion.div
            className="absolute left-1/2 h-56 w-56 -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle,#fff3d0 0%,#ffd08a 45%,rgba(255,180,110,0) 72%)",
            }}
            initial={{ bottom: "-30%", opacity: 0.2, scale: 0.8 }}
            animate={{ bottom: reduced ? "48%" : ["-30%", "20%", "48%"], opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0 : 4, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Light rays spreading outward once the sun is up */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[130vmax] w-[130vmax] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(255,224,170,0.22) 0deg, transparent 14deg, rgba(255,224,170,0.18) 30deg, transparent 46deg, rgba(255,224,170,0.22) 62deg, transparent 78deg, rgba(255,224,170,0.16) 96deg, transparent 112deg, rgba(255,224,170,0.2) 130deg, transparent 150deg, rgba(255,224,170,0.18) 170deg, transparent 190deg, rgba(255,224,170,0.2) 215deg, transparent 235deg, rgba(255,224,170,0.16) 260deg, transparent 280deg, rgba(255,224,170,0.2) 305deg, transparent 325deg, rgba(255,224,170,0.18) 345deg, transparent 360deg)",
              maskImage: "radial-gradient(circle, black 10%, transparent 62%)",
              WebkitMaskImage: "radial-gradient(circle, black 10%, transparent 62%)",
            }}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: reduced ? 0.4 : [0, 0.9, 0.55], rotate: reduced ? 0 : 24 }}
            transition={{ duration: reduced ? 0 : 6, ease: "linear" }}
          />
          {/* Birds — two small strokes crossing the sky, once. */}
          {!reduced &&
            [0, 1, 2].map((i) => (
              <motion.svg
                key={i}
                width="34"
                height="16"
                viewBox="0 0 34 16"
                className="absolute"
                style={{ top: `${18 + i * 7}%` }}
                initial={{ left: "-12%", opacity: 0 }}
                animate={{ left: "110%", opacity: [0, 0.8, 0.8, 0] }}
                transition={{ duration: 7 + i, delay: 1.6 + i * 0.5, ease: "easeInOut" }}
              >
                <path
                  d="M1 9 Q8 1 16 8 Q24 1 33 9"
                  fill="none"
                  stroke="rgba(60,40,30,0.55)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </motion.svg>
            ))}
          {/* Dust motes drifting through the light */}
          {!reduced &&
            motes.map((mote) => (
              <span
                key={mote.id}
                className="absolute bottom-[18%] rounded-full bg-white/60"
                style={{
                  left: `${mote.left}%`,
                  width: mote.size,
                  height: mote.size,
                  animation: `us-float-up ${mote.duration}s ease-out ${mote.delay}s infinite`,
                }}
              />
            ))}
        </>
      ) : (
        <>
          {stars.map((star) => (
            <motion.span
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.size,
                height: star.size,
                animation: reduced
                  ? undefined
                  : `us-twinkle ${2.5 + (star.id % 4)}s ease-in-out ${star.delay}s infinite`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 2.5, delay: reduced ? 0 : 1 + star.delay * 0.3 }}
            />
          ))}
          <motion.div
            className="absolute right-[18%] h-32 w-32 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 42% 40%, #fdfcff 0%, #eceeff 55%, #dcdff5 78%, #cfd4ee 100%)",
              boxShadow:
                "0 0 70px 18px rgba(150,165,255,0.35), inset -10px -12px 26px rgba(120,130,190,0.28)",
            }}
            initial={{ top: "26%", opacity: 0, scale: 0.9 }}
            animate={{ top: reduced ? "14%" : ["26%", "14%"], opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0 : 3.6, ease: [0.16, 1, 0.3, 1] }}
          />
          {!reduced && (
            <span
              className="absolute left-[12%] top-[16%] h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-white to-transparent"
              style={{ animation: "us-shooting-star 2.4s ease-in 2.6s 1 both" }}
            />
          )}
        </>
      )}

      {/* Slow clouds in both scenes, lighter at night */}
      {!reduced &&
        [0, 1].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${30 + i * 22}%`,
              left: `${-15 + i * 30}%`,
              width: 320 + i * 90,
              height: 80,
              background: isMorning
                ? "radial-gradient(ellipse at center, rgba(255,255,255,0.55), transparent 70%)"
                : "radial-gradient(ellipse at center, rgba(180,195,255,0.16), transparent 70%)",
              filter: "blur(16px)",
              animation: `us-drift ${40 + i * 16}s ease-in-out infinite alternate`,
            }}
          />
        ))}

      {/* The message itself */}
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-[1.75rem] border border-white/25 bg-white/12 p-7 text-center backdrop-blur-xl"
        style={{
          boxShadow: isMorning
            ? "0 30px 90px -30px rgba(255,190,120,0.75), 0 0 60px rgba(255,215,170,0.25)"
            : "0 30px 90px -30px rgba(120,140,255,0.6), 0 0 60px rgba(150,165,255,0.2)",
        }}
        initial={{ opacity: 0, y: 26, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: reduced ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {from && (
          <p className="mb-2 text-[0.7rem] uppercase tracking-[0.22em] text-white/70">
            {from}
          </p>
        )}
        <p className="us-title text-2xl font-medium leading-snug text-white drop-shadow">
          {text}
        </p>
      </motion.div>

      {/* The gentle landing: react, or answer without thinking */}
      <AnimatePresence>
        {settled && (
          <motion.div
            className="relative z-10 mt-7 w-full max-w-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {onReact && (
              <div className="mb-4 flex justify-center gap-2">
                {reactions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-lg backdrop-blur transition hover:scale-110"
                    aria-label={
                      REACTIONS.find((r) => r.emoji === emoji)?.label ?? "React"
                    }
                    onClick={() => {
                      onReact(emoji);
                      onClose();
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {onReply && (
              <>
                <p className="mb-3 text-center text-sm text-white/80">
                  Want to send something back?
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {replies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      className="rounded-full border border-white/25 bg-white/12 px-3.5 py-1.5 text-sm text-white backdrop-blur transition hover:bg-white/20"
                      onClick={() => {
                        onReply(reply);
                        onClose();
                      }}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-sm text-white/65 underline-offset-4 hover:underline"
                onClick={onClose}
              >
                {onReply ? "Not now" : "Close"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
