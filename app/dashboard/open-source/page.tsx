"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { RepeatingItemsEditor, type ItemFieldSchema } from "@/components/dashboard/RepeatingItemsEditor";
import { GitHubImport } from "@/components/dashboard/GitHubImport";
import { repoToOpenSource } from "@/lib/github-import";
import { githubUsernameFromUrl } from "@/lib/social";
import type { OpenSourceItem } from "@/types/portfolio";

const FIELDS: ItemFieldSchema[] = [
  { key: "repo", label: "Repository name", type: "text", placeholder: "facebook/react" },
  { key: "url", label: "Repository URL", type: "url" },
  { key: "role", label: "Your role", type: "text", placeholder: "Contributor, Maintainer" },
  { key: "description", label: "Description", type: "textarea", fullWidth: true },
];

export default function OpenSourceEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [items, setItems] = useLocalSectionState<OpenSourceItem[]>(
    portfolio?.openSource,
    loading
  );
  const [justSaved, setJustSaved] = useState(false);
  const githubHandle = githubUsernameFromUrl(portfolio?.social.github);

  if (!items) return <div className="skeleton h-80" />;

  async function handleSave() {
    if (!items) return;
    await save({ openSource: items });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Open Source Contributions"
      description="Projects and repositories you've contributed to."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <GitHubImport
        label="Import from GitHub"
        defaultUsername={githubHandle}
        existingUrls={items.map((item) => item.url)}
        onImport={(repos) => setItems([...items, ...repos.map(repoToOpenSource)])}
      />

      <RepeatingItemsEditor<OpenSourceItem>
        items={items}
        onChange={setItems}
        fields={FIELDS}
        createItem={() => ({ id: nanoid(8), repo: "", url: "" })}
        itemTitle={(item) => item.repo}
        itemSubtitle={(item) => item.role}
        addLabel="Add contribution"
        aiContext="an open-source contribution on someone's portfolio"
        emptyLabel="Add your open source contributions."
      />
    </SectionEditorShell>
  );
}
