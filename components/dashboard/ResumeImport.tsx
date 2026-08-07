"use client";

import { useRef, useState } from "react";
import { AlertCircle, FileText, Loader2, UploadCloud, Wand2 } from "lucide-react";
import { extractPdfLines, ResumeExtractError } from "@/lib/resume/extract-text";
import { parseResume, type ParsedResume } from "@/lib/resume/parse";
import type { Portfolio, SocialLinks } from "@/types/portfolio";

/** One reviewable row: what you have now vs what the resume suggests. */
interface Row {
  key: string;
  label: string;
  current: string;
  incoming: string;
  /** Applied to a draft portfolio when the row is accepted. */
  apply: (draft: Portfolio) => void;
}

const SOCIAL_LABELS: [keyof SocialLinks, string][] = [
  ["github", "GitHub"],
  ["linkedin", "LinkedIn"],
  ["twitter", "Twitter / X"],
  ["instagram", "Instagram"],
  ["dribbble", "Dribbble"],
  ["website", "Website"],
];

function summarize(text: string, limit = 90): string {
  const trimmed = text.trim();
  return trimmed.length > limit ? `${trimmed.slice(0, limit)}…` : trimmed;
}

function buildRows(parsed: ParsedResume, portfolio: Portfolio): Row[] {
  const rows: Row[] = [];

  if (parsed.name) {
    rows.push({
      key: "name",
      label: "Name",
      current: portfolio.hero.name,
      incoming: parsed.name,
      apply: (draft) => {
        draft.hero = { ...draft.hero, name: parsed.name! };
      },
    });
  }

  if (parsed.roles.length > 0) {
    rows.push({
      key: "roles",
      label: "Roles",
      current: portfolio.hero.roles.join(", ") || "—",
      incoming: parsed.roles.join(", "),
      apply: (draft) => {
        draft.hero = { ...draft.hero, roles: parsed.roles };
      },
    });
  }

  if (parsed.summary) {
    rows.push({
      key: "summary",
      label: "About bio",
      current: portfolio.about.bio ? summarize(portfolio.about.bio) : "—",
      incoming: summarize(parsed.summary),
      apply: (draft) => {
        draft.about = { ...draft.about, bio: parsed.summary! };
      },
    });
  }

  for (const [field, label] of [
    ["email", "Email"],
    ["phone", "Phone"],
    ["location", "Location"],
  ] as const) {
    const value = parsed[field];
    if (!value) continue;
    rows.push({
      key: field,
      label,
      current: portfolio.contact[field] || "—",
      incoming: value,
      apply: (draft) => {
        draft.contact = { ...draft.contact, [field]: value };
      },
    });
  }

  for (const [field, label] of SOCIAL_LABELS) {
    const value = parsed.social[field];
    if (!value) continue;
    rows.push({
      key: `social.${field}`,
      label,
      current: portfolio.social[field] || "—",
      incoming: value,
      apply: (draft) => {
        draft.social = { ...draft.social, [field]: value };
      },
    });
  }

  // List sections append rather than replace — a resume is a summary, and
  // overwriting would silently delete entries the owner wrote by hand.
  if (parsed.skills.length > 0) {
    rows.push({
      key: "skills",
      label: "Skills",
      current: `${portfolio.skills.length} saved`,
      incoming: `Add ${parsed.skills.length}: ${summarize(
        parsed.skills.map((s) => s.name).join(", "),
        60
      )}`,
      apply: (draft) => {
        draft.skills = [...draft.skills, ...parsed.skills];
      },
    });
  }

  if (parsed.experience.length > 0) {
    rows.push({
      key: "experience",
      label: "Experience",
      current: `${portfolio.experience.length} saved`,
      incoming: `Add ${parsed.experience.length}: ${summarize(
        parsed.experience.map((e) => [e.role, e.company].filter(Boolean).join(" · ")).join("; "),
        60
      )}`,
      apply: (draft) => {
        draft.experience = [...draft.experience, ...parsed.experience];
      },
    });
  }

  if (parsed.education.length > 0) {
    rows.push({
      key: "education",
      label: "Education",
      current: `${portfolio.education.length} saved`,
      incoming: `Add ${parsed.education.length}: ${summarize(
        parsed.education.map((e) => [e.degree, e.institution].filter(Boolean).join(" · ")).join("; "),
        60
      )}`,
      apply: (draft) => {
        draft.education = [...draft.education, ...parsed.education];
      },
    });
  }

  return rows;
}

export function ResumeImport({
  portfolio,
  onApply,
  saving,
}: {
  portfolio: Portfolio;
  onApply: (patch: Partial<Portfolio>) => Promise<void>;
  saving?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState(false);

  async function handleFile(file: File) {
    setReading(true);
    setError(null);
    setRows(null);
    setApplied(false);
    try {
      const parsed = parseResume(await extractPdfLines(file));
      const nextRows = buildRows(parsed, portfolio);
      if (nextRows.length === 0) {
        setError(
          "Nothing recognisable was found. Resumes vary a lot in layout — you may need to fill the sections in by hand."
        );
        return;
      }
      setRows(nextRows);
      // Everything starts accepted; unticking is faster than ticking when the
      // parse is mostly right, which is the common case.
      setAccepted(new Set(nextRows.map((row) => row.key)));
    } catch (err) {
      setError(
        err instanceof ResumeExtractError
          ? err.message
          : "That file couldn't be read. Make sure it's a PDF."
      );
    } finally {
      setReading(false);
    }
  }

  async function applySelected() {
    if (!rows) return;
    const draft: Portfolio = structuredClone(portfolio);
    for (const row of rows) {
      if (accepted.has(row.key)) row.apply(draft);
    }
    await onApply({
      hero: draft.hero,
      about: draft.about,
      contact: draft.contact,
      social: draft.social,
      skills: draft.skills,
      experience: draft.experience,
      education: draft.education,
    });
    setApplied(true);
    setRows(null);
  }

  function toggle(key: string) {
    setAccepted((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
      <p className="mb-1 flex items-center gap-2 text-sm font-medium">
        <Wand2 className="h-4 w-4 text-[var(--accent-2)]" /> Fill from your resume
      </p>
      <p className="mb-3 text-xs leading-relaxed text-[var(--text-muted)]">
        Reads a PDF resume in your browser and suggests values for your
        portfolio. Resumes have no standard layout, so treat every suggestion as
        a guess — you review each one before anything is saved. Scanned or
        image-only PDFs can&apos;t be read.
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={reading}
        className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 py-2 text-xs font-medium hover:border-[var(--accent-2)] disabled:opacity-50"
      >
        {reading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UploadCloud className="h-3.5 w-3.5" />
        )}
        {reading ? "Reading resume…" : "Choose a PDF"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {applied && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-500">
          <FileText className="h-3.5 w-3.5" />
          Applied. Check each section to tidy up what came through.
        </p>
      )}

      {rows && (
        <div className="mt-4">
          <div className="mb-2 grid grid-cols-[1.5rem_1fr] gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)] sm:grid-cols-[1.5rem_7rem_1fr_1fr]">
            <span />
            <span className="hidden sm:block">Field</span>
            <span className="hidden sm:block">Currently</span>
            <span>From your resume</span>
          </div>

          <ul className="space-y-1">
            {rows.map((row) => (
              <li key={row.key}>
                <label
                  className={`grid cursor-pointer grid-cols-[1.5rem_1fr] items-start gap-2 rounded-lg p-2 text-xs hover:bg-[var(--surface)] sm:grid-cols-[1.5rem_7rem_1fr_1fr] ${
                    accepted.has(row.key) ? "" : "opacity-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={accepted.has(row.key)}
                    onChange={() => toggle(row.key)}
                    className="mt-0.5 h-3.5 w-3.5 accent-[var(--accent-2)]"
                  />
                  <span className="font-medium sm:font-normal">{row.label}</span>
                  <span className="hidden break-words text-[var(--text-muted)] sm:block">
                    {row.current}
                  </span>
                  <span className="break-words">{row.incoming}</span>
                </label>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={applySelected}
              disabled={accepted.size === 0 || saving}
              className="rounded-xl bg-[linear-gradient(120deg,var(--accent-2),var(--accent-3))] px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
            >
              {saving ? "Saving…" : `Apply ${accepted.size} selected`}
            </button>
            <button
              type="button"
              onClick={() => setRows(null)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
