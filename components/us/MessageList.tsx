"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageBubble } from "@/components/us/MessageBubble";
import { Avatar } from "@/components/us/Avatar";
import { useUs, TYPING_WINDOW_MS } from "@/components/us/UsProvider";
import { markOpened, markSeen, reactToMessage } from "@/lib/us/store";
import { dayLabel } from "@/lib/us/format";
import { QUICK_REPLIES, MORNING_REPLIES, NIGHT_REPLIES } from "@/lib/us/content";
import type { UsMessage } from "@/types/us";

export function MessageList({
  onReply,
  onQuickReply,
  onOpenScene,
}: {
  onReply: (message: UsMessage) => void;
  onQuickReply: (text: string) => void;
  onOpenScene: (message: UsMessage) => void;
}) {
  const { messages, uid, partner, loading } = useUs();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);
  const [partnerTyping, setPartnerTyping] = useState(false);

  // "Typing" expires on a timer rather than being derived at render time.
  useEffect(() => {
    const check = () =>
      setPartnerTyping(
        Boolean(partner?.typingAt && Date.now() - partner.typingAt < TYPING_WINDOW_MS)
      );
    check();
    const timer = window.setInterval(check, 1500);
    return () => window.clearInterval(timer);
  }, [partner?.typingAt]);

  // Follow new messages, but don't yank the view while reading old ones.
  useEffect(() => {
    if (messages.length === lastCountRef.current) return;
    const grew = messages.length > lastCountRef.current;
    lastCountRef.current = messages.length;
    if (!grew) return;
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  // Reading the thread is what marks it read.
  useEffect(() => {
    if (document.visibilityState !== "visible") return;
    messages
      .filter((m) => m.senderUid !== uid && !(m.seenBy ?? []).includes(uid))
      .slice(-20)
      .forEach((m) => markSeen(m.id, uid).catch(() => {}));
  }, [messages, uid]);

  if (loading) {
    return (
      <div className="space-y-4 py-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-12 w-2/3 animate-pulse rounded-3xl"
            style={{
              background: "var(--us-surface)",
              marginLeft: i % 2 ? "auto" : undefined,
            }}
          />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="us-card mx-auto mt-10 max-w-sm p-8 text-center">
        <p className="text-3xl">🌱</p>
        <p className="us-title mt-3 text-lg">Nothing here yet</p>
        <p className="us-muted mt-2 text-sm leading-relaxed">
          This is the quiet beginning. Send a good morning, a doodle, or nothing in
          particular — anything makes it feel lived in.
        </p>
      </div>
    );
  }

  const lastFromPartner = [...messages].reverse().find((m) => m.senderUid !== uid);
  const lastMine = [...messages].reverse().find((m) => m.senderUid === uid);
  // Precomputed so the day separators don't rely on mutation while mapping.
  const dayLabels = messages.map((message) => dayLabel(message.createdAt));

  return (
    <div className="flex flex-col gap-5 pb-6">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => {
          const label = dayLabels[index];
          const showDay = index === 0 || dayLabels[index - 1] !== label;
          const mine = message.senderUid === uid;
          const fresh = !(message.openedBy ?? []).includes(uid);

          return (
            <div key={message.id} className="flex flex-col gap-5">
              {showDay && (
                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1" style={{ background: "var(--us-border)" }} />
                  <span className="us-muted text-[0.7rem] uppercase tracking-[0.18em]">
                    {label}
                  </span>
                  <span className="h-px flex-1" style={{ background: "var(--us-border)" }} />
                </div>
              )}
              <MessageBubble
                message={message}
                mine={mine}
                senderName={mine ? "You" : (partner?.name ?? "Them")}
                fresh={fresh}
                myReaction={message.reactions?.[uid] ?? null}
                onReact={(emoji) => reactToMessage(message.id, uid, emoji).catch(() => {})}
                onReply={() => onReply(message)}
                onOpenScene={() => onOpenScene(message)}
                onOpened={() => {
                  if (fresh) markOpened(message.id, uid).catch(() => {});
                }}
              />
            </div>
          );
        })}
      </AnimatePresence>

      {partnerTyping && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <Avatar member={partner} size={26} />
          <span className="us-bubble flex items-center gap-1 py-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: "var(--us-muted)",
                  animation: `us-twinkle 1.2s ease-in-out ${i * 0.18}s infinite`,
                }}
              />
            ))}
          </span>
        </motion.div>
      )}

      {/* Answering shouldn't require inventing anything. */}
      {lastFromPartner &&
        (!lastMine || lastMine.createdAt < lastFromPartner.createdAt) && (
          <div className="flex flex-wrap gap-1.5 pl-1">
            {repliesFor(lastFromPartner).map((reply) => (
              <button
                key={reply}
                type="button"
                className="us-chip text-xs"
                onClick={() => onQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

      {lastMine && (lastMine.seenBy ?? []).some((seen) => seen !== uid) && (
        <p className="us-muted pr-1 text-right text-[0.68rem]">Seen</p>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function repliesFor(message: UsMessage): string[] {
  if (message.type === "morning") return MORNING_REPLIES;
  if (message.type === "night") return NIGHT_REPLIES;
  if (message.type === "hug") return ["🫂 Back at you", "I needed that", "Come here"];
  if (message.type === "question") return ["Let me think", "Answering now", "Ask me later?"];
  return QUICK_REPLIES;
}
