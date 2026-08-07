"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { RepeatingItemsEditor, type ItemFieldSchema } from "@/components/dashboard/RepeatingItemsEditor";
import type { CertificationItem } from "@/types/portfolio";

const FIELDS: ItemFieldSchema[] = [
  { key: "title", label: "Certificate title", type: "text" },
  { key: "issuer", label: "Issued by", type: "text" },
  { key: "date", label: "Date", type: "text", placeholder: "March 2024" },
  { key: "credentialUrl", label: "Credential URL", type: "url" },
  {
    key: "imageUrl",
    label: "Certificate image",
    type: "image",
    uploadFolder: "certifications",
    fullWidth: true,
  },
];

export default function CertificationsEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [items, setItems] = useLocalSectionState<CertificationItem[]>(
    portfolio?.certifications,
    loading
  );
  const [justSaved, setJustSaved] = useState(false);

  if (!items) return <div className="skeleton h-80" />;

  async function handleSave() {
    if (!items) return;
    await save({ certifications: items });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Certifications"
      description="Upload and showcase your certificates."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <RepeatingItemsEditor<CertificationItem>
        items={items}
        onChange={setItems}
        fields={FIELDS}
        createItem={() => ({ id: nanoid(8), title: "", issuer: "", date: "" })}
        itemTitle={(item) => item.title}
        itemSubtitle={(item) => item.issuer}
        addLabel="Add certification"
        aiContext="a certification on someone's portfolio"
        emptyLabel="Add your certifications."
      />
    </SectionEditorShell>
  );
}
