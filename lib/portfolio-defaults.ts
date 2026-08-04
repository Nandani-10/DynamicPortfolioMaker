import type { Portfolio } from "@/types/portfolio";

export function createDefaultPortfolio(params: {
  ownerUid: string;
  username: string;
  displayName?: string | null;
  email?: string | null;
}): Portfolio {
  const now = Date.now();
  return {
    ownerUid: params.ownerUid,
    username: params.username,
    published: false,
    createdAt: now,
    updatedAt: now,
    theme: { preset: "berryDusk", mode: "system" },
    hero: {
      name: params.displayName || "Your Name",
      roles: ["Software Engineer", "Product Builder", "Designer"],
      intro:
        "I build thoughtful, high-craft digital products. Welcome to my portfolio — edit this introduction from the dashboard.",
      profileImage: "",
      bannerImage: "",
      resumeUrl: "",
      stats: [
        { id: "stat-experience", label: "Years Experience", value: 2, suffix: "+" },
        { id: "stat-projects", label: "Projects Shipped", value: 12, suffix: "+" },
        { id: "stat-certs", label: "Certifications", value: 4, suffix: "" },
      ],
    },
    about: {
      bio: "Tell visitors who you are, what you do, and what drives you. Head to the About section of your dashboard to personalize this.",
      highlights: [],
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    awards: [],
    achievements: [],
    openSource: [],
    blogs: [],
    testimonials: [],
    social: {},
    contact: {
      email: params.email || "",
      formEnabled: true,
    },
  };
}

const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "app",
  "dashboard",
  "login",
  "logout",
  "onboarding",
  "settings",
  "www",
  "static",
  "public",
  "portfolio",
  "portfolios",
  "user",
  "users",
  "auth",
  "signin",
  "signup",
  "about",
  "contact",
  "help",
  "support",
  "terms",
  "privacy",
  "null",
  "undefined",
]);

const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export function validateUsername(raw: string): { valid: boolean; reason?: string } {
  const username = raw.trim().toLowerCase();
  if (username.length < 3) {
    return { valid: false, reason: "Username must be at least 3 characters." };
  }
  if (username.length > 30) {
    return { valid: false, reason: "Username must be 30 characters or fewer." };
  }
  if (!USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      reason:
        "Use lowercase letters, numbers, and hyphens only. Must start and end with a letter or number.",
    };
  }
  if (RESERVED_USERNAMES.has(username)) {
    return { valid: false, reason: "This username is reserved. Please choose another." };
  }
  return { valid: true };
}

export function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
