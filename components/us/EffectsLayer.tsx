"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import { EASTER_EGG_WORDS } from "@/lib/us/content";

export type EffectName =
  | "stars"
  | "sun"
  | "confetti"
  | "petals"
  | "rain"
  | "steam";

const EFFECT_EMOJI: Record<EffectName, string[]> = {
  stars: ["⭐", "✦", "✧"],
  sun: ["☀️", "✨"],
  confetti: ["🎉", "✨", "🎊"],
  petals: ["🌸", "🌷"],
  rain: ["💧"],
  steam: ["☁️", "♨️"],
};

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

interface EffectsContextValue {
  play: (effect: EffectName) => void;
  /** Fires the effect hidden behind a phrase, if the text contains one. */
  playForText: (text: string) => EffectName | null;
}

const EffectsContext = createContext<EffectsContextValue | undefined>(undefined);

let particleSeq = 0;

export function EffectsProvider({ children }: { children: ReactNode }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const reduced = useReducedMotion();

  const play = useCallback(
    (effect: EffectName) => {
      if (reduced) return;
      const emojis = EFFECT_EMOJI[effect];
      const count = effect === "rain" ? 22 : 14;
      const batch: Particle[] = Array.from({ length: count }, (_, i) => ({
        id: ++particleSeq,
        emoji: emojis[i % emojis.length],
        left: 6 + Math.random() * 88,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.4,
        size: 16 + Math.random() * 18,
        drift: (Math.random() - 0.5) * 60,
      }));
      setParticles((prev) => [...prev, ...batch]);
      const ids = new Set(batch.map((p) => p.id));
      window.setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
      }, 3600);

      if (effect === "confetti") {
        // The heavier celebration is worth the extra import, but only here.
        import("canvas-confetti")
          .then((mod) => {
            mod.default({
              particleCount: 70,
              spread: 68,
              startVelocity: 32,
              scalar: 0.9,
              origin: { y: 0.7 },
            });
          })
          .catch(() => {});
      }
    },
    [reduced]
  );

  const playForText = useCallback(
    (text: string) => {
      const haystack = text.toLowerCase();
      const hit = EASTER_EGG_WORDS.find((word) => haystack.includes(word.match));
      if (!hit) return null;
      play(hit.effect as EffectName);
      return hit.effect as EffectName;
    },
    [play]
  );

  const value = useMemo(() => ({ play, playForText }), [play, playForText]);

  return (
    <EffectsContext.Provider value={value}>
      {children}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="absolute bottom-16"
            style={{
              left: `${particle.left}%`,
              fontSize: particle.size,
              // `us-float-up` handles the lift; the drift makes it less uniform.
              animation: `us-float-up ${particle.duration}s ease-out ${particle.delay}s both`,
              transform: `translateX(${particle.drift}px)`,
            }}
          >
            {particle.emoji}
          </span>
        ))}
      </div>
    </EffectsContext.Provider>
  );
}

export function useEffectsLayer(): EffectsContextValue {
  const ctx = useContext(EffectsContext);
  if (!ctx) throw new Error("useEffectsLayer must be used inside EffectsProvider");
  return ctx;
}
