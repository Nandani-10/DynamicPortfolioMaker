import { nanoid } from "nanoid";
import type {
  EducationItem,
  ExperienceItem,
  SkillCategory,
  SkillItem,
  SocialLinks,
} from "@/types/portfolio";

/**
 * Heuristic resume parser.
 *
 * Resumes have no schema — every one lays its sections out differently — so
 * everything here is a guess based on headings, labels, and date patterns.
 * Nothing it produces is written straight into a portfolio: the import UI
 * shows each field for the owner to accept or reject, because a confident
 * wrong answer published on someone's portfolio is worse than no answer.
 */

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  roles: string[];
  summary?: string;
  social: SocialLinks;
  skills: SkillItem[];
  education: EducationItem[];
  experience: ExperienceItem[];
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
// Deliberately loose: international formats vary wildly. Requires 7+ digits so
// it doesn't match years, zip codes, or "C++11".
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const URL_RE = /((?:https?:\/\/|www\.)[^\s,;]+|[\w-]+\.(?:com|dev|io|me|net|org)\/[^\s,;]+)/gi;

const MONTH = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*";
const DATE_RANGE_RE = new RegExp(
  `((?:${MONTH}\\s*)?\\d{4})\\s*(?:-|–|—|to)\\s*((?:${MONTH}\\s*)?\\d{4}|Present|Current|Now)`,
  "i"
);
const LOCATION_RE = /^[A-Z][A-Za-z.\- ]+,\s*[A-Z][A-Za-z.\- ]{1,20}$/;

type SectionName =
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "awards"
  | "other";

const SECTION_PATTERNS: [SectionName, RegExp][] = [
  ["summary", /^(professional\s+)?(summary|profile|objective|about\s*me|about)$/i],
  ["skills", /^(technical\s+|core\s+|key\s+)?(skills|competencies|technologies|tech\s+stack|expertise)$/i],
  ["experience", /^(work\s+|professional\s+|employment\s+)?(experience|history|employment)$/i],
  ["education", /^(education|academics|academic\s+background|qualifications)$/i],
  ["projects", /^(projects|personal\s+projects|selected\s+projects)$/i],
  ["certifications", /^(certifications?|licenses?|courses)$/i],
  ["awards", /^(awards?|honors?|achievements?|recognition)$/i],
];

/**
 * A heading is short, has no sentence punctuation, and names a known section.
 * Length and punctuation checks matter because "Experience building X" is a
 * bullet point, not a heading.
 */
function headingFor(line: string): SectionName | null {
  const cleaned = line.replace(/[:•\-–—]+$/g, "").trim();
  if (cleaned.length === 0 || cleaned.length > 40) return null;
  if (/[.;]/.test(cleaned)) return null;
  for (const [name, pattern] of SECTION_PATTERNS) {
    if (pattern.test(cleaned)) return name;
  }
  return null;
}

function groupBySection(lines: string[]): Map<SectionName, string[]> {
  const sections = new Map<SectionName, string[]>();
  // Everything above the first heading is the header block: name, contact
  // details, sometimes a title.
  let current: SectionName = "other";

  for (const line of lines) {
    const heading = headingFor(line);
    if (heading) {
      current = heading;
      if (!sections.has(current)) sections.set(current, []);
      continue;
    }
    const bucket = sections.get(current);
    if (bucket) bucket.push(line);
    else sections.set(current, [line]);
  }

  return sections;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.replace(/[.,;)]+$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^www\./i, "")}`;
}

function extractSocial(text: string): SocialLinks {
  const social: SocialLinks = {};
  const matches = text.match(URL_RE) ?? [];

  for (const match of matches) {
    const url = normalizeUrl(match);
    const lower = url.toLowerCase();
    if (lower.includes("github.com") && !social.github) social.github = url;
    else if (lower.includes("linkedin.com") && !social.linkedin) social.linkedin = url;
    else if ((lower.includes("twitter.com") || lower.includes("x.com")) && !social.twitter)
      social.twitter = url;
    else if (lower.includes("instagram.com") && !social.instagram) social.instagram = url;
    else if (lower.includes("dribbble.com") && !social.dribbble) social.dribbble = url;
    else if (
      !social.website &&
      !/(github|linkedin|twitter|x\.com|instagram|dribbble|mailto)/i.test(lower)
    ) {
      social.website = url;
    }
  }

  return social;
}

/**
 * The name is almost always the first line, but only if it looks like a name:
 * no digits, no @, a handful of words. A resume that opens with a heading or
 * a contact line gets no name rather than a wrong one.
 */
function extractName(headerLines: string[]): string | undefined {
  for (const line of headerLines.slice(0, 4)) {
    const candidate = line.replace(/\s+/g, " ").trim();
    if (!candidate || candidate.length > 48) continue;
    if (/[@\d]|https?:/i.test(candidate)) continue;
    const words = candidate.split(" ");
    if (words.length < 2 || words.length > 4) continue;
    if (!words.every((word) => /^[A-Z][A-Za-z'’.-]*$/.test(word))) continue;
    return candidate;
  }
  return undefined;
}

/** The line under the name is usually a title: "Senior Frontend Engineer". */
function extractRoles(headerLines: string[], name?: string): string[] {
  for (const line of headerLines.slice(0, 5)) {
    const candidate = line.trim();
    if (!candidate || candidate === name) continue;
    if (/[@]|https?:|^\+?\d/.test(candidate)) continue;
    // Job titles run long occasionally ("Senior Software Engineer in Test")
    // but not much past six words; beyond that it's prose, not a title.
    if (candidate.length > 60 || candidate.split(" ").length > 6) continue;
    if (LOCATION_RE.test(candidate)) continue;
    // Split "Designer | Developer" or "Designer & Developer" into separate roles.
    return candidate
      .split(/\s*[|•·/]\s*|\s+&\s+/)
      .map((role) => role.trim())
      .filter((role) => role.length > 2 && role.length < 40);
  }
  return [];
}

function extractLocation(headerLines: string[]): string | undefined {
  for (const line of headerLines) {
    for (const part of line.split(/\s*[|•·]\s*/)) {
      const candidate = part.trim();
      if (LOCATION_RE.test(candidate)) return candidate;
    }
  }
  return undefined;
}

/** Category is guessed from the skill name; the owner can re-file it after. */
function categorize(skill: string): SkillCategory {
  const s = skill.toLowerCase();
  if (/(react|vue|angular|svelte|next|tailwind|css|html|jquery|bootstrap)/.test(s)) return "frontend";
  if (/(node|express|django|flask|spring|rails|laravel|\.net|fastapi|graphql)/.test(s)) return "backend";
  if (/(sql|postgres|mysql|mongo|redis|firestore|dynamo|oracle|sqlite)/.test(s)) return "database";
  if (/(docker|kubernetes|aws|azure|gcp|terraform|jenkins|ci\/cd|linux)/.test(s)) return "devops";
  if (/(figma|sketch|photoshop|illustrator|xd|canva|ui\/ux|wireframe)/.test(s)) return "design";
  if (/(javascript|typescript|python|java|c\+\+|c#|go|rust|ruby|php|swift|kotlin|scala)/.test(s))
    return "language";
  if (/(tally|quickbooks|gst|taxation|audit|bookkeep|accounts?\b|ledger)/.test(s)) return "accounting";
  if (/(financ|invest|valuation|budget|forecast)/.test(s)) return "finance";
  if (/(seo|marketing|brand|campaign|social media|content)/.test(s)) return "marketing";
  if (/(sales|crm|lead gen|negotiat)/.test(s)) return "sales";
  if (/(excel|power ?bi|tableau|analytics|statistic|data analysis)/.test(s)) return "analytics";
  if (/(communicat|leadership|teamwork|problem[- ]solving|time management)/.test(s)) return "softSkills";
  if (/(git|jira|figma|slack|notion|postman|vs ?code)/.test(s)) return "tools";
  return "other";
}

function extractSkills(lines: string[]): SkillItem[] {
  const names = new Set<string>();

  for (const line of lines) {
    // Strip a leading label like "Languages:" so it isn't read as a skill.
    const body = line.replace(/^[^:]{0,30}:\s*/, "");
    for (const piece of body.split(/[,;|•·]|\s{3,}/)) {
      const skill = piece.replace(/^[-–—\s]+|[.\s]+$/g, "").trim();
      if (skill.length < 2 || skill.length > 28) continue;
      if (/^\d+$/.test(skill)) continue;
      if (skill.split(" ").length > 4) continue;
      names.add(skill);
    }
  }

  // 70 is a neutral "competent" default — inventing a precise number per skill
  // would be fabricating a self-assessment the resume never made.
  return [...names].slice(0, 40).map((name) => ({
    id: nanoid(8),
    name,
    level: 70,
    category: categorize(name),
  }));
}

interface DatedBlock {
  lines: string[];
  start: string;
  end: string;
  current: boolean;
}

/**
 * Splits a section into entries, starting a new one at each line carrying a
 * date range — the one structural signal resumes reliably share.
 */
function splitDatedBlocks(lines: string[]): DatedBlock[] {
  const blocks: DatedBlock[] = [];
  let block: DatedBlock | null = null;

  for (const line of lines) {
    const match = DATE_RANGE_RE.exec(line);
    if (match) {
      if (block) blocks.push(block);
      const end = match[2];
      block = {
        lines: [line.replace(match[0], "").replace(/[|•·,\-–—]\s*$/, "").trim()],
        start: match[1].trim(),
        end: /present|current|now/i.test(end) ? "" : end.trim(),
        current: /present|current|now/i.test(end),
      };
    } else if (block) {
      block.lines.push(line);
    }
  }

  if (block) blocks.push(block);
  return blocks.filter((b) => b.lines.some(Boolean));
}

function extractExperience(lines: string[]): ExperienceItem[] {
  return splitDatedBlocks(lines).map((block) => {
    const [headline = "", ...rest] = block.lines.filter(Boolean);
    // "Senior Engineer at Acme" / "Senior Engineer, Acme" / "Senior Engineer | Acme"
    const split = headline.split(/\s+(?:at|@)\s+|\s*[|•·]\s*|,\s+/);
    const role = split[0]?.trim() ?? "";
    const company = split[1]?.trim() ?? "";

    const bullets = rest.filter((line) => /^[-–—•*]/.test(line));
    const prose = rest.filter((line) => !/^[-–—•*]/.test(line));

    // Optional keys are omitted rather than set to `undefined`: these objects
    // are written straight to Firestore, which rejects the whole document if
    // one appears anywhere in it.
    const description = prose.join(" ").trim();

    return {
      id: nanoid(8),
      role: role || headline,
      company,
      startDate: block.start,
      endDate: block.end,
      current: block.current,
      ...(description ? { description } : {}),
      highlights: bullets.map((b) => b.replace(/^[-–—•*]\s*/, "").trim()).filter(Boolean),
    };
  });
}

function extractEducation(lines: string[]): EducationItem[] {
  return splitDatedBlocks(lines).map((block) => {
    const [headline = "", ...rest] = block.lines.filter(Boolean);
    const parts = headline
      .split(/\s*[|•·]\s*|,\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    // Degrees usually lead with "B.Sc", "Bachelor", "MBA"; institutions don't.
    const degreeFirst = /^(b\.?[a-z]{1,4}|m\.?[a-z]{1,4}|ph\.?d|bachelor|master|diploma|mba|bsc|msc|btech|mtech)/i.test(
      headline
    );

    // Three parts is "Degree, Field, Institution" — the middle one is the
    // field of study, which has its own slot. Treating it as the institution
    // would file "Computer Engineering" as a university.
    let degree = "";
    let field: string | undefined;
    let institution = "";

    if (degreeFirst) {
      degree = parts[0] ?? "";
      institution = parts.length > 1 ? parts[parts.length - 1] : "";
      if (parts.length > 2) field = parts.slice(1, -1).join(", ");
    } else {
      institution = parts[0] ?? "";
      degree = parts.slice(1).join(", ");
    }

    const description = rest.join(" ").trim();

    return {
      id: nanoid(8),
      degree,
      ...(field ? { field } : {}),
      institution,
      startDate: block.start,
      endDate: block.end,
      ...(description ? { description } : {}),
    };
  });
}

export function parseResume(lines: string[]): ParsedResume {
  const text = lines.join("\n");
  const sections = groupBySection(lines);
  const header = sections.get("other") ?? [];

  const name = extractName(header);

  return {
    name,
    email: EMAIL_RE.exec(text)?.[0],
    phone: PHONE_RE.exec(text)?.[0]?.trim(),
    location: extractLocation(header),
    roles: extractRoles(header, name),
    summary: (sections.get("summary") ?? []).join(" ").trim() || undefined,
    social: extractSocial(text),
    skills: extractSkills(sections.get("skills") ?? []),
    education: extractEducation(sections.get("education") ?? []),
    experience: extractExperience(sections.get("experience") ?? []),
  };
}
