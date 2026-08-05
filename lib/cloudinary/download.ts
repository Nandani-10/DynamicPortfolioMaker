/**
 * Cloudinary serves uploaded files inline by default, so a link to a PDF hands
 * it to the browser's built-in viewer instead of downloading it. Inserting the
 * `fl_attachment` flag into the delivery URL makes Cloudinary respond with
 * `Content-Disposition: attachment`, which is what actually triggers a save.
 *
 * (The HTML `download` attribute can't do this — browsers ignore it on
 * cross-origin URLs, and every Cloudinary URL is cross-origin here.)
 */

const CLOUDINARY_HOST = "res.cloudinary.com";
const UPLOAD_MARKER = "/upload/";

/** Cloudinary appends the real extension itself, so pass a bare name. */
function toSafeFilename(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Returns a URL that downloads rather than previews. Non-Cloudinary URLs (an
 * owner can paste a link to a resume hosted anywhere) are returned untouched —
 * we have no control over their headers.
 */
export function toAttachmentUrl(url: string, filename?: string): string {
  if (!url) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.hostname !== CLOUDINARY_HOST) return url;
  if (parsed.pathname.includes("fl_attachment")) return url;

  const markerIndex = parsed.pathname.indexOf(UPLOAD_MARKER);
  if (markerIndex === -1) return url;

  const safeName = filename ? toSafeFilename(filename) : "";
  const flag = safeName ? `fl_attachment:${safeName}` : "fl_attachment";
  const insertAt = markerIndex + UPLOAD_MARKER.length;

  parsed.pathname =
    parsed.pathname.slice(0, insertAt) + flag + "/" + parsed.pathname.slice(insertAt);

  return parsed.toString();
}
