"use client";

import { nanoid } from "nanoid";
import { useState } from "react";
import { useOwnerPortfolio } from "@/hooks/usePortfolio";
import { useLocalSectionState } from "@/hooks/useLocalSectionState";
import { SectionEditorShell } from "@/components/dashboard/SectionEditorShell";
import { RepeatingItemsEditor, type ItemFieldSchema } from "@/components/dashboard/RepeatingItemsEditor";
import { GitHubImport } from "@/components/dashboard/GitHubImport";
import { repoToProject } from "@/lib/github-import";
import { githubUsernameFromUrl } from "@/lib/social";
import type { ProjectItem } from "@/types/portfolio";

const FIELDS: ItemFieldSchema[] = [
  { key: "title", label: "Project title", type: "text" },
  { key: "thumbnail", label: "Thumbnail image", type: "image", uploadFolder: "projects", fullWidth: true },
  { key: "description", label: "Description", type: "textarea", fullWidth: true },
  { key: "techStack", label: "Tech stack", type: "tags", placeholder: "React, Node.js, PostgreSQL" },
  { key: "features", label: "Key features", type: "tags", placeholder: "Realtime sync, Offline mode" },
  { key: "githubUrl", label: "GitHub URL", type: "url" },
  { key: "liveUrl", label: "Live demo URL", type: "url" },
  { key: "featured", label: "Feature this project", type: "boolean" },
  { key: "challenges", label: "Challenges", type: "textarea", fullWidth: true },
  { key: "learnings", label: "Learnings", type: "textarea", fullWidth: true },
];

export default function ProjectsEditorPage() {
  const { portfolio, loading, saving, error, save } = useOwnerPortfolio();
  const [items, setItems] = useLocalSectionState<ProjectItem[]>(portfolio?.projects, loading);
  const [justSaved, setJustSaved] = useState(false);
  const githubHandle = githubUsernameFromUrl(portfolio?.social.github);

  if (!items) return <div className="skeleton h-80" />;

  async function handleSave() {
    if (!items) return;
    await save({ projects: items });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <SectionEditorShell
      title="Projects"
      description="Showcase your best work with tech stack, links, and lessons learned."
      onSave={handleSave}
      saving={saving}
      saved={justSaved}
      error={error}
    >
      <GitHubImport
        label="Import from GitHub"
        defaultUsername={githubHandle}
        existingUrls={items.map((item) => item.githubUrl ?? "")}
        onImport={(repos) => setItems([...items, ...repos.map(repoToProject)])}
      />

      <RepeatingItemsEditor<ProjectItem>
        items={items}
        onChange={setItems}
        fields={FIELDS}
        createItem={() => ({
          id: nanoid(8),
          title: "",
          description: "",
          techStack: [],
        })}
        itemTitle={(item) => item.title}
        itemSubtitle={(item) => item.techStack.join(", ")}
        addLabel="Add project"
        aiContext="a project on a developer's portfolio"
        emptyLabel="Add your first project."
      />
    </SectionEditorShell>
  );
}
