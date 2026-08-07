"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { Field, TextArea, TextInput } from "@/components/dashboard/fields";
import { RewriteWithAi } from "@/components/dashboard/RewriteWithAi";
import { FileUploader } from "@/components/dashboard/FileUploader";
import { ResumeImport } from "@/components/dashboard/ResumeImport";
import type { AboutContent } from "@/types/portfolio";

export default function AboutEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [about, setAbout] = useLocalSectionState<AboutContent>(portfolio?.about, loading);
  const [resumeUrl, setResumeUrl] = useLocalSectionState<string>(
    portfolio?.hero.resumeUrl ?? "",
    loading
  );
  const [justSaved, setJustSaved] = useState(false);

  if (!about) {
    return <div className="skeleton h-80" />;
  }

  async function handleSave() {
    if (!about || !portfolio) return;
    await save({
      about,
      hero: { ...portfolio.hero, resumeUrl: resumeUrl ?? "" },
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="About Me"
      description="Tell your story, share highlights, and let visitors download your resume."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <Field label="Bio">
        <TextArea
          rows={6}
          value={about.bio}
          onChange={(e) => setAbout({ ...about, bio: e.target.value })}
          placeholder="Write a couple of paragraphs about who you are, your journey, and what you care about."
        />
      </Field>
      <RewriteWithAi
        label="About bio"
        description="The 'About me' section of a portfolio: a couple of paragraphs on who the person is, their journey, and what they care about."
        value={about.bio}
        onApply={(bio) => setAbout({ ...about, bio })}
      />

      <div>
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Highlights
        </span>
        <div className="space-y-2">
          {about.highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <TextInput
                value={h}
                onChange={(e) => {
                  const next = [...about.highlights];
                  next[i] = e.target.value;
                  setAbout({ ...about, highlights: next });
                }}
                placeholder="e.g. 5+ years building web products"
              />
              <button
                type="button"
                onClick={() =>
                  setAbout({
                    ...about,
                    highlights: about.highlights.filter((_, idx) => idx !== i),
                  })
                }
                className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
                aria-label="Remove highlight"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setAbout({ ...about, highlights: [...about.highlights, ""] })}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <Plus className="h-3.5 w-3.5" /> Add highlight
          </button>
        </div>
      </div>

      <FileUploader
        label="Resume (PDF)"
        value={resumeUrl ?? ""}
        folder="resume"
        onChange={async (url) => {
          // Persist right away — see the note in the Hero editor.
          setResumeUrl(url);
          if (portfolio) {
            await save({ hero: { ...portfolio.hero, resumeUrl: url } });
          }
        }}
      />

      {portfolio && (
        <ResumeImport portfolio={portfolio} onApply={save} saving={saving} />
      )}
    </SectionEditorShell>
  );
}
