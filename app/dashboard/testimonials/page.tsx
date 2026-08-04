"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { RepeatingItemsEditor, type ItemFieldSchema } from "@/components/dashboard/RepeatingItemsEditor";
import type { TestimonialItem } from "@/types/portfolio";

const FIELDS: ItemFieldSchema[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "role", label: "Role", type: "text" },
  { key: "company", label: "Company", type: "text" },
  { key: "avatar", label: "Avatar", type: "image", uploadFolder: "testimonials" },
  { key: "quote", label: "Quote", type: "textarea", fullWidth: true },
];

export default function TestimonialsEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [items, setItems] = useLocalSectionState<TestimonialItem[]>(
    portfolio?.testimonials,
    loading
  );
  const [justSaved, setJustSaved] = useState(false);

  if (!items) return <div className="skeleton h-80" />;

  async function handleSave() {
    if (!items) return;
    await save({ testimonials: items });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Testimonials"
      description="What colleagues, clients, and collaborators say about you."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <RepeatingItemsEditor<TestimonialItem>
        items={items}
        onChange={setItems}
        fields={FIELDS}
        createItem={() => ({ id: nanoid(8), name: "", quote: "" })}
        itemTitle={(item) => item.name}
        itemSubtitle={(item) => item.company}
        addLabel="Add testimonial"
        emptyLabel="Add testimonials from others."
      />
    </SectionEditorShell>
  );
}
