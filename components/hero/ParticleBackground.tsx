"use client";

import { useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

async function initEngine(engine: Engine) {
  await loadSlim(engine);
}

export function ParticleBackground({ accentColor }: { accentColor: string }) {
  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      background: { color: "transparent" },
      particles: {
        number: { value: 46, density: { enable: true, width: 1200, height: 800 } },
        color: { value: accentColor },
        opacity: { value: { min: 0.15, max: 0.5 } },
        size: { value: { min: 1, max: 3 } },
        links: {
          enable: true,
          color: accentColor,
          distance: 130,
          opacity: 0.18,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.6,
          direction: "none",
          random: true,
          straight: false,
          outModes: { default: "out" },
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" },
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.35 } },
        },
      },
    }),
    [accentColor]
  );

  return (
    <ParticlesProvider init={initEngine}>
      <Particles id="hero-particles" className="absolute inset-0" options={options} />
    </ParticlesProvider>
  );
}
