import type { ContentSectionKey, SectionSetting } from "@/types/portfolio";

/**
 * The public page used to render a fixed sequence of sections with fixed
 * headings, which made every portfolio on the platform structurally
 * identical. Owners now control order, visibility, headings, and which
 * sections reach the nav — this registry is the single source of truth for
 * the defaults everything falls back to.
 */

export interface SectionDefinition {
  key: ContentSectionKey;
  /** Heading shown on the public page unless the owner renames it. */
  defaultLabel: string;
  /** Small uppercase line above the heading. */
  eyebrow: string;
  /** DOM id, and the `#anchor` the nav links to. */
  anchor: string;
  /** Whether this section appears in the nav for a brand-new portfolio. */
  navByDefault: boolean;
}

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  { key: "about", defaultLabel: "About Me", eyebrow: "Get to know me", anchor: "about", navByDefault: true },
  { key: "education", defaultLabel: "Education", eyebrow: "Academics", anchor: "education", navByDefault: false },
  { key: "experience", defaultLabel: "Work Experience", eyebrow: "Career", anchor: "experience", navByDefault: true },
  { key: "skills", defaultLabel: "Skills", eyebrow: "Toolbox", anchor: "skills", navByDefault: true },
  { key: "projects", defaultLabel: "Projects", eyebrow: "Selected work", anchor: "projects", navByDefault: true },
  { key: "certifications", defaultLabel: "Certifications", eyebrow: "Credentials", anchor: "certifications", navByDefault: false },
  { key: "awards", defaultLabel: "Awards & Recognition", eyebrow: "Recognition", anchor: "awards", navByDefault: false },
  { key: "achievements", defaultLabel: "Achievements", eyebrow: "Milestones", anchor: "achievements", navByDefault: false },
  { key: "openSource", defaultLabel: "Open Source Contributions", eyebrow: "Community", anchor: "open-source", navByDefault: false },
  { key: "blogs", defaultLabel: "Blogs & Publications", eyebrow: "Writing", anchor: "blogs", navByDefault: false },
  { key: "testimonials", defaultLabel: "Testimonials", eyebrow: "Kind words", anchor: "testimonials", navByDefault: false },
  { key: "contact", defaultLabel: "Contact", eyebrow: "Let's talk", anchor: "contact", navByDefault: true },
];

const DEFINITIONS_BY_KEY = new Map(SECTION_DEFINITIONS.map((d) => [d.key, d]));

export interface ResolvedSection extends SectionDefinition {
  /** The owner's heading if they set one, otherwise `defaultLabel`. */
  label: string;
  visible: boolean;
  inNav: boolean;
}

function toResolved(definition: SectionDefinition, setting?: SectionSetting): ResolvedSection {
  const label = setting?.label?.trim();
  return {
    ...definition,
    label: label || definition.defaultLabel,
    visible: setting?.visible ?? true,
    inNav: setting?.inNav ?? definition.navByDefault,
  };
}

/**
 * Turns stored settings into the sequence the page renders.
 *
 * Portfolios created before this feature have no settings at all, and a
 * portfolio saved before a new section type existed won't mention it — both
 * cases fall back to the registry defaults rather than dropping sections.
 * Unrecognised keys (a section we removed) are ignored.
 */
export function resolveSections(settings?: SectionSetting[]): ResolvedSection[] {
  if (!settings || settings.length === 0) {
    return SECTION_DEFINITIONS.map((definition) => toResolved(definition));
  }

  const seen = new Set<ContentSectionKey>();
  const ordered: ResolvedSection[] = [];

  for (const setting of settings) {
    const definition = DEFINITIONS_BY_KEY.get(setting.key);
    if (!definition || seen.has(setting.key)) continue;
    seen.add(setting.key);
    ordered.push(toResolved(definition, setting));
  }

  for (const definition of SECTION_DEFINITIONS) {
    if (!seen.has(definition.key)) ordered.push(toResolved(definition));
  }

  return ordered;
}

/** The settings shape a brand-new portfolio starts from. */
export function defaultSectionSettings(): SectionSetting[] {
  return SECTION_DEFINITIONS.map((definition) => ({
    key: definition.key,
    visible: true,
    inNav: definition.navByDefault,
  }));
}
