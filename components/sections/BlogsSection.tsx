import Image from "next/image";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import type { BlogItem } from "@/types/portfolio";

export function BlogsSection({ items }: { items: BlogItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="blogs" className="mx-auto max-w-5xl px-6 py-24">
      <SectionHeading eyebrow="Writing" title="Blogs & Publications" />
      <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {items.map((blog) => (
          <StaggerItem key={blog.id}>
            <a
              href={blog.url}
              target="_blank"
              rel="noreferrer"
              className="card-surface group flex gap-4 overflow-hidden p-4 transition-transform hover:-translate-y-0.5"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-alt)]">
                {blog.coverImage ? (
                  <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                    <BookOpen className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium">{blog.title}</h3>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent-2)]" />
                </div>
                {blog.publishedAt && (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{blog.publishedAt}</p>
                )}
                {blog.excerpt && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-[var(--text-muted)]">
                    {blog.excerpt}
                  </p>
                )}
              </div>
            </a>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
