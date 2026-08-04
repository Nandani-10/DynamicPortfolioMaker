import type { ThemePreset } from "@/types/portfolio";

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  accent1: string;
  accent2: string;
  accent3: string;
}

export interface ThemeDefinition {
  id: ThemePreset;
  label: string;
  swatch: [string, string, string];
  light: ThemeColors;
  dark: ThemeColors;
}

export const THEME_PRESETS: Record<ThemePreset, ThemeDefinition> = {
  berryDusk: {
    id: "berryDusk",
    label: "Berry Dusk",
    swatch: ["#F8B2B2", "#A96BA0", "#413D8F"],
    light: {
      bg: "#fff7f7",
      surface: "#ffffff",
      surfaceAlt: "#fdeef1",
      text: "#2a1f3d",
      textMuted: "#6b5a72",
      border: "#f0d9df",
      accent1: "#f8b2b2",
      accent2: "#a96ba0",
      accent3: "#413d8f",
    },
    dark: {
      bg: "#120e1f",
      surface: "#1b1530",
      surfaceAlt: "#241b3d",
      text: "#f8eef6",
      textMuted: "#b8a8c9",
      border: "#33254f",
      accent1: "#f8b2b2",
      accent2: "#b378ab",
      accent3: "#6f63d6",
    },
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    swatch: ["#8fd3f4", "#4fb0d8", "#1c4e80"],
    light: {
      bg: "#f4fbfe",
      surface: "#ffffff",
      surfaceAlt: "#e7f5fb",
      text: "#0d2436",
      textMuted: "#4c6b7a",
      border: "#d3ebf5",
      accent1: "#8fd3f4",
      accent2: "#4fb0d8",
      accent3: "#1c4e80",
    },
    dark: {
      bg: "#071620",
      surface: "#0d2231",
      surfaceAlt: "#122c3d",
      text: "#e9f6fd",
      textMuted: "#93b3c2",
      border: "#1c3a4c",
      accent1: "#8fd3f4",
      accent2: "#4fb0d8",
      accent3: "#5b9fe0",
    },
  },
  midnight: {
    id: "midnight",
    label: "Midnight",
    swatch: ["#6e7ff3", "#3a3d8f", "#0f0f2d"],
    light: {
      bg: "#f6f6fd",
      surface: "#ffffff",
      surfaceAlt: "#ececfb",
      text: "#14142b",
      textMuted: "#5a5a80",
      border: "#dcdcf5",
      accent1: "#6e7ff3",
      accent2: "#3a3d8f",
      accent3: "#0f0f2d",
    },
    dark: {
      bg: "#08081a",
      surface: "#101028",
      surfaceAlt: "#161636",
      text: "#eceafd",
      textMuted: "#9c9cc9",
      border: "#242452",
      accent1: "#7d8bf7",
      accent2: "#5a5ede",
      accent3: "#9d7bf0",
    },
  },
  emerald: {
    id: "emerald",
    label: "Emerald",
    swatch: ["#8ff0c8", "#2fb583", "#0a3d2e"],
    light: {
      bg: "#f5fdf9",
      surface: "#ffffff",
      surfaceAlt: "#e6f9ef",
      text: "#0c2820",
      textMuted: "#4d6d61",
      border: "#d3f0e2",
      accent1: "#8ff0c8",
      accent2: "#2fb583",
      accent3: "#0a3d2e",
    },
    dark: {
      bg: "#05130f",
      surface: "#0a1f19",
      surfaceAlt: "#0e2921",
      text: "#e6faf1",
      textMuted: "#8fb8a9",
      border: "#173a2e",
      accent1: "#8ff0c8",
      accent2: "#2fb583",
      accent3: "#5fe0ac",
    },
  },
  classicMono: {
    id: "classicMono",
    label: "Classic Mono",
    swatch: ["#e5e5e5", "#8a8a8a", "#121212"],
    light: {
      bg: "#fafafa",
      surface: "#ffffff",
      surfaceAlt: "#f0f0f0",
      text: "#111111",
      textMuted: "#666666",
      border: "#e2e2e2",
      accent1: "#c9c9c9",
      accent2: "#8a8a8a",
      accent3: "#121212",
    },
    dark: {
      bg: "#0a0a0a",
      surface: "#141414",
      surfaceAlt: "#1c1c1c",
      text: "#f5f5f5",
      textMuted: "#a0a0a0",
      border: "#2a2a2a",
      accent1: "#d4d4d4",
      accent2: "#8a8a8a",
      accent3: "#f5f5f5",
    },
  },
};

export function resolveThemeColors(
  preset: ThemePreset,
  mode: "light" | "dark",
  accentColor?: string
): ThemeColors {
  const def = THEME_PRESETS[preset] ?? THEME_PRESETS.berryDusk;
  const colors = { ...def[mode] };
  if (accentColor) {
    colors.accent2 = accentColor;
  }
  return colors;
}

export function themeToCssVariables(colors: ThemeColors): string {
  return `
    --bg: ${colors.bg};
    --surface: ${colors.surface};
    --surface-alt: ${colors.surfaceAlt};
    --text: ${colors.text};
    --text-muted: ${colors.textMuted};
    --border: ${colors.border};
    --accent-1: ${colors.accent1};
    --accent-2: ${colors.accent2};
    --accent-3: ${colors.accent3};
  `.trim();
}
