"use client";

import Image from "next/image";
import { ExternalLink, Lightbulb, RotateCcw, Sparkles, Target } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import { FlipCard } from "@/components/effects/FlipCard";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import type { ProjectItem } from "@/types/portfolio";

function ProjectFront({ project }: { project: ProjectItem }) {
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

export function ProjectsSection({ items }: { items: ProjectItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Selected work"
        title="Projects"
        description="A few things I've designed, built, and shipped. Click any card to see how it was built."
      />
      <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((project) => (
          <StaggerItem key={project.id}>
            <FlipCard
              heightClass="h-[27rem]"
              front={<ProjectFront project={project} />}
              back={<ProjectBack project={project} />}
            />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
