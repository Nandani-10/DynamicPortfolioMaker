"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { RepeatingItemsEditor, type ItemFieldSchema } from "@/components/dashboard/RepeatingItemsEditor";
import type { BlogItem } from "@/types/portfolio";

const FIELDS: ItemFieldSchema[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "url", label: "URL", type: "url" },
  { key: "publishedAt", label: "Published", type: "text", placeholder: "Jan 2024" },
  { key: "coverImage", label: "Cover image", type: "image", uploadFolder: "blogs", fullWidth: true },
  { key: "excerpt", label: "Excerpt", type: "textarea", fullWidth: true },
];

export default function BlogsEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [items, setItems] = useLocalSectionState<BlogItem[]>(portfolio?.blogs, loading);
  const [justSaved, setJustSaved] = useState(false);

  if (!items) return <div className="skeleton h-80" />;

  async function handleSave() {
    if (!items) return;
    await save({ blogs: items });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Blogs & Publications"
      description="Articles and publications you've written."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <RepeatingItemsEditor<BlogItem>
        items={items}
        onChange={setItems}
        fields={FIELDS}
        createItem={() => ({ id: nanoid(8), title: "", url: "" })}
        itemTitle={(item) => item.title}
        itemSubtitle={(item) => item.publishedAt}
        addLabel="Add blog / publication"
        aiContext="a blog post or publication listed on someone's portfolio"
        emptyLabel="Add your writing."
      />
    </SectionEditorShell>
  );
}
