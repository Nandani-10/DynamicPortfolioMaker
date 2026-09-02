"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useUs } from "@/components/us/UsProvider";
import { useUsActions } from "@/hooks/useUsActions";
import { MessageList } from "@/components/us/MessageList";
import { Composer } from "@/components/us/Composer";
import { GreetingScene } from "@/components/us/GreetingScene";
import { Avatar, isOnline } from "@/components/us/Avatar";
import { markOpened, reactToMessage } from "@/lib/us/store";
import { relativeTime } from "@/lib/us/format";
import type { UsMessage } from "@/types/us";

export default function ChatPage() {
  const { partner, uid } = useUs();
  const actions = useUsActions();
  const [replyTo, setReplyTo] = useState<UsMessage | null>(null);
  const [draft, setDraft] = useState("");
  const [scene, setScene] = useState<UsMessage | null>(null);

  return (
    // A real chat layout: the thread scrolls inside its own pane so the
    // composer stays put and nothing hides behind it.
    <div className="flex h-[calc(100dvh-10.5rem)] flex-col sm:h-[calc(100dvh-13rem)]">
      <header className="us-card mb-3 flex items-center gap-3 px-4 py-3">
        <Avatar member={partner} size={40} showPresence />
        <div className="min-w-0 flex-1">
          <p className="us-title truncate text-sm font-medium">
            {partner?.name ?? "Waiting for them"}
          </p>
          <p className="us-muted truncate text-xs">
            {partner?.status
              ? `${partner.status.emoji} ${partner.status.label}`
              : isOnline(partner)
                ? "Here now"
                : partner?.lastActiveAt
                  ? `Last here ${relativeTime(partner.lastActiveAt)}`
                  : "Not signed in yet"}
          </p>
        </div>
        {partner?.mood && (
          <span className="us-chip text-xs" title={`Feeling ${partner.mood.label}`}>
            {partner.mood.emoji} {partner.mood.label}
          </span>
        )}
      </header>

      <div className="us-scroll min-h-0 flex-1 overflow-y-auto pr-1">
        <MessageList
          onReply={setReplyTo}
          onQuickReply={(text) => actions.sendText(text)}
          onOpenScene={(message) => {
            if (message.type !== "morning" && message.type !== "night") return;
            setScene(message);
          }}
        />
      </div>

      <Composer
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        draft={draft}
        onDraftChange={setDraft}
      />

      <AnimatePresence>
        {scene && (
          <GreetingScene
            kind={scene.type === "morning" ? "morning" : "night"}
            text={scene.text ?? ""}
            from={scene.senderUid === uid ? undefined : `From ${partner?.name ?? "them"}`}
            onReply={
              scene.senderUid === uid ? undefined : (text) => actions.sendText(text)
            }
            onReact={
              scene.senderUid === uid
                ? undefined
                : (emoji) => {
                    reactToMessage(scene.id, uid, emoji).catch(() => {});
                  }
            }
            onClose={() => {
              markOpened(scene.id, uid).catch(() => {});
              setScene(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
