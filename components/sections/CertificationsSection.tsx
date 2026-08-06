"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ExternalLink, FileBadge, ZoomIn } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { Lightbox } from "@/components/effects/Lightbox";
import type { CertificationItem } from "@/types/portfolio";

/** Full-size viewer — a certificate is unreadable at thumbnail size. */
function CertificateLightbox({
  certificate,
  onClose,
}: {
  certificate: CertificationItem;
  onClose: () => void;
}) {
  return (
    <Lightbox label={certificate.title} onClose={onClose}>
      <>
        {certificate.imageUrl && (
          <div className="relative aspect-[4/3] w-full bg-[var(--surface-alt)]">
            <Image
              src={certificate.imageUrl}
              alt={certificate.title}
              fill
              className="object-contain"
              sizes="(min-width: 768px) 768px, 100vw"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] p-4">
          <div className="min-w-0">
            <p className="truncate font-medium">{certificate.title}</p>
            <p className="truncate text-sm text-[var(--text-muted)]">
              {certificate.issuer}
              {certificate.date ? ` · ${certificate.date}` : ""}
            </p>
          </div>
          {certificate.credentialUrl && (
            <a
              href={certificate.credentialUrl}
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 py-2 text-xs font-medium hover:border-[var(--accent-2)]"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Verify
            </a>
          )}
        </div>
      </>
    </Lightbox>
  );
}

export function CertificationsSection({
  items,
  title,
}: {
  items: CertificationItem[];
  title?: string;
}) {
  const [active, setActive] = useState<CertificationItem | null>(null);

  if (items.length === 0) return null;

  return (
    <section id="certifications" className="mx-auto max-w-5xl px-6 py-24">
      <SectionHeading
        eyebrow="Credentials"
        title={title ?? "Certifications"}
        description="Click a certificate to view it full size."
      />
      <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((cert) => (
          <StaggerItem key={cert.id}>
            <SpotlightCard className="h-full rounded-[var(--radius-lg)]">
              <button
                type="button"
                onClick={() => cert.imageUrl && setActive(cert)}
                className="card-surface group/cert flex h-full w-full flex-col overflow-hidden text-left transition-transform hover:-translate-y-1"
              >
                <div className="relative h-32 w-full shrink-0 bg-[var(--surface-alt)]">
                  {cert.imageUrl ? (
                    <>
                      <Image
                        src={cert.imageUrl}
                        alt={cert.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, 50vw"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/cert:opacity-100">
                        <ZoomIn className="h-6 w-6 text-white" />
                      </span>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                      <FileBadge className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="underline-reveal-host flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-medium">
                    <span className="underline-reveal">{cert.title}</span>
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{cert.issuer}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-xs text-[var(--text-muted)]">{cert.date}</span>
                    {cert.credentialUrl && (
                      <ExternalLink className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    )}
                  </div>
                </div>
              </button>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <AnimatePresence>
        {active && (
          <CertificateLightbox certificate={active} onClose={() => setActive(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
