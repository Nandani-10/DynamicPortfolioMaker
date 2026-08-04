"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { THEME_PRESETS } from "@/lib/themes";
import type { PortfolioTheme, ThemeMode, ThemePreset } from "@/types/portfolio";

const MODES: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "Match visitor's system" },
  { value: "light", label: "Always light" },
  { value: "dark", label: "Always dark" },
];

export default function ThemeEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [theme, setTheme] = useLocalSectionState<PortfolioTheme>(portfolio?.theme, loading);
  const [justSaved, setJustSaved] = useState(false);

  if (!theme) return <div className="skeleton h-80" />;

  async function handleSave() {
    if (!theme) return;
    await save({ theme });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Theme"
      description="Pick a color palette and mode for your public portfolio."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Color palette
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.values(THEME_PRESETS).map((preset) => {
            const active = theme.preset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTheme({ ...theme, preset: preset.id as ThemePreset })}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  active
                    ? "border-[var(--accent-2)] bg-[var(--surface-alt)]"
                    : "border-[var(--border)] hover:border-[var(--accent-2)]/60"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                  {preset.swatch.map((c) => (
                    <span key={c} className="h-full w-1/3" style={{ background: c }} />
                  ))}
                </span>
                <span className="flex-1 text-sm font-medium">{preset.label}</span>
                {active && <Check className="h-4 w-4 text-[var(--accent-2)]" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Appearance
        </p>
        <div className="flex flex-wrap gap-2">
          {MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setTheme({ ...theme, mode: mode.value })}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                theme.mode === mode.value
                  ? "border-[var(--accent-2)] bg-[var(--surface-alt)]"
                  : "border-[var(--border)] hover:border-[var(--accent-2)]/60"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </SectionEditorShell>
  );
}
