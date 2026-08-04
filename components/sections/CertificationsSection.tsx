import Image from "next/image";
import { ExternalLink, FileBadge } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import type { CertificationItem } from "@/types/portfolio";

export function CertificationsSection({ items }: { items: CertificationItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="certifications" className="mx-auto max-w-5xl px-6 py-24">
      <SectionHeading eyebrow="Credentials" title="Certifications" />
      <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((cert) => (
          <StaggerItem key={cert.id}>
            <a
              href={cert.credentialUrl || undefined}
              target={cert.credentialUrl ? "_blank" : undefined}
              rel="noreferrer"
              className="card-surface group flex h-full flex-col overflow-hidden transition-transform hover:-translate-y-1"
            >
              <div className="relative h-32 w-full bg-[var(--surface-alt)]">
                {cert.imageUrl ? (
                  <Image
                    src={cert.imageUrl}
                    alt={cert.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                    <FileBadge className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-medium">{cert.title}</h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{cert.issuer}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-xs text-[var(--text-muted)]">{cert.date}</span>
                  {cert.credentialUrl && (
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent-2)]" />
                  )}
                </div>
              </div>
            </a>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
