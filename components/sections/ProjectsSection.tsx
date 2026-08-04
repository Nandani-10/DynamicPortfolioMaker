"use client";

import Image from "next/image";
import { ExternalLink, Sparkles } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import { TiltCard } from "@/components/effects/TiltCard";
import type { ProjectItem } from "@/types/portfolio";

export function ProjectsSection({ items }: { items: ProjectItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Selected work"
        title="Projects"
        description="A few things I've designed, built, and shipped."
      />
      <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((project) => (
          <StaggerItem key={project.id}>
            <TiltCard className="h-full">
              <div className="card-surface flex h-full flex-col overflow-hidden">
                <div className="relative h-44 w-full bg-[var(--surface-alt)]">
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
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
                    {project.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-[var(--text-muted)]">
                    {project.description}
                  </p>
                  {project.techStack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full bg-[var(--surface-alt)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-4">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor-hover
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
                        data-cursor-hover
                        className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent-3)] dark:text-[var(--accent-1)]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Live demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
