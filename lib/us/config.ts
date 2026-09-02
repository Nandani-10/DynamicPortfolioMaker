/**
 * Configuration for the private couple space.
 *
 * This is deliberately a *closed* app: two people, one shared space, nobody
 * else. Access is gated on an email allowlist that has to be supplied through
 * env vars, and the same two addresses must be repeated in `firestore.rules`
 * so the database enforces it too (the client-side check alone is only a UI
 * nicety — the rules are the real lock).
 */

export const SPACE_ID = process.env.NEXT_PUBLIC_US_SPACE_ID || "us";

/** The two (and only two) accounts allowed in, lower-cased. */
export const ALLOWED_EMAILS: string[] = (process.env.NEXT_PUBLIC_US_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/** Without an allowlist there is no space to enter — that is the safe default. */
export const isSpaceConfigured = ALLOWED_EMAILS.length > 0;

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email || !isSpaceConfigured) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}

/** Optional shared PIN — a soft second lock for an already-unlocked phone. */
export const SPACE_PIN = (process.env.NEXT_PUBLIC_US_PIN || "").trim();
export const isPinEnabled = SPACE_PIN.length > 0;

export const PIN_STORAGE_KEY = "us:unlocked-until";
/** How long a PIN unlock lasts before it is asked for again. */
export const PIN_TTL_MS = 12 * 60 * 60 * 1000;
