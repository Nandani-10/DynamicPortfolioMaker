"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { RepeatingItemsEditor, type ItemFieldSchema } from "@/components/dashboard/RepeatingItemsEditor";
import type { SkillItem } from "@/types/portfolio";

const FIELDS: ItemFieldSchema[] = [
  { key: "name", label: "Skill name", type: "text", placeholder: "TypeScript" },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "language", label: "Programming Language" },
      { value: "frontend", label: "Frontend" },
      { value: "backend", label: "Backend" },
      { value: "database", label: "Database" },
      { value: "devops", label: "DevOps" },
      { value: "design", label: "Design" },
      { value: "tools", label: "Tools & Software" },
      { value: "accounting", label: "Accounting" },
      { value: "finance", label: "Finance" },
      { value: "marketing", label: "Marketing" },
      { value: "sales", label: "Sales & Business Development" },
      { value: "business", label: "Business & Management" },
      { value: "analytics", label: "Data & Analytics" },
      { value: "softSkills", label: "Soft Skills" },
      { value: "other", label: "Other" },
    ],
  },
  { key: "level", label: "Proficiency (0-100)", type: "number" },
];

export default function SkillsEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [items, setItems] = useLocalSectionState<SkillItem[]>(portfolio?.skills, loading);
  const [justSaved, setJustSaved] = useState(false);

  if (!items) return <div className="skeleton h-80" />;

  async function handleSave() {
    if (!items) return;
    await save({ skills: items });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Skills"
      description="Technologies and tools you work with, shown as animated progress indicators."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <RepeatingItemsEditor<SkillItem>
        items={items}
        onChange={setItems}
        fields={FIELDS}
        createItem={() => ({ id: nanoid(8), name: "", level: 70, category: "other" })}
        itemTitle={(item) => item.name}
        itemSubtitle={(item) => `${item.category} · ${item.level}%`}
        addLabel="Add skill"
        emptyLabel="Add the skills you want to showcase."
      />
    </SectionEditorShell>
  );
}
