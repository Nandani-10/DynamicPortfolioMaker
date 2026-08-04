"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { GradientOrbs } from "@/components/effects/GradientOrbs";
import { PageFadeIn } from "@/components/effects/PageFadeIn";

export default function LoginPage() {
  const { user, profile, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    router.replace(profile ? "/dashboard" : "/onboarding");
  }, [loading, user, profile, router]);

  async function handleSignIn() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError("Sign-in was cancelled or failed. Please try again.");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-6 text-[var(--text)]">
      <GradientOrbs />
      <PageFadeIn>
        <div className="glass relative w-full max-w-sm rounded-3xl p-8 text-center shadow-[var(--shadow-soft)]">
          <h1 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
            Welcome back
          </h1>
          <p className="mb-8 text-sm text-[var(--text-muted)]">
            Sign in with Google to build or manage your portfolio.
          </p>
          <Button onClick={handleSignIn} disabled={loading} className="w-full">
            Continue with Google
          </Button>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
      </PageFadeIn>
    </div>
  );
}
