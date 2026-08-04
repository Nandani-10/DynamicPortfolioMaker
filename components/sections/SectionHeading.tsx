import { ScrollReveal } from "@/components/effects/ScrollReveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <ScrollReveal className="mx-auto mb-12 max-w-2xl text-center">
      <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-2)]">
        {eyebrow}
      </span>
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-[var(--text-muted)]">{description}</p>
      )}
    </ScrollReveal>
  );
}
