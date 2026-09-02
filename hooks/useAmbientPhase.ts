"use client";

import { useEffect, useState } from "react";
import { currentPhase, type AmbientPhase } from "@/lib/us/ambient";

/**
 * The couple space's palette follows the clock. Starting from a fixed value
 * and correcting after mount keeps the static export's HTML deterministic.
 */
export function useAmbientPhase(): AmbientPhase {
  const [phase, setPhase] = useState<AmbientPhase>("day");

  useEffect(() => {
    setPhase(currentPhase());
    const timer = window.setInterval(() => setPhase(currentPhase()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return phase;
}
