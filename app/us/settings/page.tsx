"use client";

import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { useUs } from "@/components/us/UsProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEffectsLayer } from "@/components/us/EffectsLayer";
import { Avatar } from "@/components/us/Avatar";
import { StatusPicker } from "@/components/us/StatusPicker";
import { saveDates, updateMember } from "@/lib/us/store";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary/client";
import { isPinEnabled } from "@/lib/us/config";
import type { SpecialDate } from "@/types/us";

const AVATAR_EMOJI = ["⭐", "🌙", "☀️", "🌸", "🐈", "🐦", "🌊", "🍁", "🍵", "✦"];
const ACCENTS = [
  "linear-gradient(135deg,#e9a17f,#d1748f)",
  "linear-gradient(135deg,#7f9fc7,#9a86c4)",
  "linear-gradient(135deg,#7fc2a5,#5f95b8)",
  "linear-gradient(135deg,#d8a45f,#c96f6f)",
  "linear-gradient(135deg,#a88fd0,#6f7fd0)",
];

export default function SettingsPage() {
  const { me, partner, space, uid, notify } = useUs();
  const { signOut } = useAuth();
  const { play } = useEffectsLayer();
  const [name, setName] = useState("");
  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [draft, setDraft] = useState({ label: "", date: "", emoji: "⭐" });
  const [uploading, setUploading] = useState(false);
  const [notifState, setNotifState] = useState<string>("default");
  const fileRef = useRef<HTMLInputElement>(null);
  const [secretTaps, setSecretTaps] = useState(0);

  useEffect(() => {
    if (me?.name) setName(me.name);
  }, [me?.name]);

  useEffect(() => {
    setDates(space?.dates ?? []);
  }, [space?.dates]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifState(Notification.permission);
    } else {
      setNotifState("unsupported");
    }
  }, []);

  function persistDates(next: SpecialDate[]) {
    setDates(next);
    saveDates(next).catch(() =>
      notify({ emoji: "⚠️", title: "Those dates didn't save" })
    );
  }

  return (
    <div className="space-y-4">
      <header className="us-card p-6">
        <h1 className="us-title text-2xl font-semibold">Us</h1>
        <p className="us-muted mt-1 text-sm">
          Small settings. Nothing here leaves the two of you.
        </p>
      </header>

      <section className="us-card p-5">
        <h2 className="us-title text-base font-medium">You</h2>
        <div className="mt-4 flex items-center gap-4">
          <Avatar member={me} size={64} />
          <div className="flex-1 space-y-2">
            <input
              className="us-input"
              value={name}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => {
                const trimmed = name.trim();
                if (trimmed && trimmed !== me?.name) {
                  updateMember(uid, { name: trimmed }).catch(() => {});
                }
              }}
              aria-label="Your name"
            />
            <button
              type="button"
              className="us-chip text-xs"
              disabled={uploading}
              onClick={() => {
                if (!isCloudinaryConfigured) {
                  notify({
                    emoji: "📸",
                    title: "Photo uploads need Cloudinary",
                    body: "Add the two NEXT_PUBLIC_CLOUDINARY_* values.",
                  });
                  return;
                }
                fileRef.current?.click();
              }}
            >
              {uploading ? "Uploading…" : "Change photo"}
            </button>
          </div>
        </div>

        <p className="us-muted mt-4 text-xs uppercase tracking-[0.18em]">
          Or a small icon
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {AVATAR_EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="us-chip text-base"
              data-active={me?.avatarEmoji === emoji}
              onClick={() =>
                updateMember(uid, {
                  avatarEmoji: me?.avatarEmoji === emoji ? "" : emoji,
                  // Clearing the photo lets the icon actually show.
                  photoURL: me?.avatarEmoji === emoji ? me?.photoURL : "",
                }).catch(() => {})
              }
            >
              {emoji}
            </button>
          ))}
        </div>

        <p className="us-muted mt-4 text-xs uppercase tracking-[0.18em]">Your colour</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACCENTS.map((accent) => (
            <button
              key={accent}
              type="button"
              aria-label="Pick this colour"
              className="h-8 w-8 rounded-full border-2"
              style={{
                background: accent,
                borderColor: me?.accent === accent ? "var(--us-text)" : "var(--us-border)",
              }}
              onClick={() => updateMember(uid, { accent }).catch(() => {})}
            />
          ))}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setUploading(true);
            try {
              const result = await uploadToCloudinary(file, "us-photos");
              await updateMember(uid, { photoURL: result.secureUrl });
            } catch {
              notify({ emoji: "⚠️", title: "That photo didn't upload" });
            } finally {
              setUploading(false);
            }
          }}
        />
      </section>

      <StatusPicker />

      <section className="us-card p-5">
        <h2 className="us-title text-base font-medium">Dates that matter</h2>
        <p className="us-muted mt-1 text-sm">
          The wedding, the next time you meet, the day you first spoke.
        </p>

        <div className="mt-4 space-y-2">
          {dates.map((date) => (
            <div key={date.id} className="us-soft flex items-center gap-3 p-3">
              <span className="text-lg">{date.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{date.label}</p>
                <p className="us-muted text-xs">
                  {new Date(
                    date.date.length <= 10 ? `${date.date}T00:00:00` : date.date
                  ).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                type="button"
                className="us-muted text-xs"
                aria-label={`Remove ${date.label}`}
                onClick={() => persistDates(dates.filter((d) => d.id !== date.id))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.label.trim() || !draft.date) return;
            persistDates([
              ...dates,
              {
                id: nanoid(8),
                label: draft.label.trim(),
                date: draft.date,
                emoji: draft.emoji,
              },
            ]);
            setDraft({ label: "", date: "", emoji: "⭐" });
          }}
        >
          <input
            className="us-input sm:w-16"
            value={draft.emoji}
            maxLength={2}
            aria-label="Emoji"
            onChange={(event) => setDraft({ ...draft, emoji: event.target.value })}
          />
          <input
            className="us-input flex-1"
            placeholder="Our day"
            value={draft.label}
            maxLength={40}
            onChange={(event) => setDraft({ ...draft, label: event.target.value })}
          />
          <input
            className="us-input sm:w-44"
            type="date"
            value={draft.date}
            onChange={(event) => setDraft({ ...draft, date: event.target.value })}
          />
          <button type="submit" className="us-primary text-sm">
            Add
          </button>
        </form>
      </section>

      <section className="us-card p-5">
        <h2 className="us-title text-base font-medium">Quiet notifications</h2>
        <p className="us-muted mt-1 text-sm leading-relaxed">
          Only while the tab is open in the background, and only ever a soft line —
          never a count, never a sound.
        </p>
        {notifState === "granted" ? (
          <p className="us-chip mt-3 text-xs">Allowed ✓</p>
        ) : notifState === "unsupported" ? (
          <p className="us-muted mt-3 text-xs">This browser doesn&apos;t support them.</p>
        ) : (
          <button
            type="button"
            className="us-chip mt-3 text-xs"
            onClick={async () => {
              try {
                setNotifState(await Notification.requestPermission());
              } catch {
                setNotifState("denied");
              }
            }}
          >
            {notifState === "denied" ? "Blocked — allow in browser settings" : "Allow"}
          </button>
        )}
      </section>

      <section className="us-card p-5">
        <h2 className="us-title text-base font-medium">The two of you</h2>
        <div className="mt-3 flex items-center gap-3">
          <Avatar member={me} size={36} />
          <span className="text-sm">{me?.name ?? "You"}</span>
          <span className="us-muted">·</span>
          <Avatar member={partner} size={36} showPresence />
          <span className="text-sm">{partner?.name ?? "Not signed in yet"}</span>
        </div>
        <p className="us-muted mt-3 text-xs leading-relaxed">
          Access is limited to two addresses, enforced by the database rules — not
          just this screen. {isPinEnabled ? "A shared PIN is also on." : ""}
        </p>
        <button type="button" className="us-chip mt-4 text-xs" onClick={() => signOut()}>
          Sign out
        </button>
      </section>

      {/* Nothing labels this. That's the point. */}
      <div className="flex justify-center pb-4">
        <button
          type="button"
          aria-label="."
          className="us-muted px-6 py-3 text-lg opacity-30 transition hover:opacity-100"
          onClick={() => {
            const next = secretTaps + 1;
            setSecretTaps(next);
            if (next % 3 === 0) {
              play("stars");
              notify({ emoji: "⭐", title: "You found it again." });
            }
          }}
        >
          ·
        </button>
      </div>
    </div>
  );
}
