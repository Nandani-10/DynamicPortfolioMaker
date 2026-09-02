"use client";

import { useState } from "react";
import { STATUSES } from "@/lib/us/content";
import { setStatus } from "@/lib/us/store";
import { useUs } from "@/components/us/UsProvider";
import { relativeTime } from "@/lib/us/format";

/** Lightweight "where am I right now" — no read receipts, no pressure. */
export function StatusPicker({ compact }: { compact?: boolean }) {
  const { uid, me, partner } = useUs();
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  return (
    <section className={compact ? "" : "us-card p-5"}>
      {!compact && <h2 className="us-title text-base font-medium">Right now</h2>}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {STATUSES.map((status) => (
          <button
            key={status.key}
            type="button"
            className="us-chip text-xs"
            data-active={me?.status?.key === status.key}
            onClick={() =>
              setStatus(
                uid,
                me?.status?.key === status.key
                  ? null
                  : { key: status.key, label: status.label, emoji: status.emoji }
              ).catch(() => {})
            }
          >
            {status.emoji} {status.label}
          </button>
        ))}
        <button
          type="button"
          className="us-chip text-xs"
          data-active={showCustom}
          onClick={() => setShowCustom((open) => !open)}
        >
          ✍️ Something else
        </button>
      </div>

      {showCustom && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const label = custom.trim();
            if (!label) return;
            setStatus(uid, { key: "custom", label, emoji: "•" }).catch(() => {});
            setCustom("");
            setShowCustom(false);
          }}
        >
          <input
            className="us-input flex-1"
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            placeholder="In a lecture, back later…"
            maxLength={40}
          />
          <button type="submit" className="us-primary text-sm">
            Set
          </button>
        </form>
      )}

      {partner?.status && (
        <p className="us-muted mt-3 text-xs">
          {partner.name}: {partner.status.emoji} {partner.status.label} ·{" "}
          {relativeTime(partner.status.at)}
        </p>
      )}
    </section>
  );
}
