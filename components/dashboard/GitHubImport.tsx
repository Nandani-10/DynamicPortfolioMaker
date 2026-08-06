"use client";

import { useState } from "react";
import { Loader2, Search, Star } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { TextInput } from "@/components/dashboard/fields";
import {
  fetchPublicRepos,
  GitHubImportError,
  type GitHubRepo,
} from "@/lib/github-import";

/**
 * Fetches a GitHub user's public repos and lets the owner pick which ones to
 * pull in. Import is additive — the caller appends, so nothing already in the
 * list is overwritten by a repo of the same name.
 */
export function GitHubImport({
  defaultUsername,
  existingUrls,
  onImport,
  label,
}: {
  defaultUsername?: string;
  /** Repo URLs already in the list, so they can be marked as added. */
  existingUrls: string[];
  onImport: (repos: GitHubRepo[]) => void;
  label: string;
}) {
  const [username, setUsername] = useState(defaultUsername ?? "");
  const [repos, setRepos] = useState<GitHubRepo[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyAdded = new Set(existingUrls);

  async function search() {
    setLoading(true);
    setError(null);
    setRepos(null);
    setSelected(new Set());
    try {
      setRepos(await fetchPublicRepos(username));
    } catch (err) {
      setError(
        err instanceof GitHubImportError
          ? err.message
          : "Couldn't load repositories from GitHub."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function importSelected() {
    if (!repos) return;
    onImport(repos.filter((repo) => selected.has(repo.id)));
    setSelected(new Set());
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
      <p className="mb-1 flex items-center gap-2 text-sm font-medium">
        <FaGithub className="h-4 w-4" /> {label}
      </p>
      <p className="mb-3 text-xs text-[var(--text-muted)]">
        Pulls name, description, language, topics, and links. Everything is
        editable afterwards, and details GitHub can&apos;t know — features,
        challenges, learnings — stay empty for you to fill in.
      </p>

      <div className="flex gap-2">
        <TextInput
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder="github-username"
        />
        <button
          type="button"
          onClick={search}
          disabled={loading || !username.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--border)] px-3.5 py-2 text-xs font-medium hover:border-[var(--accent-2)] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
          Search
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {repos && repos.length === 0 && (
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          No public repositories found for that user.
        </p>
      )}

      {repos && repos.length > 0 && (
        <>
          <ul className="scrollbar-thin mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {repos.map((repo) => {
              const added = alreadyAdded.has(repo.html_url);
              return (
                <li key={repo.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border border-transparent p-2 hover:bg-[var(--surface)] ${
                      added ? "opacity-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(repo.id)}
                      disabled={added}
                      onChange={() => toggle(repo.id)}
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--accent-2)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{repo.name}</span>
                        {repo.stargazers_count > 0 && (
                          <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-[var(--text-muted)]">
                            <Star className="h-3 w-3" />
                            {repo.stargazers_count}
                          </span>
                        )}
                        {repo.fork && (
                          <span className="shrink-0 rounded-full bg-[var(--surface)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                            fork
                          </span>
                        )}
                        {added && (
                          <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
                            already added
                          </span>
                        )}
                      </span>
                      {repo.description && (
                        <span className="mt-0.5 line-clamp-1 block text-xs text-[var(--text-muted)]">
                          {repo.description}
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={importSelected}
            disabled={selected.size === 0}
            className="mt-3 w-full rounded-xl bg-[linear-gradient(120deg,var(--accent-2),var(--accent-3))] px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            Import {selected.size > 0 ? selected.size : ""}{" "}
            {selected.size === 1 ? "repository" : "repositories"}
          </button>
        </>
      )}
    </div>
  );
}
