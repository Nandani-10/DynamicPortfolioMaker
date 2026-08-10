"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";

/**
 * Which text fields are on screen right now, and how to write into them.
 *
 * The assistant panel is a sibling of the editors, not a parent, so it has no
 * props path to their state. Fields announce themselves here while mounted and
 * the panel reads the list, which means a reply can be dropped straight into a
 * field without either side knowing about the other.
 *
 * Registration is tied to mount, so navigating between dashboard pages swaps
 * the offered targets automatically — no page ever has to clear the list.
 */

export interface AiField {
  id: string;
  /** What the field is called, e.g. "About bio". */
  label: string;
  /** Distinguishes repeats of the same label, e.g. which project. */
  context?: string;
  apply: (text: string) => void;
}

const fields = new Map<string, AiField>();
const listeners = new Set<() => void>();

/**
 * Rebuilt on every change and cached, because useSyncExternalStore compares
 * snapshots by identity — returning a fresh array each read would loop.
 */
let snapshot: AiField[] = [];
const EMPTY: AiField[] = [];

function publish() {
  snapshot = [...fields.values()];
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Fields currently on screen, in mount order. */
export function useAiFields(): AiField[] {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY
  );
}

/**
 * Offers this field as a target for assistant replies while it's mounted.
 *
 * `apply` is read through a ref rather than captured, so a field whose setter
 * closes over changing state still writes the current value — otherwise a
 * reply inserted after an edit would overwrite it with a stale closure.
 */
export function useRegisterAiField(field: Omit<AiField, "id">): void {
  const id = useId();
  const { label, context, apply } = field;
  const applyRef = useRef(apply);

  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    // The stored callback reads the ref rather than closing over `apply`, so
    // registration doesn't churn on every render of an editor whose handler is
    // an inline arrow.
    fields.set(id, { id, label, context, apply: (text) => applyRef.current(text) });
    publish();
    return () => {
      fields.delete(id);
      publish();
    };
  }, [id, label, context]);
}
