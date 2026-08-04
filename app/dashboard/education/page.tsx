"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { RepeatingItemsEditor, type ItemFieldSchema } from "@/components/dashboard/RepeatingItemsEditor";
import type { EducationItem } from "@/types/portfolio";

const FIELDS: ItemFieldSchema[] = [
  { key: "institution", label: "Institution", type: "text" },
  { key: "degree", label: "Degree", type: "text" },
  { key: "field", label: "Field of study", type: "text" },
  { key: "grade", label: "Grade / GPA", type: "text" },
  { key: "startDate", label: "Start date", type: "text", placeholder: "2019" },
  { key: "endDate", label: "End date", type: "text", placeholder: "2023" },
  { key: "description", label: "Description", type: "textarea", fullWidth: true },
];

export default function EducationEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [items, setItems] = useLocalSectionState<EducationItem[]>(
    portfolio?.education,
    loading
  );
  const [justSaved, setJustSaved] = useState(false);

  if (!items) return <div className="skeleton h-80" />;

  async function handleSave() {
    if (!items) return;
    await save({ education: items });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Education"
      description="Degrees, coursework, and academic achievements."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <RepeatingItemsEditor<EducationItem>
        items={items}
        onChange={setItems}
        fields={FIELDS}
        createItem={() => ({
          id: nanoid(8),
          institution: "",
          degree: "",
          startDate: "",
        })}
        itemTitle={(item) => item.degree || item.institution}
        itemSubtitle={(item) => item.institution}
        addLabel="Add education"
        emptyLabel="Add your degrees and courses."
      />
    </SectionEditorShell>
  );
}
