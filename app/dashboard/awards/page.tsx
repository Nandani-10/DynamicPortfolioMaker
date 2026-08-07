"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { RepeatingItemsEditor, type ItemFieldSchema } from "@/components/dashboard/RepeatingItemsEditor";
import type { AwardItem } from "@/types/portfolio";

const FIELDS: ItemFieldSchema[] = [
  { key: "title", label: "Award title", type: "text" },
  { key: "issuer", label: "Presented by", type: "text" },
  { key: "date", label: "Date", type: "text", placeholder: "2023" },
  { key: "description", label: "Description", type: "textarea", fullWidth: true },
];

export default function AwardsEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [items, setItems] = useLocalSectionState<AwardItem[]>(portfolio?.awards, loading);
  const [justSaved, setJustSaved] = useState(false);

  if (!items) return <div className="skeleton h-80" />;

  async function handleSave() {
    if (!items) return;
    await save({ awards: items });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Awards & Recognition"
      description="Notable awards, honors, and recognitions you've received."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <RepeatingItemsEditor<AwardItem>
        items={items}
        onChange={setItems}
        fields={FIELDS}
        createItem={() => ({ id: nanoid(8), title: "", issuer: "", date: "" })}
        itemTitle={(item) => item.title}
        itemSubtitle={(item) => item.issuer}
        addLabel="Add award"
        aiContext="an award on someone's portfolio"
        emptyLabel="Add awards and recognitions."
      />
    </SectionEditorShell>
  );
}
