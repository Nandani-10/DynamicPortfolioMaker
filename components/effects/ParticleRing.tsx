"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// three.js needs a real canvas, so keep it out of the static prerender and
// off the initial bundle — the scene only loads once this scrolls into view.
const ParticleRingScene = dynamic(
  () => import("@/components/effects/ParticleRingScene"),
  { ssr: false }
);

export function ParticleRing({
  palette,
  className,
}: {
  palette: string[];
  className?: string;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Skip the WebGL scene entirely for reduced-motion visitors.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden className={className}>
      <ParticleRingScene palette={palette} />
    </div>
  );
}
