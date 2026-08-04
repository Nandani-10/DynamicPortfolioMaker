"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { GradientOrbs } from "@/components/effects/GradientOrbs";
import { PageFadeIn } from "@/components/effects/PageFadeIn";
import {
  claimUsernameAndCreatePortfolio,
  isUsernameAvailable,
} from "@/lib/firestore/portfolio";
import { normalizeUsername, validateUsername } from "@/lib/portfolio-defaults";

type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

export default function OnboardingPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [availability, setAvailability] = useState<Availability>("idle");
  const [reason, setReason] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profile) {
      router.replace("/dashboard");
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const clean = normalizeUsername(username);
    if (!clean) {
      setAvailability("idle");
      return;
    }

    const validation = validateUsername(clean);
    if (!validation.valid) {
      setAvailability("invalid");
      setReason(validation.reason ?? null);
      return;
    }

    setAvailability("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const available = await isUsernameAvailable(clean);
        setAvailability(available ? "available" : "taken");
      } catch {
        setAvailability("idle");
      }
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || availability !== "available") return;
    setSubmitting(true);
    setSubmitError(null);
    const clean = normalizeUsername(username);
    try {
      await claimUsernameAndCreatePortfolio({
        uid: user.uid,
        username: clean,
        email: user.email,
        displayName: user.displayName,
      });
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof Error && err.message === "USERNAME_TAKEN") {
        setAvailability("taken");
      } else {
        setSubmitError("Something went wrong claiming that username. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const previewUrl = `yoursite.com/${normalizeUsername(username) || "you"}`;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-6 py-16 text-[var(--text)]">
      <GradientOrbs />
      <PageFadeIn>
        <form
          onSubmit={handleSubmit}
          className="glass relative w-full max-w-md rounded-3xl p-8 shadow-[var(--shadow-soft)]"
        >
          <h1 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
            Claim your portfolio link
          </h1>
          <p className="mb-6 text-sm text-[var(--text-muted)]">
            This becomes your public, shareable portfolio URL. You can change it later.
          </p>

          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Username
          </label>
          <div className="relative mb-1">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="janedoe"
              autoFocus
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 pr-10 text-sm outline-none transition-colors focus:border-[var(--accent-2)]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {availability === "checking" && (
                <Loader2 className="h-4 w-4 animate-spin text-[var(--text-muted)]" />
              )}
              {availability === "available" && <Check className="h-4 w-4 text-emerald-500" />}
              {(availability === "taken" || availability === "invalid") && (
                <X className="h-4 w-4 text-red-400" />
              )}
            </span>
          </div>

          <p className="mb-6 text-xs text-[var(--text-muted)]">
            {availability === "taken" && "That username is already taken."}
            {availability === "invalid" && reason}
            {availability === "available" && `Great — your link will be ${previewUrl}`}
            {availability === "idle" && `Preview: ${previewUrl}`}
            {availability === "checking" && "Checking availability…"}
          </p>

          {submitError && <p className="mb-4 text-sm text-red-400">{submitError}</p>}

          <Button
            type="submit"
            disabled={availability !== "available" || submitting}
            className="w-full"
          >
            {submitting ? "Creating your portfolio…" : "Claim & continue"}
          </Button>
        </form>
      </PageFadeIn>
    </div>
  );
}
