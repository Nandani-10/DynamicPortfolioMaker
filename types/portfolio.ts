export type ThemeMode = "light" | "dark" | "system";

export type ThemePreset =
  | "berryDusk"
  | "ocean"
  | "midnight"
  | "emerald"
  | "classicMono";

export interface PortfolioTheme {
  preset: ThemePreset;
  mode: ThemeMode;
  accentColor?: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  dribbble?: string;
  website?: string;
}

export interface HeroContent {
  name: string;
  roles: string[];
  intro: string;
  profileImage?: string;
  bannerImage?: string;
  resumeUrl?: string;
  stats: StatItem[];
}

export interface AboutContent {
  bio: string;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
  companyLogo?: string;
}

export type SkillCategory =
  // Technical
  | "language"
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "design"
  | "tools"
  // Commerce & business
  | "accounting"
  | "finance"
  | "marketing"
  | "sales"
  | "business"
  | "analytics"
  | "softSkills"
  | "other";

export interface SkillItem {
  id: string;
  name: string;
  level: number; // 0-100
  category: SkillCategory;
  icon?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  thumbnail?: string;
  gallery?: string[];
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  features?: string[];
  challenges?: string;
  learnings?: string;
  featured?: boolean;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl?: string;
  credentialUrl?: string;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  date?: string;
  description?: string;
}

export interface OpenSourceItem {
  id: string;
  repo: string;
  url: string;
  description?: string;
  role?: string;
}

export interface BlogItem {
  id: string;
  title: string;
  url: string;
  publishedAt?: string;
  excerpt?: string;
  coverImage?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  quote: string;
}

export interface ContactContent {
  email?: string;
  phone?: string;
  location?: string;
  mapEmbedUrl?: string;
  calendlyUrl?: string;
  formEnabled: boolean;
}

export interface Portfolio {
  ownerUid: string;
  username: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
  theme: PortfolioTheme;
  hero: HeroContent;
  about: AboutContent;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  awards: AwardItem[];
  achievements: AchievementItem[];
  openSource: OpenSourceItem[];
  blogs: BlogItem[];
  testimonials: TestimonialItem[];
  social: SocialLinks;
  contact: ContactContent;
}

export type PortfolioSectionKey =
  | "hero"
  | "about"
  | "education"
  | "experience"
  | "skills"
  | "projects"
  | "certifications"
  | "awards"
  | "achievements"
  | "openSource"
  | "blogs"
  | "testimonials"
  | "social"
  | "contact"
  | "theme";

export interface UserProfile {
  uid: string;
  username: string;
  email: string | null;
  displayName: string | null;
  createdAt: number;
}
