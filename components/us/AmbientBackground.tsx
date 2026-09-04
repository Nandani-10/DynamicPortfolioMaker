"use client";

import { useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SECRET_MOON_MESSAGES } from "@/lib/us/content";
import { useUs } from "@/components/us/UsProvider";

/**
 * The sky behind everything. It is purely decorative and pointer-transparent,
 * except for the moon: tapping it a few times is one of the hidden things.
 */
export function AmbientBackground() {
  const { phase, notify } = useUs();
  const reduced = useReducedMotion();
  const [moonTaps, setMoonTaps] = useState(0);

  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        id: i,
        left: (i * 37.7) % 100,
        top: (i * 61.3) % 70,
        size: 1 + ((i * 13) % 3) * 0.6,
        delay: ((i * 7) % 40) / 10,
      })),
    []
  );

  const isNight = phase === "night";
  const isEvening = phase === "evening";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Sun, low and warm at dawn, high and pale by day. */}
      {(phase === "dawn" || phase === "day") && (
        <div
          className={reduced ? "" : "us-breathe"}
          style={{
            position: "absolute",
            top: phase === "dawn" ? "18%" : "6%",
            right: phase === "dawn" ? "14%" : "22%",
            width: phase === "dawn" ? 200 : 150,
            height: phase === "dawn" ? 200 : 150,
            borderRadius: "999px",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--us-accent) 55%, transparent) 0%, transparent 68%)",
            filter: "blur(6px)",
          }}
        />
      )}

      {/* Evening haze. */}
      {isEvening && (
        <div
          style={{
            position: "absolute",
            inset: "auto 0 -10% 0",
            height: "55%",
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--us-accent) 30%, transparent), transparent)",
            filter: "blur(20px)",
          }}
        />
      )}

      {/* Stars + moon after dark. */}
      {isNight && (
        <>
          {stars.map((star) => (
            <span
              key={star.id}
              style={{
                position: "absolute",
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.size,
                height: star.size,
                borderRadius: "999px",
                background: "var(--us-text)",
                opacity: 0.5,
                animation: reduced
                  ? undefined
                  : `us-twinkle ${3 + (star.id % 4)}s ease-in-out ${star.delay}s infinite`,
              }}
            />
          ))}
          <button
            type="button"
            aria-label="The moon"
            className="pointer-events-auto absolute right-[12%] top-[12%] h-24 w-24 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 42% 40%, #fdfcff 0%, #e9ecff 60%, #d5d9f2 100%)",
              opacity: 0.9,
              boxShadow:
                "0 0 60px 12px var(--us-glow), inset -8px -10px 22px rgba(110,120,180,0.3)",
            }}
            onClick={() => {
              const next = moonTaps + 1;
              setMoonTaps(next);
              if (next >= 3) {
                const index = Math.min(next - 3, SECRET_MOON_MESSAGES.length - 1);
                notify({ emoji: "🌙", title: SECRET_MOON_MESSAGES[index] });
                if (next - 3 >= SECRET_MOON_MESSAGES.length - 1) setMoonTaps(0);
              }
            }}
          />
        </>
      )}

      {/* Slow clouds, in every phase but night. */}
      {!isNight &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${10 + i * 16}%`,
              left: `${-10 + i * 22}%`,
              width: 260 + i * 60,
              height: 70,
              borderRadius: "999px",
              background:
                "radial-gradient(ellipse at center, color-mix(in srgb, var(--us-surface-solid) 80%, transparent), transparent 70%)",
              filter: "blur(14px)",
              opacity: 0.65,
              animation: reduced
                ? undefined
                : `us-drift ${50 + i * 18}s ease-in-out ${i * 4}s infinite alternate`,
            }}
          />
        ))}

      {/* Grain-free vignette to keep the glass surfaces readable. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 100% at 50% 0%, transparent 40%, color-mix(in srgb, var(--us-bg) 70%, transparent) 100%)",
        }}
      />
    </div>
  );
}
