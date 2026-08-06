/**
 * Tracks whether any editor on screen holds edits that haven't been saved.
 *
 * A module-level store rather than context because the producers
 * (useLocalSectionState, one per editor section) and the consumer (the
 * dashboard shell, which guards navigation) sit on opposite sides of the
 * route boundary, and threading a `dirty` prop through every editor page
 * would mean touching all of them for one boolean.
 */

const dirtyKeys = new Set<string>();
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function setDirtyState(key: string, dirty: boolean) {
  const had = dirtyKeys.has(key);
  if (dirty === had) return;
  if (dirty) dirtyKeys.add(key);
  else dirtyKeys.delete(key);
  notify();
}

export function clearDirtyState(key: string) {
  if (dirtyKeys.delete(key)) notify();
}

export function subscribeDirtyState(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function hasUnsavedChanges(): boolean {
  return dirtyKeys.size > 0;
}

/** Server snapshot for useSyncExternalStore — nothing is dirty on the server. */
export function noUnsavedChanges(): boolean {
  return false;
}

/**
 * JSON with object keys sorted, so two values that differ only in key order
 * compare equal.
 *
 * Plain `JSON.stringify` isn't safe for the dirty check: Firestore returns
 * document fields in its own order, so a locally-added field (appended by an
 * object spread) would serialise differently from the identical saved
 * document and leave the editor permanently marked unsaved. Array order is
 * preserved — that's real data here, since section order is the array order.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val) => {
    if (val === null || typeof val !== "object" || Array.isArray(val)) return val;
    return Object.fromEntries(
      Object.entries(val as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1))
    );
  });
}
