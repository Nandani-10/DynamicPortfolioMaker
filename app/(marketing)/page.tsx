"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Palette, Share2, ShieldCheck, Wand2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { ScrollReveal, StaggerGroup, StaggerItem } from "@/components/effects/ScrollReveal";
import { GradientOrbs } from "@/components/effects/GradientOrbs";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { describeAuthError } from "@/lib/auth-errors";

const FEATURES = [
  {
    icon: Wand2,
    title: "Build without code",
    description:
      "A guided dashboard for Hero, About, Experience, Projects, Certifications and more — no code required.",
  },
  {
    icon: Palette,
    title: "Rich, premium themes",
    description:
      "Pick a curated color palette and light/dark mode. Every section adapts instantly, everywhere.",
  },
  {
    icon: Share2,
    title: "One unique public link",
    description:
      "Publish to yoursite.com/you — share it anywhere. Visitors see your live, animated portfolio instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Your data, your control",
    description:
      "Sign in with Google. Only you can edit your portfolio; you decide when it's public.",
  },
];

export default function MarketingHome() {
  const { user, profile, loading, signInWithGoogle, redirectError } = useAuth();
  const router = useRouter();
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    router.replace(profile ? "/dashboard" : "/onboarding");
  }, [loading, user, profile, router]);

  async function handleGetStarted() {
    setSignInError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      setSignInError(describeAuthError(error));
    }
  }

  const visibleError =
    signInError ?? (redirectError ? describeAuthError(redirectError) : null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <GradientOrbs />
      <MarketingNav onGetStarted={handleGetStarted} loading={loading} />

      <section className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 pb-24 pt-28 text-center sm:pt-36">
        <ScrollReveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-1.5 text-xs font-medium text-[var(--text-muted)] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Your portfolio, published in minutes
          </span>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Build a <span className="gradient-text">premium portfolio</span>
            <br />
            without writing a line of code
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="max-w-2xl text-balance text-lg text-[var(--text-muted)]">
            Sign in with Google, customize every section from a beautiful dashboard —
            Hero, Projects, Experience, Skills, Certifications and more — and share one
            unique public link with the world.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button onClick={handleGetStarted} disabled={loading}>
              Get started with Google
            </Button>
            <Button href="#features" variant="secondary" magnetic={false}>
              See what&apos;s included
            </Button>
          </div>
        </ScrollReveal>

        {visibleError && (
          <p
            role="alert"
            className="max-w-xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500"
          >
            {visibleError}
          </p>
        )}
      </section>

      <section id="features" className="relative mx-auto max-w-6xl px-6 pb-28">
        <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="card-surface group h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-alt)] text-[var(--accent-3)] transition-colors group-hover:bg-[var(--accent-1)]/20">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{feature.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <footer className="relative border-t border-[var(--border)] px-6 py-8 text-center text-sm text-[var(--text-muted)]">
        Dynamic Portfolio Maker — build once, share everywhere.
      </footer>
    </div>
  );
}
