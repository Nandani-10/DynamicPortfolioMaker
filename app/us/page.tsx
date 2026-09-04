"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useUs } from "@/components/us/UsProvider";
import { useUsActions } from "@/hooks/useUsActions";
import { Avatar, isOnline } from "@/components/us/Avatar";
import { MoodCheckIn } from "@/components/us/MoodCheckIn";
import { MorningStreak } from "@/components/us/MorningStreak";
import { CountdownCard } from "@/components/us/CountdownCard";
import { SurpriseBox } from "@/components/us/SurpriseBox";
import { ThoughtComposer } from "@/components/us/ThoughtComposer";
import { StatusPicker } from "@/components/us/StatusPicker";
import { GreetingScene } from "@/components/us/GreetingScene";
import { greetingForPhase } from "@/lib/us/ambient";
import { longDate, relativeTime } from "@/lib/us/format";
import type { UsMessage } from "@/types/us";

export default function TodayPage() {
  const { me, partner, messages, uid, phase, thoughts } = useUs();
  const actions = useUsActions();
  const [clock, setClock] = useState<string>("");
  const [overlay, setOverlay] = useState<"surprise" | "thought" | null>(null);
  const [scene, setScene] = useState<"morning" | "night" | null>(null);
  const [sceneText, setSceneText] = useState("");

  // Rendered only after mount: a static export has no idea what time it is.
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
      );
    tick();
    const timer = window.setInterval(tick, 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const latestFromPartner = [...messages].reverse().find((m) => m.senderUid !== uid);
  const waitingThoughts = thoughts.filter((t) => t.authorUid !== uid && !t.discoveredAt);

  async function greet(kind: "morning" | "night") {
    const { text } = await actions.sendGreeting(kind);
    setSceneText(text);
    setScene(kind);
  }

  return (
    <div className="space-y-4">
      <header className="us-card overflow-hidden p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="us-muted text-xs uppercase tracking-[0.2em]">
              {longDate()}
            </p>
            <h1 className="us-title mt-2 text-2xl font-semibold sm:text-3xl">
              {greetingForPhase(phase)}
              {me?.name ? `, ${me.name.split(" ")[0]}` : ""}
            </h1>
            <p className="us-muted mt-1 text-sm">
              {clock}
              {partner
                ? isOnline(partner)
                  ? ` · ${partner.name.split(" ")[0]} is here`
                  : partner.lastActiveAt
                    ? ` · ${partner.name.split(" ")[0]} was here ${relativeTime(partner.lastActiveAt)}`
                    : ""
                : ""}
            </p>
          </div>
          <div className="flex -space-x-3">
            <Avatar member={me} size={44} />
            <Avatar member={partner} size={44} showPresence />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Action emoji="☀️" label="Good morning" onClick={() => greet("morning")} />
          <Action emoji="🌙" label="Good night" onClick={() => greet("night")} />
          <Action emoji="✉️" label="Send a message" href="/us/chat" />
          <Action emoji="🎨" label="Draw something" href="/us/chat" />
          <Action emoji="💭" label="Random thought" onClick={() => setOverlay("thought")} />
          <Action emoji="🎁" label="Surprise me" onClick={() => setOverlay("surprise")} />
        </div>

        <StatusPicker compact />
      </header>

      {latestFromPartner && (
        <Link href="/us/chat" className="us-card block p-5 transition hover:brightness-105">
          <p className="us-muted text-[0.65rem] uppercase tracking-[0.2em]">
            Latest from {partner?.name?.split(" ")[0] ?? "them"}
          </p>
          <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed">
            {previewOf(latestFromPartner)}
          </p>
          <p className="us-muted mt-2 text-xs">
            {relativeTime(latestFromPartner.createdAt)} · tap to open
          </p>
        </Link>
      )}

      {waitingThoughts.length > 0 && (
        <Link href="/us/memories" className="us-card block p-5">
          <p className="text-sm">
            💭 {waitingThoughts.length} thought
            {waitingThoughts.length === 1 ? "" : "s"} waiting for you to find.
          </p>
        </Link>
      )}

      <MoodCheckIn />
      <MorningStreak />
      <CountdownCard />

      <AnimatePresence>
        {overlay === "surprise" && <SurpriseBox onClose={() => setOverlay(null)} />}
        {overlay === "thought" && <ThoughtComposer onClose={() => setOverlay(null)} />}
        {scene && (
          <GreetingScene
            kind={scene}
            text={sceneText}
            onClose={() => setScene(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Action({
  emoji,
  label,
  onClick,
  href,
}: {
  emoji: string;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <>
      <span className="text-xl">{emoji}</span>
      <span className="text-xs font-medium leading-tight">{label}</span>
    </>
  );
  const className =
    "us-soft flex flex-col items-center gap-1.5 px-3 py-4 text-center transition hover:-translate-y-0.5";

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <motion.button type="button" whileTap={{ scale: 0.96 }} className={className} onClick={onClick}>
      {inner}
    </motion.button>
  );
}

function previewOf(message: UsMessage): string {
  switch (message.type) {
    case "drawing":
      return message.drawing?.note ?? "🎨 A drawing for you.";
    case "photo":
      return message.media?.caption ?? "📸 A photo.";
    case "voice":
      return "🎙️ A voice note.";
    case "mood":
      return `${message.mood?.emoji ?? ""} Feeling ${message.mood?.label ?? ""}`.trim();
    default:
      return message.text ?? "A message.";
  }
}
