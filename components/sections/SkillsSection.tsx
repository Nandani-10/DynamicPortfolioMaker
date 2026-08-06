"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import { FlipCard } from "@/components/effects/FlipCard";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import type { SkillCategory, SkillItem } from "@/types/portfolio";

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  language: "Programming Languages",
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  devops: "DevOps",
  design: "Design",
  tools: "Tools & Software",
  accounting: "Accounting",
  finance: "Finance",
  marketing: "Marketing",
  sales: "Sales & Business Development",
  business: "Business & Management",
  analytics: "Data & Analytics",
  softSkills: "Soft Skills",
  other: "Other",
};

/** Turns a bare percentage into the word a reader actually cares about. */
function proficiencyLabel(level: number): string {
  if (level >= 90) return "Expert";
  if (level >= 75) return "Advanced";
  if (level >= 50) return "Intermediate";
  if (level >= 25) return "Working knowledge";
  return "Foundational";
}

function SkillFront({ skill }: { skill: SkillItem }) {
  return (
    <SpotlightCard className="h-full rounded-[var(--radius-md)]">
      <div className="underline-reveal-host flex h-full flex-col justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="underline-reveal font-medium">{skill.name}</span>
          <span className="text-[var(--text-muted)]">{skill.level}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-alt)]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--accent-1), var(--accent-2), var(--accent-3))",
            }}
            initial={{ width: 0 }}
            whileInView={{ width: `${skill.level}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </SpotlightCard>
  );
}

function SkillBack({ skill }: { skill: SkillItem }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent-2)]/40 bg-[var(--surface-alt)] px-4 py-3 text-center">
      <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--accent-3)] dark:text-[var(--accent-1)]">
        {proficiencyLabel(skill.level)}
      </span>
      <span className="mt-0.5 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
        {CATEGORY_LABELS[skill.category] ?? skill.category}
      </span>
    </div>
  );
}

export function SkillsSection({ items, title }: { items: SkillItem[]; title?: string }) {
  if (items.length === 0) return null;

  const grouped = items.reduce<Record<string, SkillItem[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});

  return (
    <section id="skills" className="mx-auto max-w-5xl px-6 py-24">
      <SectionHeading
        eyebrow="Toolbox"
        title={title ?? "Skills"}
        description="Technologies and disciplines I work with. Click any skill for a proficiency breakdown."
      />
      <div className="space-y-10">
        {Object.entries(grouped).map(([category, skills]) => (
          <div key={category}>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              {CATEGORY_LABELS[category as SkillCategory] ?? category}
            </h3>
            <StaggerGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <StaggerItem key={skill.id}>
                  <FlipCard
                    heightClass="h-[4.75rem]"
                    front={<SkillFront skill={skill} />}
                    back={<SkillBack skill={skill} />}
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        ))}
      </div>
    </section>
  );
}
