"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { RepeatingItemsEditor, type ItemFieldSchema } from "@/components/dashboard/RepeatingItemsEditor";
import type { ExperienceItem } from "@/types/portfolio";

const FIELDS: ItemFieldSchema[] = [
  { key: "company", label: "Company", type: "text" },
  { key: "role", label: "Role", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "startDate", label: "Start date", type: "text", placeholder: "Jan 2022" },
  { key: "endDate", label: "End date", type: "text", placeholder: "Present" },
  { key: "current", label: "I currently work here", type: "boolean" },
  { key: "companyLogo", label: "Company logo", type: "image", uploadFolder: "companies" },
  { key: "description", label: "Description", type: "textarea", fullWidth: true },
  {
    key: "highlights",
    label: "Key highlights",
    type: "tags",
    fullWidth: true,
    placeholder: "Led migration to microservices, Grew team from 2 to 8",
  },
];

export default function ExperienceEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [items, setItems] = useLocalSectionState<ExperienceItem[]>(
    portfolio?.experience,
    loading
  );
  const [justSaved, setJustSaved] = useState(false);

  if (!items) return <div className="skeleton h-80" />;

  async function handleSave() {
    if (!items) return;
    await save({ experience: items });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Work Experience"
      description="Your professional journey, roles, and impact."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <RepeatingItemsEditor<ExperienceItem>
        items={items}
        onChange={setItems}
        fields={FIELDS}
        createItem={() => ({ id: nanoid(8), company: "", role: "", startDate: "" })}
        itemTitle={(item) => item.role || item.company}
        itemSubtitle={(item) => item.company}
        addLabel="Add experience"
        emptyLabel="Add your work history."
      />
    </SectionEditorShell>
  );
}
