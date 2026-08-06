import type { OpenSourceItem, ProjectItem } from "@/types/portfolio";

/**
 * Pulls public repositories straight from the GitHub REST API in the browser.
 * Unauthenticated requests are enough for public data and avoid asking the
 * owner for a token, at the cost of a shared per-IP rate limit — hence the
 * explicit 403 handling below.
 */

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
}

export class GitHubImportError extends Error {}

export async function fetchPublicRepos(username: string): Promise<GitHubRepo[]> {
  const handle = username.trim().replace(/^@/, "");
  if (!handle) throw new GitHubImportError("Enter a GitHub username.");

  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(handle)}/repos?per_page=100&sort=pushed`,
    { headers: { Accept: "application/vnd.github+json" } }
  );

  if (response.status === 404) {
    throw new GitHubImportError(`No GitHub user called "${handle}".`);
  }
  if (response.status === 403) {
    throw new GitHubImportError(
      "GitHub is rate-limiting this network. Try again in a few minutes."
    );
  }
  if (!response.ok) {
    throw new GitHubImportError("Couldn't reach GitHub. Try again.");
  }

  const repos: GitHubRepo[] = await response.json();
  return repos
    .filter((repo) => !repo.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
}

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Repo → project, filling the fields GitHub can actually answer for. */
export function repoToProject(repo: GitHubRepo): ProjectItem {
  const techStack = [...new Set([repo.language, ...(repo.topics ?? [])].filter(Boolean))] as string[];
  return {
    id: newId(),
    title: repo.name,
    description: repo.description ?? "",
    techStack,
    githubUrl: repo.html_url,
    liveUrl: repo.homepage || undefined,
    // Deliberately left empty: GitHub can't tell us what the owner considers
    // the key features, the hard parts, or what they took away from it.
    features: [],
  };
}

/** Repo → open-source contribution entry. */
export function repoToOpenSource(repo: GitHubRepo): OpenSourceItem {
  return {
    id: newId(),
    repo: repo.full_name,
    url: repo.html_url,
    description: repo.description ?? "",
    // A repo the owner doesn't own is one they contributed to; their own
    // repos they maintain. `fork` is the only signal available here.
    role: repo.fork ? "Contributor" : "Maintainer",
  };
}
