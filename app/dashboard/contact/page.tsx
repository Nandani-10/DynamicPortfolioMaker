"use client";

import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { Field, TextInput } from "@/components/dashboard/fields";
import type { ContactContent, SocialLinks } from "@/types/portfolio";

export default function ContactEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [contact, setContact] = useLocalSectionState<ContactContent>(
    portfolio?.contact,
    loading
  );
  const [social, setSocial] = useLocalSectionState<SocialLinks>(portfolio?.social, loading);
  const [justSaved, setJustSaved] = useState(false);

  if (!contact || !social) return <div className="skeleton h-96" />;

  async function handleSave() {
    if (!contact || !social) return;
    await save({ contact, social });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Contact & Social"
      description="How visitors can reach you, and your social presence."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Email">
          <TextInput
            value={contact.email ?? ""}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Phone">
          <TextInput
            value={contact.phone ?? ""}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            placeholder="+1 555 123 4567"
          />
        </Field>
        <Field label="Location">
          <TextInput
            value={contact.location ?? ""}
            onChange={(e) => setContact({ ...contact, location: e.target.value })}
            placeholder="San Francisco, CA"
          />
        </Field>
        <Field label="Calendly / booking link">
          <TextInput
            value={contact.calendlyUrl ?? ""}
            onChange={(e) => setContact({ ...contact, calendlyUrl: e.target.value })}
            placeholder="https://calendly.com/you"
          />
        </Field>
        <Field label="Google Maps embed URL" hint="Optional">
          <TextInput
            value={contact.mapEmbedUrl ?? ""}
            onChange={(e) => setContact({ ...contact, mapEmbedUrl: e.target.value })}
            placeholder="https://www.google.com/maps/embed?..."
          />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
          <input
            type="checkbox"
            checked={contact.formEnabled}
            onChange={(e) => setContact({ ...contact, formEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent-2)]"
          />
          Show contact form
        </label>
      </div>

      {contact.formEnabled && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
          <Field
            label="Web3Forms access key"
            hint="Needed for the form to actually send"
          >
            <TextInput
              value={contact.formAccessKey ?? ""}
              onChange={(e) => setContact({ ...contact, formAccessKey: e.target.value })}
              placeholder="00000000-0000-0000-0000-000000000000"
            />
          </Field>
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
            Your portfolio is a static site with no server of its own, so form
            submissions are delivered by{" "}
            <a
              href="https://web3forms.com"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent-3)] hover:underline"
            >
              Web3Forms
            </a>{" "}
            — enter your email there and they send a free access key to paste
            above. Leave it empty and the form falls back to opening the
            visitor&apos;s mail app, which does nothing on devices that have no
            mail app set up.
          </p>
        </div>
      )}

      <div className="border-t border-[var(--border)] pt-6">
        <p className="mb-4 text-sm font-medium">Social links</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              ["github", "GitHub"],
              ["linkedin", "LinkedIn"],
              ["twitter", "Twitter / X"],
              ["instagram", "Instagram"],
              ["youtube", "YouTube"],
              ["dribbble", "Dribbble"],
              ["website", "Personal website"],
            ] as [keyof SocialLinks, string][]
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <TextInput
                value={social[key] ?? ""}
                onChange={(e) => setSocial({ ...social, [key]: e.target.value })}
                placeholder="https://…"
              />
            </Field>
          ))}
        </div>
      </div>
    </SectionEditorShell>
  );
}
