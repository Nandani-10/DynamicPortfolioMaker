"use client";

import { useEffect, useRef, useState } from "react";

export function useLocalSectionState<T>(remoteValue: T | undefined, loading: boolean) {
  const [value, setValue] = useState<T | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && !loading && remoteValue !== undefined) {
      setValue(remoteValue);
      initialized.current = true;
    }
  }, [remoteValue, loading]);

  return [value, setValue] as const;
}
