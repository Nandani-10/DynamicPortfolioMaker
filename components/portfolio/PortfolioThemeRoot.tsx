"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { resolveThemeColors, themeToCssVariables } from "@/lib/themes";
import type { PortfolioTheme } from "@/types/portfolio";

export function PortfolioThemeRoot({
  theme,
  children,
}: {
  theme: PortfolioTheme;
  children: ReactNode;
}) {
  const [isDark, setIsDark] = useState(theme.mode === "dark");
  const [overridden, setOverridden] = useState(theme.mode !== "system");

  useEffect(() => {
    if (theme.mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mql.matches);
    const listener = (e: MediaQueryListEvent) => {
      if (!overridden) setIsDark(e.matches);
    };
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.mode]);

  const colors = resolveThemeColors(theme.preset, isDark ? "dark" : "light", theme.accentColor);
  const cssVarsText = themeToCssVariables(colors);
  const style = Object.fromEntries(
    cssVarsText
      .split(";")
      .map((rule) => rule.trim())
      .filter(Boolean)
      .map((rule) => {
        const [key, value] = rule.split(":").map((s) => s.trim());
        return [key, value];
      })
  ) as CSSProperties;

  return (
    <div
      className={`${isDark ? "dark" : ""} relative min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-500`}
      style={style}
    >
      <button
        aria-label="Toggle color theme"
        onClick={() => {
          setOverridden(true);
          setIsDark((v) => !v);
        }}
        className="glass fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full text-[var(--text)] shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      {children}
    </div>
  );
}
