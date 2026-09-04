"use client";

import { MemoryWall } from "@/components/us/MemoryWall";
import { ThoughtDrawer } from "@/components/us/ThoughtDrawer";

export default function MemoriesPage() {
  return (
    <div className="space-y-4">
      <header className="us-card p-6">
        <h1 className="us-title text-2xl font-semibold">Ours</h1>
        <p className="us-muted mt-1 text-sm">
          The things worth keeping, and the notes left lying around for each other.
        </p>
      </header>

      <ThoughtDrawer />
      <MemoryWall />
    </div>
  );
}
