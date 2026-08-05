"use client";

import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { PortfolioThemeRoot } from "@/components/portfolio/PortfolioThemeRoot";
import { PublicNav } from "@/components/portfolio/PublicNav";
import { PortfolioHero } from "@/components/hero/PortfolioHero";
import { AboutSection } from "@/components/sections/AboutSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { CertificationsSection } from "@/components/sections/CertificationsSection";
import { AwardsSection } from "@/components/sections/AwardsSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { OpenSourceSection } from "@/components/sections/OpenSourceSection";
import { BlogsSection } from "@/components/sections/BlogsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { PortfolioFooter } from "@/components/sections/PortfolioFooter";
import { CursorFollower } from "@/components/effects/CursorFollower";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { BackToTop } from "@/components/effects/BackToTop";
import { resolveThemeColors } from "@/lib/themes";
import type { Portfolio } from "@/types/portfolio";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export function PortfolioView({ portfolio }: { portfolio: Portfolio }) {
  const { user, loading } = useAuth();
  const isOwner = !!user && user.uid === portfolio.ownerUid;

  if (!portfolio.published && !isOwner) {
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-muted)]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      );
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--bg)] px-6 text-center text-[var(--text)]">
        <Lock className="h-6 w-6 text-[var(--text-muted)]" />
        <h1 className="text-lg font-medium">This portfolio isn&apos;t public yet</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Check back later, or reach out to {portfolio.hero.name} directly.
        </p>
      </div>
    );
  }

  const themeColors = resolveThemeColors(
    portfolio.theme.preset,
    portfolio.theme.mode === "dark" ? "dark" : "light",
    portfolio.theme.accentColor
  );
  const ringPalette = [
    themeColors.accent1,
    themeColors.accent2,
    themeColors.accent3,
  ];

  return (
    <PortfolioThemeRoot theme={portfolio.theme}>
      <CursorFollower />
      <ScrollProgress />
      <BackToTop />
      {!portfolio.published && isOwner && (
        <div className="sticky top-0 z-50 bg-amber-500 px-4 py-2 text-center text-xs font-medium text-black">
          Private preview — only you can see this until you publish from the dashboard.
        </div>
      )}
      <div id="top">
        <PublicNav name={portfolio.hero.name} links={NAV_LINKS} />
        <PortfolioHero hero={portfolio.hero} social={portfolio.social} />
        <AboutSection about={portfolio.about} />
        <EducationSection items={portfolio.education} />
        <ExperienceSection items={portfolio.experience} />
        <SkillsSection items={portfolio.skills} />
        <ProjectsSection items={portfolio.projects} />
        <CertificationsSection items={portfolio.certifications} />
        <AwardsSection items={portfolio.awards} />
        <AchievementsSection items={portfolio.achievements} />
        <OpenSourceSection items={portfolio.openSource} />
        <BlogsSection items={portfolio.blogs} />
        <TestimonialsSection items={portfolio.testimonials} />
        <ContactSection contact={portfolio.contact} ringPalette={ringPalette} />
        <PortfolioFooter hero={portfolio.hero} />
      </div>
    </PortfolioThemeRoot>
  );
}
