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
  /** The key came from the app's build-time key, not from this owner. */
  usingSharedKey: boolean;
}

export const PROVIDER_INFO: Record<
  AiProvider,
  { label: string; cost: string; keyUrl: string; keyPlaceholder: string; note: string }
> = {
  gemini: {
    label: "Google Gemini",
    cost: "Free tier",
    keyUrl: "https://aistudio.google.com/apikey",
    // Google issues keys in two shapes — older `AIza…` and newer `AQ.…` — so
    // the placeholder describes the field rather than naming one prefix. The
    // key is never validated by prefix anywhere; only the API can say whether
    // it works, and a client-side format check would reject valid new keys.
    keyPlaceholder: "Paste your Gemini API key",
    note: "Free to use with generous daily limits and no card required. Good enough for writing help and rewrites.",
  },
  anthropic: {
    label: "Anthropic Claude",
    cost: "Paid",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyPlaceholder: "sk-ant-…",
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

/**
 * A Gemini key baked in at build time so the AI features work for everyone
 * without anyone having to bring their own.
 *
 * READ THIS BEFORE SETTING IT. `NEXT_PUBLIC_*` values are inlined into the
 * JavaScript bundle, and this app is a static export with no server to hide a
 * secret behind. Anyone who opens devtools on the deployed site can read this
 * key and spend the quota it belongs to.
 *
 * If you set it, restrict it in Google Cloud Console → Credentials → the key
 * → Application restrictions → Websites, listing only your own domains. That
 * makes casual reuse from another origin fail. It is not airtight — a referrer
 * header can be forged — so never point this at a key on a billed account.
 * Leave it empty and every owner brings their own key instead.
 */
const SHARED_GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";

/** True when the app ships a key, so nobody is forced to supply one. */
export const hasSharedKey = SHARED_GEMINI_KEY.length > 0;

const DEFAULT_SETTINGS: AiSettings = {
  provider: "gemini",
  apiKey: SHARED_GEMINI_KEY,
  usingSharedKey: hasSharedKey,
};

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
    const own = window.localStorage.getItem(keyStorage(provider)) ?? "";

    // An owner's own key always wins: they chose to add it, and it keeps their
    // usage off the shared quota.
    if (own) return { provider, apiKey: own, usingSharedKey: false };
    if (provider === "gemini" && hasSharedKey) {
      return { provider, apiKey: SHARED_GEMINI_KEY, usingSharedKey: true };
    }
    return { provider, apiKey: "", usingSharedKey: false };
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
