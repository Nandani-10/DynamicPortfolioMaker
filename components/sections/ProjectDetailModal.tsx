"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  Link2,
  Sparkles,
  Target,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { Lightbox } from "@/components/effects/Lightbox";
import type { ProjectItem } from "@/types/portfolio";

/** Every image for a project, thumbnail first, with duplicates removed. */
export function projectImages(project: ProjectItem): string[] {
  return [...new Set([project.thumbnail, ...(project.gallery ?? [])].filter(Boolean))] as string[];
}

function DetailBlock({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent-2)]">
        {icon} {label}
      </p>
      {children}
    </div>
  );
}

export function ProjectDetailModal({
  project,
  onClose,
}: {
  project: ProjectItem;
  onClose: () => void;
}) {
  const images = projectImages(project);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Arrow keys page the gallery; Escape is handled by the Lightbox itself.
  useEffect(() => {
    if (images.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [images.length]);

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}#project-${project.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the hash in the address bar still works.
    }
  }

  return (
    <Lightbox label={project.title} onClose={onClose} maxWidthClass="max-w-4xl">
      {images.length > 0 && (
        <div className="relative aspect-[16/9] w-full shrink-0 bg-[var(--surface-alt)]">
          <Image
            key={images[index]}
            src={images[index]}
            alt={`${project.title} — image ${index + 1} of ${images.length}`}
            fill
            className="object-contain"
            sizes="(min-width: 896px) 896px, 100vw"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % images.length)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {images.map((image, i) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-current={i === index}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          {project.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          {project.description}
        </p>

        <div className="mt-6 space-y-5">
          {project.features && project.features.length > 0 && (
            <DetailBlock icon={<Sparkles className="h-3.5 w-3.5" />} label="Key features">
              <ul className="list-inside list-disc space-y-1 text-sm text-[var(--text-muted)]">
                {project.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </DetailBlock>
          )}

          {project.challenges && (
            <DetailBlock icon={<Target className="h-3.5 w-3.5" />} label="Challenges">
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                {project.challenges}
              </p>
            </DetailBlock>
          )}

          {project.learnings && (
            <DetailBlock icon={<Lightbulb className="h-3.5 w-3.5" />} label="What I learned">
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                {project.learnings}
              </p>
            </DetailBlock>
          )}

          {project.techStack.length > 0 && (
            <DetailBlock icon={null} label="Built with">
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-[var(--surface-alt)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </DetailBlock>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-4 border-t border-[var(--border)] p-4">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
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
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent-3)] dark:text-[var(--accent-1)]"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Live demo
          </a>
        )}
        <button
          type="button"
          onClick={copyLink}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:border-[var(--accent-2)] hover:text-[var(--text)]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Link copied
            </>
          ) : (
            <>
              <Link2 className="h-3.5 w-3.5" /> Copy link
            </>
          )}
        </button>
      </div>
    </Lightbox>
  );
}
