"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import type { SkillCategory, SkillItem } from "@/types/portfolio";

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  language: "Languages",
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  devops: "DevOps",
  design: "Design",
  tools: "Tools",
  other: "Other",
};

export function SkillsSection({ items }: { items: SkillItem[] }) {
  if (items.length === 0) return null;

  const grouped = items.reduce<Record<string, SkillItem[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});

  return (
    <section id="skills" className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading
        eyebrow="Toolbox"
        title="Skills"
        description="Technologies and tools I use to bring ideas to life."
      />
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        {Object.entries(grouped).map(([category, skills]) => (
          <div key={category}>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              {CATEGORY_LABELS[category as SkillCategory] ?? category}
            </h3>
            <StaggerGroup className="space-y-4">
              {skills.map((skill) => (
                <StaggerItem key={skill.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span>{skill.name}</span>
                    <span className="text-[var(--text-muted)]">{skill.level}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-alt)]">
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
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        ))}
      </div>
    </section>
  );
}
