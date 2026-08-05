"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { TextInput } from "@/components/dashboard/fields";
import { defaultSectionSettings, resolveSections } from "@/lib/sections";
import type { SectionSetting } from "@/types/portfolio";

export default function SectionsEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  // Resolving up front means a portfolio saved before this page existed opens
  // with the full list in its default order rather than an empty screen.
  const [sections, setSections] = useLocalSectionState<SectionSetting[]>(
    portfolio
      ? resolveSections(portfolio.sections).map((section) => ({
          key: section.key,
          label: section.label === section.defaultLabel ? "" : section.label,
          visible: section.visible,
          inNav: section.inNav,
        }))
      : undefined,
    loading
  );
  const [justSaved, setJustSaved] = useState(false);

  if (!sections) {
    return <div className="skeleton h-80" />;
  }

  const resolved = resolveSections(sections);

  function update(index: number, patch: Partial<SectionSetting>) {
    if (!sections) return;
    setSections(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function move(index: number, direction: -1 | 1) {
    if (!sections) return;
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  }

  async function handleSave() {
    if (!sections) return;
    // Drop empty label overrides so the section falls back to its default
    // heading instead of storing a blank string.
    await save({
      sections: sections.map((s) => ({
        key: s.key,
        visible: s.visible,
        inNav: s.inNav,
        ...(s.label?.trim() ? { label: s.label.trim() } : {}),
      })),
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Sections"
      description="Reorder your portfolio, rename any heading, hide what you don't need, and pick which sections appear in the top navigation."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">
          Sections with no content stay hidden on the public page even when visible here.
        </p>
        <button
          type="button"
          onClick={() => setSections(defaultSectionSettings())}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:border-[var(--accent-2)] hover:text-[var(--text)]"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <ol className="space-y-2">
        {sections.map((setting, index) => {
          const definition = resolved[index];
          return (
            <li
              key={setting.key}
              className={`rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3 transition-opacity ${
                setting.visible ? "" : "opacity-55"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${definition.defaultLabel} up`}
                    className="rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === sections.length - 1}
                    aria-label={`Move ${definition.defaultLabel} down`}
                    className="rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <TextInput
                  value={setting.label ?? ""}
                  onChange={(e) => update(index, { label: e.target.value })}
                  placeholder={definition.defaultLabel}
                />

                <button
                  type="button"
                  onClick={() => update(index, { visible: !setting.visible })}
                  aria-pressed={setting.visible}
                  aria-label={
                    setting.visible
                      ? `Hide ${definition.defaultLabel}`
                      : `Show ${definition.defaultLabel}`
                  }
                  className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                >
                  {setting.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>

              <label className="mt-2 flex cursor-pointer items-center gap-2 pl-8 text-xs text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={setting.inNav}
                  disabled={!setting.visible}
                  onChange={(e) => update(index, { inNav: e.target.checked })}
                  className="h-3.5 w-3.5 accent-[var(--accent-2)]"
                />
                Show in top navigation
              </label>
            </li>
          );
        })}
      </ol>
    </SectionEditorShell>
  );
}
