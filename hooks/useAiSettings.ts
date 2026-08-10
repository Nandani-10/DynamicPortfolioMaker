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

const SERVER_SNAPSHOT: AiSettings = {
  provider: "gemini",
  apiKey: "",
  usingSharedKey: false,
};

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

    // Only ever persist a key the owner typed. `current.apiKey` may be the
    // app's shared key, and writing that to their storage would freeze them on
    // today's value and hide the fact that it isn't theirs.
    let ownKey: string;
    if (typeof patch.apiKey === "string") ownKey = patch.apiKey.trim();
    // Switching providers picks up whatever key was saved for the one being
    // switched to, rather than carrying the old provider's key across.
    else if (provider !== current.provider) ownKey = readKeyFor(provider);
    else ownKey = current.usingSharedKey ? "" : current.apiKey;

    writeSettings({ provider, apiKey: ownKey, usingSharedKey: false });
    // Re-read rather than assume: clearing an own key should fall back to the
    // shared one, and only readSettings knows that rule.
    publish(readSettings());
  }, []);

  return { settings, update, hasKey: settings.apiKey.length > 0 };
}
