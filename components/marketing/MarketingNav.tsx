"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function MarketingNav({
  onGetStarted,
  loading,
}: {
  onGetStarted: () => void;
  loading: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
        Portfolio<span className="gradient-text">Maker</span>
      </span>
      <div className="flex items-center gap-3">
        {mounted && (
          <button
            aria-label="Toggle color theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}
        <Button onClick={onGetStarted} disabled={loading} className="!px-5 !py-2 text-xs">
          Sign in
        </Button>
      </div>
    </nav>
  );
}
