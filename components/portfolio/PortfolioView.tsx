"use client";

import { Fragment } from "react";
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
import { resolveSections, type ResolvedSection } from "@/lib/sections";
import { resolveThemeColors } from "@/lib/themes";
import type { ContentSectionKey, Portfolio } from "@/types/portfolio";

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

  const sections = resolveSections(portfolio.sections);

  /**
   * Sections render `null` when they have nothing to show, so the nav has to
   * agree with them — otherwise an owner who enables a section they haven't
   * filled in yet gets a nav link that scrolls nowhere.
   */
  const hasContent: Record<ContentSectionKey, boolean> = {
    about: Boolean(portfolio.about.bio || portfolio.about.highlights.length),
    education: portfolio.education.length > 0,
    experience: portfolio.experience.length > 0,
    skills: portfolio.skills.length > 0,
    projects: portfolio.projects.length > 0,
    certifications: portfolio.certifications.length > 0,
    awards: portfolio.awards.length > 0,
    achievements: portfolio.achievements.length > 0,
    openSource: portfolio.openSource.length > 0,
    blogs: portfolio.blogs.length > 0,
    testimonials: portfolio.testimonials.length > 0,
    contact: Boolean(
      portfolio.contact.email ||
        portfolio.contact.phone ||
        portfolio.contact.location ||
        portfolio.contact.formEnabled ||
        portfolio.contact.mapEmbedUrl ||
        portfolio.contact.calendlyUrl
    ),
  };

  function renderSection(section: ResolvedSection) {
    switch (section.key) {
      case "about":
        return <AboutSection about={portfolio.about} title={section.label} />;
      case "education":
        return <EducationSection items={portfolio.education} title={section.label} />;
      case "experience":
        return <ExperienceSection items={portfolio.experience} title={section.label} />;
      case "skills":
        return <SkillsSection items={portfolio.skills} title={section.label} />;
      case "projects":
        return <ProjectsSection items={portfolio.projects} title={section.label} />;
      case "certifications":
        return <CertificationsSection items={portfolio.certifications} title={section.label} />;
      case "awards":
        return <AwardsSection items={portfolio.awards} title={section.label} />;
      case "achievements":
        return <AchievementsSection items={portfolio.achievements} title={section.label} />;
      case "openSource":
        return <OpenSourceSection items={portfolio.openSource} title={section.label} />;
      case "blogs":
        return <BlogsSection items={portfolio.blogs} title={section.label} />;
      case "testimonials":
        return <TestimonialsSection items={portfolio.testimonials} title={section.label} />;
      case "contact":
        return (
          <ContactSection
            contact={portfolio.contact}
            ringPalette={ringPalette}
            title={section.label}
          />
        );
    }
  }

  const navLinks = sections
    .filter((section) => section.visible && section.inNav && hasContent[section.key])
    .map((section) => ({ href: `#${section.anchor}`, label: section.label }));

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
        <PublicNav name={portfolio.hero.name} links={navLinks} />
        <PortfolioHero hero={portfolio.hero} social={portfolio.social} />
        {sections
          .filter((section) => section.visible)
          .map((section) => (
            <Fragment key={section.key}>{renderSection(section)}</Fragment>
          ))}
        <PortfolioFooter hero={portfolio.hero} />
      </div>
    </PortfolioThemeRoot>
  );
}
