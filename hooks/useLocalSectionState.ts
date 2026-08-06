"use client";

import { useEffect, useId, useRef, useState } from "react";
import { clearDirtyState, setDirtyState, stableStringify } from "@/lib/dirty-state";

export function useLocalSectionState<T>(remoteValue: T | undefined, loading: boolean) {
  const [value, setValue] = useState<T | null>(null);
  const initialized = useRef(false);
  const dirtyKey = useId();

  useEffect(() => {
    if (!initialized.current && !loading && remoteValue !== undefined) {
      setValue(remoteValue);
      initialized.current = true;
    }
  }, [remoteValue, loading]);

  /**
   * Report unsaved edits so the shell can warn before navigation. Comparing
   * serialised values keeps this honest in both directions: a save lands in
   * Firestore, the snapshot listener updates remoteValue, and the flag clears
   * on its own without the editor pages having to say so.
   */
  useEffect(() => {
    if (!initialized.current || value === null || remoteValue === undefined) return;
    setDirtyState(dirtyKey, stableStringify(value) !== stableStringify(remoteValue));
  }, [value, remoteValue, dirtyKey]);

  useEffect(() => () => clearDirtyState(dirtyKey), [dirtyKey]);

  return [value, setValue] as const;
}
