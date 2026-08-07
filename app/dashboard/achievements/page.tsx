"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { RepeatingItemsEditor, type ItemFieldSchema } from "@/components/dashboard/RepeatingItemsEditor";
import type { AchievementItem } from "@/types/portfolio";

const FIELDS: ItemFieldSchema[] = [
  { key: "title", label: "Achievement", type: "text" },
  { key: "date", label: "Date", type: "text", placeholder: "2023" },
  { key: "description", label: "Description", type: "textarea", fullWidth: true },
];

export default function AchievementsEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [items, setItems] = useLocalSectionState<AchievementItem[]>(
    portfolio?.achievements,
    loading
  );
  const [justSaved, setJustSaved] = useState(false);

  if (!items) return <div className="skeleton h-80" />;

  async function handleSave() {
    if (!items) return;
    await save({ achievements: items });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Achievements"
      description="Milestones and accomplishments worth highlighting."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <RepeatingItemsEditor<AchievementItem>
        items={items}
        onChange={setItems}
        fields={FIELDS}
        createItem={() => ({ id: nanoid(8), title: "" })}
        itemTitle={(item) => item.title}
        itemSubtitle={(item) => item.date}
        addLabel="Add achievement"
        aiContext="an achievement on someone's portfolio"
        emptyLabel="Add your achievements."
      />
    </SectionEditorShell>
  );
}
