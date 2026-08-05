/**
 * Turns Firebase Auth error codes into something a person can act on.
 *
 * The failures that actually bite in production are configuration ones
 * (unauthorized domain, provider not enabled), and Firebase reports those
 * as opaque codes while the popup just blinks shut. Naming the fix in the
 * message is the difference between a five-second and a five-hour debug.
 */
export function describeAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  const host = typeof window !== "undefined" ? window.location.hostname : "this domain";

  switch (code) {
    case "auth/unauthorized-domain":
      return `This site's domain (${host}) isn't authorized for sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.`;
    case "auth/operation-not-allowed":
    case "auth/configuration-not-found":
      return "Google sign-in isn't enabled for this Firebase project. Enable it in Firebase Console → Authentication → Sign-in method.";
    case "auth/popup-closed-by-user":
      return "The sign-in window was closed before finishing. Please try again.";
    case "auth/cancelled-popup-request":
      return "Another sign-in attempt is already open.";
    case "auth/network-request-failed":
      return "Network error reaching Firebase. Check your connection and try again.";
    case "auth/internal-error":
      return "Firebase returned an internal error. This usually means the Google provider is misconfigured — check Authentication → Sign-in method.";
    case "":
      return error instanceof Error ? error.message : "Sign-in failed. Please try again.";
    default:
      return `Sign-in failed (${code}). Please try again.`;
  }
}

/** Popup can't work here (blocked, or an in-app/embedded browser) — use redirect. */
export function shouldFallBackToRedirect(error: unknown): boolean {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  return (
    code === "auth/popup-blocked" ||
    code === "auth/operation-not-supported-in-this-environment"
  );
}
