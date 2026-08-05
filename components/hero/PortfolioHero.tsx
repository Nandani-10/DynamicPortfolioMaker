"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";
import { TypeAnimation } from "react-type-animation";
import CountUp from "react-countup";
import { ChevronDown, Download, Mail } from "lucide-react";
import {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaInstagram,
  FaYoutube,
  FaDribbble,
  FaGlobe,
} from "react-icons/fa6";
import { GradientOrbs } from "@/components/effects/GradientOrbs";
import { WaterDropGrid } from "@/components/hero/WaterDropGrid";
import { Button } from "@/components/ui/Button";
import type { HeroContent, SocialLinks } from "@/types/portfolio";

const SOCIAL_ICONS: Record<keyof SocialLinks, typeof FaGithub> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  twitter: FaXTwitter,
  instagram: FaInstagram,
  youtube: FaYoutube,
  dribbble: FaDribbble,
  website: FaGlobe,
};

const NAME_CONTAINER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.2 } },
};

const NAME_LETTER: Variants = {
  hidden: { opacity: 0, y: 24, rotateX: -60 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function PortfolioHero({
  hero,
  social,
}: {
  hero: HeroContent;
  social: SocialLinks;
}) {
  const socialEntries = (Object.keys(SOCIAL_ICONS) as (keyof SocialLinks)[]).filter(
    (key) => social[key]
  );

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bannerY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={sectionRef} className="relative flex min-h-screen flex-col overflow-hidden">
      <GradientOrbs />
      <WaterDropGrid />

      {hero.bannerImage && (
        <motion.div className="absolute inset-x-0 top-0 z-[1] h-64 sm:h-80" style={{ y: bannerY }}>
          <Image
            src={hero.bannerImage}
            alt=""
            fill
            priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg)]" />
        </motion.div>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        {hero.profileImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-[var(--surface)] shadow-[var(--shadow-soft)] sm:h-40 sm:w-40"
          >
            <Image
              src={hero.profileImage}
              alt={hero.name}
              fill
              priority
              className="object-cover"
              sizes="160px"
            />
          </motion.div>
        )}

        <motion.h1
          variants={NAME_CONTAINER}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-6xl"
          style={{ perspective: 800 }}
        >
          {hero.name.split("").map((char, i) => (
            <motion.span key={i} variants={NAME_LETTER} className="inline-block">
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </motion.h1>

        {hero.roles.length > 0 && (
          <div className="gradient-text font-[family-name:var(--font-display)] text-xl font-medium sm:text-2xl">
            <TypeAnimation
              sequence={hero.roles.flatMap((role) => [role, 2000])}
              wrapper="span"
              speed={55}
              deletionSpeed={65}
              repeat={Infinity}
            />
          </div>
        )}

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="max-w-2xl text-balance text-[var(--text-muted)] sm:text-lg"
        >
          {hero.intro}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {hero.resumeUrl && (
            <Button href={hero.resumeUrl}>
              <Download className="h-4 w-4" /> Download Resume
            </Button>
          )}
          <Button href="#contact" variant="secondary">
            <Mail className="h-4 w-4" /> Contact Me
          </Button>
        </motion.div>

        {socialEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex items-center gap-4"
          >
            {socialEntries.map((key) => {
              const Icon = SOCIAL_ICONS[key];
              return (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor-hover
                  aria-label={key}
                  className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-2)]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </motion.div>
        )}

        {hero.stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-10"
          >
            {hero.stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--accent-3)] dark:text-[var(--accent-1)]">
                  <CountUp end={stat.value} duration={2} enableScrollSpy scrollSpyOnce />
                  {stat.suffix}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 mx-auto mb-8 flex flex-col items-center gap-1 text-[var(--text-muted)]"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="h-4 w-4" />
      </motion.div>
    </section>
  );
}
