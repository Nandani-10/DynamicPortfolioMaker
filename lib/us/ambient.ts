/**
 * The space changes with the hour rather than with a theme toggle: dawn is
 * warm and low-contrast, day is bright and neutral, evening turns amber, and
 * night goes deep blue. Everything else in `/us` reads its colours from the
 * variables these phases set.
 */

export type AmbientPhase = "dawn" | "day" | "evening" | "night";

export function phaseForHour(hour: number): AmbientPhase {
  if (hour >= 5 && hour < 11) return "dawn";
  if (hour >= 11 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function currentPhase(date = new Date()): AmbientPhase {
  return phaseForHour(date.getHours());
}

export function greetingForPhase(phase: AmbientPhase): string {
  switch (phase) {
    case "dawn":
      return "Good morning";
    case "day":
      return "Hey";
    case "evening":
      return "Good evening";
    case "night":
      return "Still awake";
  }
}

export const PHASE_LABEL: Record<AmbientPhase, string> = {
  dawn: "Morning",
  day: "Afternoon",
  evening: "Evening",
  night: "Night",
};
