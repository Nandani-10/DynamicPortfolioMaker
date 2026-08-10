"use client";

import { useSyncExternalStore } from "react";

/** The origin never changes while the page is open, so there's nothing to subscribe to. */
const subscribe = () => () => {};

/**
 * The site's origin, for building the owner's public link.
 *
 * Read through useSyncExternalStore rather than `window.location.origin`
 * directly: this is a static export, so the HTML is generated at build time
 * where there is no origin. The server snapshot is empty and React swaps in
 * the real value after hydration, instead of the two disagreeing.
 */
export function useSiteOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => ""
  );
}
