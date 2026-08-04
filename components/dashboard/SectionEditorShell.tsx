"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { PageFadeIn } from "@/components/effects/PageFadeIn";

interface SectionEditorShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSave: () => void;
  saving?: boolean;
  saved?: boolean;
  error?: string | null;
  saveDisabled?: boolean;
}

export function SectionEditorShell({
  title,
  description,
  children,
  onSave,
  saving,
  saved,
  error,
  saveDisabled,
}: SectionEditorShellProps) {
  return (
    <PageFadeIn>
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          {title}
        </h1>
        {description && <p className="text-sm text-[var(--text-muted)]">{description}</p>}
      </div>

      <div className="space-y-6">{children}</div>

      <div className="sticky bottom-4 z-10 mt-8 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-5 py-3 shadow-[var(--shadow-soft)] backdrop-blur">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          {saving && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          )}
          {!saving && saved && (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> All changes saved
            </>
          )}
          {!saving && error && (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-red-400" /> {error}
            </>
          )}
        </div>
        <Button onClick={onSave} disabled={saving || saveDisabled} className="!px-5 !py-2 text-xs">
          Save changes
        </Button>
      </div>
    </PageFadeIn>
  );
}
