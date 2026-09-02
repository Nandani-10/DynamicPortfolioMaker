"use client";

import type { UsMember } from "@/types/us";

/** Presence is "seen in the last three minutes", which is honest enough. */
export function isOnline(member: UsMember | null | undefined): boolean {
  if (!member?.lastActiveAt) return false;
  return Date.now() - member.lastActiveAt < 3 * 60 * 1000;
}

export function Avatar({
  member,
  size = 40,
  showPresence = false,
}: {
  member: UsMember | null;
  size?: number;
  showPresence?: boolean;
}) {
  const initial = member?.name?.trim()?.[0]?.toUpperCase() ?? "·";
  const online = isOnline(member);

  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border"
        style={{
          borderColor: "var(--us-border)",
          background: member?.accent ?? "var(--us-mine)",
          fontSize: size * 0.45,
        }}
      >
        {member?.photoURL ? (
          // Plain <img>: avatars come straight from Google/Cloudinary and the
          // static export has no image optimizer behind it.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoURL}
            alt={member.name}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span aria-hidden>{member?.avatarEmoji || initial}</span>
        )}
      </span>
      {showPresence && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2"
          style={{
            width: Math.max(9, size * 0.26),
            height: Math.max(9, size * 0.26),
            borderColor: "var(--us-bg)",
            background: online ? "#5fbf8a" : "var(--us-muted)",
          }}
          aria-label={online ? "Here now" : "Away"}
        />
      )}
    </span>
  );
}
