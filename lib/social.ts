/**
 * Pulls the handle out of a GitHub profile URL so the import panels can
 * prefill it from the social links the owner already entered. Returns an
 * empty string for anything that isn't a github.com profile — including repo
 * URLs, which would otherwise yield the owner's handle plus a repo name.
 */
export function githubUsernameFromUrl(url?: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (!/(^|\.)github\.com$/i.test(parsed.hostname)) return "";
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.length === 1 ? segments[0] : "";
  } catch {
    return "";
  }
}
