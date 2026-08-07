"use client";

/**
 * Which AI provider the owner uses, and their key for it.
 *
 * Two providers because they trade off differently: Gemini has a free tier
 * that covers this app's usage, Claude does not but writes better. The owner
 * picks; nothing here assumes one.
 */

export type AiProvider = "gemini" | "anthropic";

export interface AiSettings {
  provider: AiProvider;
  apiKey: string;
}

export const PROVIDER_INFO: Record<
  AiProvider,
  { label: string; cost: string; keyUrl: string; keyPrefix: string; note: string }
> = {
  gemini: {
    label: "Google Gemini",
    cost: "Free tier",
    keyUrl: "https://aistudio.google.com/apikey",
    keyPrefix: "AIza…",
    note: "Free to use with generous daily limits and no card required. Good enough for writing help and rewrites.",
  },
  anthropic: {
    label: "Anthropic Claude",
    cost: "Paid",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyPrefix: "sk-ant-…",
    note: "Noticeably better writing, but there is no free tier — usage is billed to your Anthropic account (fractions of a cent per rewrite).",
  },
};

/**
 * localStorage, deliberately NOT Firestore.
 *
 * `portfolios/{username}` is world-readable by design — that's what lets the
 * public page load without auth — so a key written there would be published
 * to anyone who fetched the document.
 */
const PROVIDER_STORAGE = "portfolio-maker:ai-provider";
/**
 * Keyed by provider: the two key formats aren't interchangeable, so switching
 * providers has to switch keys with it rather than hand a Gemini key to
 * Anthropic.
 */
const keyStorage = (provider: AiProvider) => `portfolio-maker:ai-key:${provider}`;

const DEFAULT_SETTINGS: AiSettings = { provider: "gemini", apiKey: "" };

function isProvider(value: string | null): value is AiProvider {
  return value === "gemini" || value === "anthropic";
}

export function readSettings(): AiSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = window.localStorage.getItem(PROVIDER_STORAGE);
    // Gemini by default — it's the one with a free tier, so it's the option
    // that works without a billing account.
    const provider = isProvider(stored) ? stored : "gemini";
    return {
      provider,
      apiKey: window.localStorage.getItem(keyStorage(provider)) ?? "",
    };
  } catch {
    // Private browsing can throw on localStorage access.
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: AiSettings): void {
  try {
    window.localStorage.setItem(PROVIDER_STORAGE, settings.provider);
    const storageKey = keyStorage(settings.provider);
    if (settings.apiKey) window.localStorage.setItem(storageKey, settings.apiKey);
    else window.localStorage.removeItem(storageKey);
  } catch {
    // The caller surfaces its own error state.
  }
}

/** The key already saved for a provider, used when switching between them. */
export function readKeyFor(provider: AiProvider): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(keyStorage(provider)) ?? "";
  } catch {
    return "";
  }
}
