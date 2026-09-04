/**
 * Configuration for the private couple space.
 *
 * This is deliberately a *closed* app: two people, one shared space, nobody
 * else. Note what isn't here — the guest list. Who may enter lives only in
 * `firestore.rules`, as a pair of hashes, so neither address appears in this
 * repository or in the JavaScript served to browsers. The app discovers
 * whether it is welcome by asking the database and handling the refusal.
 */

export const SPACE_ID = process.env.NEXT_PUBLIC_US_SPACE_ID || "us";

/** Optional shared PIN — a soft second lock for an already-unlocked phone. */
export const SPACE_PIN = (process.env.NEXT_PUBLIC_US_PIN || "").trim();
export const isPinEnabled = SPACE_PIN.length > 0;

export const PIN_STORAGE_KEY = "us:unlocked-until";
/** How long a PIN unlock lasts before it is asked for again. */
export const PIN_TTL_MS = 12 * 60 * 60 * 1000;
