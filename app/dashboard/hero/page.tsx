"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { Field, TextArea, TextInput } from "@/components/dashboard/fields";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { Plus, Trash2 } from "lucide-react";
import type { HeroContent } from "@/types/portfolio";

export default function HeroEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [hero, setHero] = useLocalSectionState<HeroContent>(portfolio?.hero, loading);
  const [justSaved, setJustSaved] = useState(false);
  const [rolesInput, setRolesInput] = useState<string | null>(null);

  if (!hero) {
    return <div className="skeleton h-96" />;
  }

  function patch(update: Partial<HeroContent>) {
    setHero((prev) => (prev ? { ...prev, ...update } : prev));
  }

  /**
   * Images persist the moment they finish uploading rather than waiting for
   * "Save changes". The file is already in Cloudinary by then, so the preview
   * shown here looks identical whether or not the URL reached Firestore —
   * making it very easy to navigate away believing the photo was saved.
   */
  async function patchAndSave(update: Partial<HeroContent>) {
    if (!hero) return;
    const next = { ...hero, ...update };
    setHero(next);
    await save({ hero: next });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  async function handleSave() {
    if (!hero) return;
    await save({ hero });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Hero Section"
      description="The first thing visitors see — your name, roles, intro, and headline stats."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <div className="flex gap-4">
        <ImageUploader
          label="Profile photo"
          value={hero.profileImage}
          folder="profile"
          onChange={(url) => patchAndSave({ profileImage: url })}
        />
        <div className="flex-1">
          <ImageUploader
            label="Background banner"
            value={hero.bannerImage}
            folder="banner"
            onChange={(url) => patchAndSave({ bannerImage: url })}
            aspect="wide"
          />
        </div>
      </div>

      <Field label="Full name">
        <TextInput
          value={hero.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Jane Doe"
        />
      </Field>

      <Field label="Roles" hint="Shown as an animated typing effect — comma-separated">
        <TextInput
          value={rolesInput ?? hero.roles.join(", ")}
          onChange={(e) => setRolesInput(e.target.value)}
          onBlur={() => {
            if (rolesInput === null) return;
            patch({
              roles: rolesInput
                .split(",")
                .map((r) => r.trim())
                .filter(Boolean),
            });
            setRolesInput(null);
          }}
          placeholder="Software Engineer, Designer, Speaker"
        />
      </Field>

      <Field label="Short introduction">
        <TextArea
          rows={4}
          value={hero.intro}
          onChange={(e) => patch({ intro: e.target.value })}
          placeholder="A short, punchy line about what you do."
        />
      </Field>

      <div>
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Animated statistics
        </span>
        <div className="space-y-2">
          {hero.stats.map((stat) => (
            <div key={stat.id} className="flex items-center gap-2">
              <TextInput
                value={stat.value}
                type="number"
                className="w-20"
                onChange={(e) =>
                  patch({
                    stats: hero.stats.map((s) =>
                      s.id === stat.id ? { ...s, value: Number(e.target.value) } : s
                    ),
                  })
                }
              />
              <TextInput
                value={stat.suffix ?? ""}
                className="w-16"
                placeholder="+"
                onChange={(e) =>
                  patch({
                    stats: hero.stats.map((s) =>
                      s.id === stat.id ? { ...s, suffix: e.target.value } : s
                    ),
                  })
                }
              />
              <TextInput
                value={stat.label}
                placeholder="Label"
                onChange={(e) =>
                  patch({
                    stats: hero.stats.map((s) =>
                      s.id === stat.id ? { ...s, label: e.target.value } : s
                    ),
                  })
                }
              />
              <button
                type="button"
                onClick={() => patch({ stats: hero.stats.filter((s) => s.id !== stat.id) })}
                className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
                aria-label="Remove stat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patch({
                stats: [
                  ...hero.stats,
                  { id: nanoid(8), label: "New stat", value: 0, suffix: "" },
                ],
              })
            }
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <Plus className="h-3.5 w-3.5" /> Add statistic
          </button>
        </div>
      </div>
    </SectionEditorShell>
  );
}
