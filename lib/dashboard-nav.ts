import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Briefcase,
  Contact,
  FileBadge,
  FolderKanban,
  GaugeCircle,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  MessageSquareQuote,
  Palette,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/hero", label: "Hero", icon: Sparkles },
  { href: "/dashboard/about", label: "About Me", icon: User },
  { href: "/dashboard/education", label: "Education", icon: GraduationCap },
  { href: "/dashboard/experience", label: "Experience", icon: Briefcase },
  { href: "/dashboard/skills", label: "Skills", icon: GaugeCircle },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/certifications", label: "Certifications", icon: FileBadge },
  { href: "/dashboard/awards", label: "Awards & Recognition", icon: Award },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/dashboard/open-source", label: "Open Source", icon: GitBranch },
  { href: "/dashboard/blogs", label: "Blogs & Publications", icon: BookOpen },
  { href: "/dashboard/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/dashboard/contact", label: "Contact & Social", icon: Contact },
  { href: "/dashboard/theme", label: "Theme", icon: Palette },
];
