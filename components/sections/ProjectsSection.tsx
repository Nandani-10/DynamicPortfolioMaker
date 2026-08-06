"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLink,
  Lightbulb,
  Maximize2,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import { FlipCard } from "@/components/effects/FlipCard";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { ProjectDetailModal } from "@/components/sections/ProjectDetailModal";
import type { ProjectItem } from "@/types/portfolio";

function ProjectFront({
  project,
  onExpand,
}: {
  project: ProjectItem;
  onExpand: () => void;
}) {
  const hasDetails =
    (project.features?.length ?? 0) > 0 || !!project.challenges || !!project.learnings;

  return (
    <SpotlightCard className="h-full rounded-[var(--radius-lg)]">
      <div className="card-surface flex h-full flex-col overflow-hidden">
        <div className="relative h-44 w-full shrink-0 bg-[var(--surface-alt)]">
          {project.thumbnail ? (
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
              <Sparkles className="h-8 w-8" />
            </div>
          )}
          {project.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--accent-2)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              Featured
            </span>
          )}
          {/* Separate from the flip: the card body toggles the back face, so
              the full view needs its own control that doesn't also flip. */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            aria-label={`Open ${project.title} in full view`}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 focus-visible:opacity-100 group-hover/flip:opacity-100"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="underline-reveal-host font-[family-name:var(--font-display)] text-lg font-medium">
            <span className="underline-reveal">{project.title}</span>
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-[var(--text-muted)]">
            {project.description}
          </p>

          {project.techStack.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.techStack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-[var(--surface-alt)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="rounded-full bg-[var(--surface-alt)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
                  +{project.techStack.length - 4}
                </span>
              )}
            </div>
          )}

          {hasDetails && (
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-3)] dark:text-[var(--accent-1)]">
              <RotateCcw className="h-3.5 w-3.5" />
              Click for details
            </span>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}

function ProjectBack({ project }: { project: ProjectItem }) {
  return (
    <div className="card-surface flex h-full flex-col overflow-hidden bg-[var(--surface-alt)] p-5">
      <h3 className="shrink-0 font-[family-name:var(--font-display)] text-lg font-medium">
        {project.title}
      </h3>

      <div className="scrollbar-thin mt-3 flex-1 space-y-4 overflow-y-auto pr-1">
        {project.features && project.features.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent-2)]">
              <Sparkles className="h-3.5 w-3.5" /> Key features
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-[var(--text-muted)]">
              {project.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {project.challenges && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent-2)]">
              <Target className="h-3.5 w-3.5" /> Challenges
            </p>
            <p className="text-sm text-[var(--text-muted)]">{project.challenges}</p>
          </div>
        )}

        {project.learnings && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent-2)]">
              <Lightbulb className="h-3.5 w-3.5" /> Learnings
            </p>
            <p className="text-sm text-[var(--text-muted)]">{project.learnings}</p>
          </div>
        )}

        {project.techStack.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent-2)]">
              Tech stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex shrink-0 items-center gap-4 border-t border-[var(--border)] pt-3">
        {project.githubUrl && (
          // The card itself is a button, so stop the click from flipping it back.
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <FaGithub className="h-3.5 w-3.5" /> Code
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent-3)] dark:text-[var(--accent-1)]"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Live demo
          </a>
        )}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <RotateCcw className="h-3.5 w-3.5" /> Back
        </span>
      </div>
    </div>
  );
}

const ALL_TECH = "All";

export function ProjectsSection({
  items,
  title,
}: {
  items: ProjectItem[];
  title?: string;
}) {
  const [activeTech, setActiveTech] = useState(ALL_TECH);
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  // A project link shared as `…/username#project-abc123` opens straight into
  // that project's detail view.
  useEffect(() => {
    function openFromHash() {
      const match = /^#project-(.+)$/.exec(window.location.hash);
      setOpenProjectId(match ? decodeURIComponent(match[1]) : null);
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  function openProject(id: string) {
    setOpenProjectId(id);
    // replaceState rather than a hash assignment: this shouldn't add a history
    // entry or make the browser jump-scroll to a matching element.
    window.history.replaceState(null, "", `#project-${encodeURIComponent(id)}`);
  }

  function closeProject() {
    setOpenProjectId(null);
    window.history.replaceState(null, "", "#projects");
  }

  if (items.length === 0) return null;

  const techCounts = new Map<string, number>();
  for (const project of items) {
    for (const tech of project.techStack) {
      techCounts.set(tech, (techCounts.get(tech) ?? 0) + 1);
    }
  }
  // Only offer a filter chip for stacks shared by more than one project —
  // a chip that narrows twelve projects down to one isn't filtering.
  const filters = [...techCounts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tech]) => tech);

  const visible =
    activeTech === ALL_TECH
      ? items
      : items.filter((project) => project.techStack.includes(activeTech));

  const openProjectItem = items.find((project) => project.id === openProjectId) ?? null;

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Selected work"
        title={title ?? "Projects"}
        description="A few things I've designed, built, and shipped. Click any card to see how it was built."
      />

      {filters.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {[ALL_TECH, ...filters].map((tech) => {
            const active = activeTech === tech;
            return (
              <button
                key={tech}
                type="button"
                onClick={() => setActiveTech(tech)}
                aria-pressed={active}
                className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="project-filter-pill"
                    className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,var(--accent-2),var(--accent-3))]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{tech}</span>
              </button>
            );
          })}
        </div>
      )}

      <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project) => (
            <StaggerItem key={project.id}>
              <FlipCard
                heightClass="h-[27rem]"
                front={
                  <ProjectFront project={project} onExpand={() => openProject(project.id)} />
                }
                back={<ProjectBack project={project} />}
              />
            </StaggerItem>
          ))}
        </AnimatePresence>
      </StaggerGroup>

      <AnimatePresence>
        {openProjectItem && (
          <ProjectDetailModal project={openProjectItem} onClose={closeProject} />
        )}
      </AnimatePresence>
    </section>
  );
}
