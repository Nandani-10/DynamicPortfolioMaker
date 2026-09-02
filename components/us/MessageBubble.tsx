"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { REACTIONS } from "@/lib/us/content";
import { formatDuration, timeOfDay } from "@/lib/us/format";
import { DrawingReplay } from "@/components/us/DrawingReplay";
import type { UsMessage } from "@/types/us";

interface MessageBubbleProps {
  message: UsMessage;
  mine: boolean;
  senderName: string;
  /** True until this person has opened it — drawings and cards animate once. */
  fresh: boolean;
  /** This person's own reaction, so tapping the same emoji removes it. */
  myReaction: string | null;
  onReact: (emoji: string | null) => void;
  onReply: () => void;
  onOpenScene?: () => void;
  onOpened?: () => void;
}

const TYPE_LABEL: Partial<Record<UsMessage["type"], string>> = {
  thought: "A little thought",
  surprise: "A surprise",
  question: "A question",
  answer: "An answer",
  hug: "A hug",
  memory: "A memory",
  checkin: "Check-in",
};

export function MessageBubble({
  message,
  mine,
  senderName,
  fresh,
  myReaction,
  onReact,
  onReply,
  onOpenScene,
  onOpened,
}: MessageBubbleProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const reactions = Object.entries(message.reactions ?? {});

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      className={`group flex w-full gap-2 ${mine ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex max-w-full flex-col ${mine ? "items-end" : "items-start"}`}>
        {message.replyTo && (
          <div
            className="us-soft mb-1 max-w-[80vw] truncate px-3 py-1.5 text-xs"
            style={{ color: "var(--us-muted)" }}
          >
            ↳ {message.replyTo.preview}
          </div>
        )}

        <div className="relative">
          <MessageBody
            message={message}
            mine={mine}
            senderName={senderName}
            fresh={fresh}
            onOpenScene={onOpenScene}
            onOpened={onOpened}
          />

          {reactions.length > 0 && (
            <div
              className={`absolute -bottom-3 flex gap-0.5 rounded-full border px-1.5 py-0.5 text-xs ${
                mine ? "left-2" : "right-2"
              }`}
              style={{
                background: "var(--us-surface-solid)",
                borderColor: "var(--us-border)",
              }}
            >
              {reactions.map(([uid, emoji]) => (
                <span key={uid}>{emoji}</span>
              ))}
            </div>
          )}
        </div>

        <div
          className={`mt-3 flex items-center gap-2 text-[0.68rem] ${
            mine ? "flex-row-reverse" : ""
          }`}
          style={{ color: "var(--us-muted)" }}
        >
          <span>{timeOfDay(message.createdAt)}</span>
          <button
            type="button"
            className="opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-70"
            onClick={() => setPickerOpen((open) => !open)}
            aria-label="React"
          >
            ☺
          </button>
          <button
            type="button"
            className="opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-70"
            onClick={onReply}
            aria-label="Reply"
          >
            ↩
          </button>
        </div>

        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="us-card mt-1 flex gap-1 px-2 py-1.5"
            >
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction.emoji}
                  type="button"
                  title={reaction.label}
                  aria-label={reaction.label}
                  className="rounded-full px-1.5 py-1 text-lg transition hover:scale-125"
                  onClick={() => {
                    const already = myReaction === reaction.emoji;
                    onReact(already ? null : reaction.emoji);
                    setPickerOpen(false);
                  }}
                >
                  {reaction.emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MessageBody({
  message,
  mine,
  senderName,
  fresh,
  onOpenScene,
  onOpened,
}: Pick<
  MessageBubbleProps,
  "message" | "mine" | "senderName" | "fresh" | "onOpenScene" | "onOpened"
>) {
  switch (message.type) {
    case "morning":
    case "night": {
      const isMorning = message.type === "morning";
      return (
        <button
          type="button"
          onClick={onOpenScene}
          className="relative block w-[min(78vw,22rem)] overflow-hidden rounded-[1.35rem] border p-5 text-left"
          style={{
            borderColor: "var(--us-border)",
            background: isMorning
              ? "linear-gradient(160deg,#ffd9a8,#f0a07d 60%,#d97f8f)"
              : "linear-gradient(160deg,#2b3566,#3d3a72 55%,#1c2143)",
            color: "#fff8f2",
            boxShadow: "0 20px 50px -26px var(--us-glow)",
          }}
        >
          <span
            aria-hidden
            className="absolute -right-6 -top-6 h-24 w-24 rounded-full"
            style={{
              background: isMorning
                ? "radial-gradient(circle,#fff6d8,rgba(255,225,160,0) 70%)"
                : "radial-gradient(circle at 38% 36%,#fdfbff,#c9cdf2 58%,rgba(190,195,240,0) 72%)",
            }}
          />
          <p className="text-[0.65rem] uppercase tracking-[0.2em] opacity-80">
            {isMorning ? "Good morning" : "Good night"}
          </p>
          <p className="us-title mt-1.5 text-lg leading-snug">{message.text}</p>
          <p className="mt-3 text-xs opacity-75">
            {fresh && !mine ? "Tap to open ✨" : "Tap to watch again"}
          </p>
        </button>
      );
    }

    case "drawing":
      return (
        <div
          className="w-[min(78vw,22rem)] overflow-hidden rounded-[1.35rem] border p-2"
          style={{ borderColor: "var(--us-border)", background: "var(--us-surface)" }}
        >
          <DrawingReplay
            payload={message.drawing ?? { strokes: [] }}
            animate={fresh}
            onDone={onOpened}
          />
          {message.drawing?.note && (
            <p className="px-2 py-2 text-sm">{message.drawing.note}</p>
          )}
        </div>
      );

    case "photo":
      return (
        <div
          className="w-[min(78vw,22rem)] overflow-hidden rounded-[1.35rem] border"
          style={{ borderColor: "var(--us-border)", background: "var(--us-surface)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={message.media?.url}
            alt={message.media?.caption ?? `Photo from ${senderName}`}
            className="w-full object-cover"
            loading="lazy"
          />
          {message.media?.caption && (
            <p className="px-3 py-2 text-sm">{message.media.caption}</p>
          )}
        </div>
      );

    case "voice":
      return (
        <div className="us-bubble flex items-center gap-3" data-mine={mine}>
          <span aria-hidden className="text-lg">
            🎙️
          </span>
          <audio
            controls
            preload="none"
            src={message.media?.url}
            className="h-9 max-w-[min(60vw,15rem)]"
          />
          {message.media?.duration ? (
            <span className="text-xs opacity-75">
              {formatDuration(message.media.duration)}
            </span>
          ) : null}
        </div>
      );

    case "hug":
      return <HugCard text={message.text ?? "A hug"} fresh={fresh} />;

    case "mood":
      return (
        <div className="us-bubble flex items-center gap-2.5" data-mine={mine}>
          <span className="text-2xl">{message.mood?.emoji}</span>
          <span>
            <span className="block text-xs opacity-75">Feeling</span>
            {message.mood?.label}
            {message.text ? ` — ${message.text}` : ""}
          </span>
        </div>
      );

    case "thought":
    case "surprise":
    case "question":
    case "answer":
    case "memory":
    case "checkin":
      return (
        <div
          className="w-[min(78vw,24rem)] rounded-[1.35rem] border px-4 py-3"
          style={{
            borderColor: "color-mix(in srgb, var(--us-accent) 45%, transparent)",
            background: "color-mix(in srgb, var(--us-accent) 12%, var(--us-surface))",
          }}
        >
          <p
            className="text-[0.62rem] uppercase tracking-[0.2em]"
            style={{ color: "var(--us-muted)" }}
          >
            {TYPE_LABEL[message.type]}
          </p>
          <p className="mt-1.5 text-[0.95rem] leading-relaxed">{message.text}</p>
        </div>
      );

    default:
      return (
        <div className="us-bubble" data-mine={mine}>
          {message.text}
        </div>
      );
  }
}

/** Two little shapes that lean into each other, once. */
function HugCard({ text, fresh }: { text: string; fresh: boolean }) {
  return (
    <div
      className="w-[min(78vw,20rem)] rounded-[1.35rem] border px-5 py-4 text-center"
      style={{
        borderColor: "var(--us-border)",
        background: "color-mix(in srgb, var(--us-accent-2) 16%, var(--us-surface))",
      }}
    >
      <div className="mb-2 flex items-center justify-center">
        <motion.span
          className="text-2xl"
          initial={fresh ? { x: -22 } : false}
          animate={{ x: -6 }}
          transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.2 }}
        >
          🧍
        </motion.span>
        <motion.span
          className="text-lg"
          initial={fresh ? { opacity: 0, scale: 0.4 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
        >
          🫂
        </motion.span>
        <motion.span
          className="text-2xl"
          initial={fresh ? { x: 22 } : false}
          animate={{ x: 6 }}
          transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.2 }}
        >
          🧍
        </motion.span>
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
