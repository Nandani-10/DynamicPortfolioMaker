"use client";

/**
 * Pulls plain text out of a resume PDF entirely in the browser.
 *
 * The site is a static export with no server, so there's nowhere to run a
 * server-side parser — pdf.js does the work on the client instead. It's
 * imported lazily so its ~1MB of worker code only loads when someone
 * actually imports a resume.
 */

export class ResumeExtractError extends Error {}

/** Words on a line are separated by gaps; pdf.js gives us positioned items. */
interface PositionedItem {
  str: string;
  transform: number[];
  hasEOL?: boolean;
}

/**
 * pdf.js returns text as positioned fragments, not lines. Grouping by their
 * y-coordinate rebuilds the visual lines, which is what every heuristic in
 * the parser depends on — "Email: x@y.com" is only a useful signal if the
 * label and value stay on the same line.
 */
function itemsToLines(items: PositionedItem[]): string[] {
  const rows = new Map<number, { x: number; str: string }[]>();

  for (const item of items) {
    if (!item.str.trim()) continue;
    const x = item.transform[4];
    const y = Math.round(item.transform[5]);
    // Round to the nearest 2pt so slight baseline jitter doesn't split a line.
    const key = Math.round(y / 2) * 2;
    const row = rows.get(key);
    if (row) row.push({ x, str: item.str });
    else rows.set(key, [{ x, str: item.str }]);
  }

  return [...rows.entries()]
    // PDF y-coordinates grow upward, so descending y is top-to-bottom.
    .sort((a, b) => b[0] - a[0])
    .map(([, row]) =>
      row
        .sort((a, b) => a.x - b.x)
        .map((cell) => cell.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

export async function extractPdfLines(file: File): Promise<string[]> {
  const pdfjs = await import("pdfjs-dist");

  // The worker ships with the package; resolving it through import.meta.url
  // lets the bundler emit it as an asset rather than fetching from a CDN,
  // which the site's static hosting wouldn't serve.
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  let document;
  try {
    const buffer = await file.arrayBuffer();
    document = await pdfjs.getDocument({ data: buffer }).promise;
  } catch {
    throw new ResumeExtractError(
      "That PDF couldn't be opened. If it's password-protected, remove the password and try again."
    );
  }

  const lines: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    lines.push(...itemsToLines(content.items as PositionedItem[]));
  }

  if (lines.join("").trim().length < 40) {
    throw new ResumeExtractError(
      "No text found in that PDF — it looks like a scan or an image. Only PDFs with selectable text can be read."
    );
  }

  return lines;
}
