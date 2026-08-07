"use client";

import { useState } from "react";
import { Check, ExternalLink, KeyRound, Trash2 } from "lucide-react";
import { useAiSettings } from "@/hooks/useAiSettings";
import { PROVIDER_INFO, type AiProvider } from "@/lib/ai/settings";
import { TextInput } from "@/components/dashboard/fields";

/** Masks all but the last four characters, so it's recognisable but not readable. */
function mask(key: string): string {
  return key.length <= 8 ? "••••" : `${"•".repeat(12)}${key.slice(-4)}`;
}

const PROVIDERS = Object.keys(PROVIDER_INFO) as AiProvider[];

export function AiKeyForm() {
  const { settings, update, hasKey } = useAiSettings();
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const info = PROVIDER_INFO[settings.provider];

  function save() {
    if (!draft.trim()) return;
    update({ apiKey: draft });
    setDraft("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
      <p className="mb-1 flex items-center gap-2 text-sm font-medium">
        <KeyRound className="h-4 w-4 text-[var(--accent-2)]" /> AI provider
      </p>
      <p className="mb-3 text-xs leading-relaxed text-[var(--text-muted)]">
        The AI features call the provider directly from your browser using your
        own key. Your portfolio is a static site with no server of its own, so
        there&apos;s nowhere to keep a shared key.
      </p>

      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        {PROVIDERS.map((provider) => {
          const option = PROVIDER_INFO[provider];
          const active = settings.provider === provider;
          return (
            <button
              key={provider}
              type="button"
              onClick={() => update({ provider })}
              aria-pressed={active}
              className={`rounded-xl border p-3 text-left transition-colors ${
                active
                  ? "border-[var(--accent-2)] bg-[var(--surface)]"
                  : "border-[var(--border)] hover:border-[var(--text-muted)]"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium">{option.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    option.cost === "Free tier"
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-[var(--surface-alt)] text-[var(--text-muted)]"
                  }`}
                >
                  {option.cost}
                </span>
              </span>
              <span className="mt-1.5 block text-[11px] leading-relaxed text-[var(--text-muted)]">
                {option.note}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mb-2 text-xs text-[var(--text-muted)]">
        Get a {info.label} key from{" "}
        <a
          href={info.keyUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[var(--accent-3)] hover:underline"
        >
          {new URL(info.keyUrl).hostname}
          <ExternalLink className="h-3 w-3" />
        </a>
        .
      </p>

      {hasKey ? (
        <div className="flex items-center gap-3">
          <code className="flex-1 truncate rounded-lg bg-[var(--surface)] px-3 py-2 text-xs">
            {mask(settings.apiKey)}
          </code>
          <button
            type="button"
            onClick={() => update({ apiKey: "" })}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <TextInput
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              }
            }}
            placeholder={info.keyPrefix}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={save}
            disabled={!draft.trim()}
            className="shrink-0 rounded-xl bg-[linear-gradient(120deg,var(--accent-2),var(--accent-3))] px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      )}

      {saved && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-500">
          <Check className="h-3.5 w-3.5" /> Saved to this browser.
        </p>
      )}

      <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--text-muted)]">
        <strong className="font-medium text-[var(--text)]">
          Stored in this browser only.
        </strong>{" "}
        It is never written to your portfolio document — those are readable by
        anyone with the link, which is what makes your public page work, so a
        key saved there would be published too. It also isn&apos;t synced
        between devices: you&apos;ll enter it again on another browser. Anyone
        with access to this machine can read it, so use a key you&apos;re
        willing to rotate.
      </p>
    </div>
  );
}
