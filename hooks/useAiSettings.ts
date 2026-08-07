"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  readKeyFor,
  readSettings,
  writeSettings,
  type AiSettings,
} from "@/lib/ai/settings";

/**
 * Shares the AI provider + key across every component that needs them, so
 * saving in the settings panel immediately enables the assistant and the
 * rewrite buttons without a reload.
 */

const listeners = new Set<() => void>();
let cached: AiSettings | null = null;

const SERVER_SNAPSHOT: AiSettings = { provider: "gemini", apiKey: "" };

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AiSettings {
  // useSyncExternalStore compares snapshots by identity and re-reads on every
  // render, so this has to be a stable object rather than a fresh read.
  if (cached === null) cached = readSettings();
  return cached;
}

/** Server render has no localStorage; the client corrects it after hydration. */
function getServerSnapshot(): AiSettings {
  return SERVER_SNAPSHOT;
}

function publish(next: AiSettings) {
  cached = next;
  for (const listener of listeners) listener();
}

export function useAiSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = useCallback((patch: Partial<AiSettings>) => {
    const current = getSnapshot();
    const provider = patch.provider ?? current.provider;
    // Switching providers picks up whatever key was already saved for the one
    // being switched to, rather than carrying the old provider's key across.
    const apiKey =
      typeof patch.apiKey === "string"
        ? patch.apiKey.trim()
        : provider === current.provider
          ? current.apiKey
          : readKeyFor(provider);

    const next: AiSettings = { provider, apiKey };
    writeSettings(next);
    publish(next);
  }, []);

  return { settings, update, hasKey: settings.apiKey.length > 0 };
}
