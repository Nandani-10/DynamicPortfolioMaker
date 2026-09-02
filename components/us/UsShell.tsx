"use client";

import type { ReactNode } from "react";
import { useAmbientPhase } from "@/hooks/useAmbientPhase";
import { UsGate } from "@/components/us/UsGate";
import { AmbientBackground } from "@/components/us/AmbientBackground";
import { UsToasts } from "@/components/us/UsToasts";
import { UsNav } from "@/components/us/UsNav";
import { EffectsProvider } from "@/components/us/EffectsLayer";

/**
 * Frame for every page in the space: the ambient sky, the soft notifications
 * and the tab bar, all of which live inside the gate so nothing renders until
 * the right person is signed in.
 */
export function UsShell({ children }: { children: ReactNode }) {
  const phase = useAmbientPhase();

  return (
    <div className="us-root" data-phase={phase}>
      <UsGate phase={phase}>
        <EffectsProvider>
          <AmbientBackground />
          <UsToasts />
          <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10">
            {children}
          </main>
          <UsNav />
        </EffectsProvider>
      </UsGate>
    </div>
  );
}
