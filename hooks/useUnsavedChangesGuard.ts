"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  hasUnsavedChanges,
  noUnsavedChanges,
  subscribeDirtyState,
} from "@/lib/dirty-state";

/**
 * Warns before losing unsaved edits, and returns whether any exist so the UI
 * can say so too.
 *
 * Two exits need covering. Closing or reloading the tab is handled by
 * `beforeunload`. In-app navigation isn't: the App Router has no navigation
 * event to cancel, so link clicks are intercepted during the capture phase
 * before Next's own handler sees them.
 */
export function useUnsavedChangesGuard(): boolean {
  const router = useRouter();
  const dirty = useSyncExternalStore(
    subscribeDirtyState,
    hasUnsavedChanges,
    noUnsavedChanges
  );

  useEffect(() => {
    if (!dirty) return;

    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      // Browsers show their own wording; assigning returnValue is what
      // actually triggers the prompt.
      e.returnValue = "";
    }

    function onClickCapture(e: MouseEvent) {
      // Let modified clicks through — they open a new tab, so this one keeps
      // its unsaved state.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || href.startsWith("#")) return;
      if (anchor.target && anchor.target !== "_self") return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname) return;

      e.preventDefault();
      e.stopPropagation();
      const leave = window.confirm(
        "You have unsaved changes on this page. Leave without saving?"
      );
      if (leave) router.push(destination.pathname + destination.search);
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, [dirty, router]);

  return dirty;
}
