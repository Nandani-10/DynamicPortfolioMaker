"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUs } from "@/components/us/UsProvider";
import { useUsActions } from "@/hooks/useUsActions";
import { SuggestionSheet } from "@/components/us/SuggestionSheet";
import { DrawCanvas } from "@/components/us/DrawCanvas";
import { VoiceRecorder } from "@/components/us/VoiceRecorder";
import { IntrovertMode } from "@/components/us/IntrovertMode";
import { setTyping } from "@/lib/us/store";
import { isCloudinaryConfigured } from "@/lib/cloudinary/client";
import type { ReplyRef, UsMessage } from "@/types/us";

type Panel = "none" | "suggest" | "draw" | "voice" | "introvert";

export function Composer({
  replyTo,
  onClearReply,
  draft,
  onDraftChange,
}: {
  replyTo: UsMessage | null;
  onClearReply: () => void;
  draft: string;
  onDraftChange: (value: string) => void;
}) {
  const { uid, notify } = useUs();
  const actions = useUsActions();
  const [panel, setPanel] = useState<Panel>("none");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastTypingPing = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Grow with the text instead of scrolling inside a two-line box.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(160, el.scrollHeight)}px`;
  }, [draft]);

  function replyRef(): ReplyRef | undefined {
    if (!replyTo) return undefined;
    return {
      id: replyTo.id,
      type: replyTo.type,
      senderUid: replyTo.senderUid,
      preview: (replyTo.text ?? previewFor(replyTo)).slice(0, 90),
    };
  }

  async function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      await actions.sendText(trimmed, replyRef());
      onDraftChange("");
      onClearReply();
      setPanel("none");
    } catch {
      setError("That didn't send. Try again?");
    } finally {
      setBusy(false);
    }
  }

  async function run(task: () => Promise<unknown>, failure: string) {
    setBusy(true);
    setError(null);
    try {
      await task();
      setPanel("none");
    } catch (err) {
      setError(err instanceof Error ? err.message : failure);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-30 pt-2">
      <AnimatePresence mode="wait">
        {panel !== "none" && (
          <motion.div
            key={panel}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            // Panels can be tall (the canvas especially) — never let one push
            // the input off the screen.
            className="us-scroll mb-2 max-h-[44vh] overflow-y-auto"
          >
            {panel === "suggest" && (
              <SuggestionSheet
                onSend={(text) => submit(text)}
                onUseInComposer={(text) => {
                  onDraftChange(text);
                  setPanel("none");
                  textareaRef.current?.focus();
                }}
              />
            )}
            {panel === "introvert" && (
              <IntrovertMode
                onPick={(text, kind) =>
                  run(
                    () => actions.sendText(text, replyRef(), kind),
                    "That didn't send."
                  )
                }
                onEdit={(text) => {
                  onDraftChange(text);
                  setPanel("none");
                  textareaRef.current?.focus();
                }}
              />
            )}
            {panel === "draw" && (
              <DrawCanvas
                sending={busy}
                onCancel={() => setPanel("none")}
                onSend={(payload) =>
                  run(() => actions.sendDrawing(payload), "The drawing didn't send.")
                }
              />
            )}
            {panel === "voice" && (
              <VoiceRecorder
                onCancel={() => setPanel("none")}
                onRecorded={(blob, seconds) =>
                  run(
                    () => actions.sendVoice(blob, seconds),
                    "The voice note didn't upload."
                  )
                }
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {replyTo && (
        <div className="us-soft mb-2 flex items-center justify-between gap-3 px-3 py-2 text-xs">
          <span className="truncate">
            Replying to: {replyTo.text ?? previewFor(replyTo)}
          </span>
          <button type="button" onClick={onClearReply} aria-label="Cancel reply">
            ✕
          </button>
        </div>
      )}

      {error && (
        <p className="mb-2 px-2 text-xs" style={{ color: "var(--us-accent-2)" }}>
          {error}
        </p>
      )}

      <div className="us-composer p-2">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            placeholder="Say anything. Or nothing — use the buttons."
            className="us-input max-h-40 flex-1 resize-none border-0 bg-transparent focus:shadow-none"
            onChange={(event) => {
              onDraftChange(event.target.value);
              const now = Date.now();
              // One typing ping every couple of seconds is plenty.
              if (now - lastTypingPing.current > 2200) {
                lastTypingPing.current = now;
                setTyping(uid).catch(() => {});
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit(draft);
              }
            }}
          />
          <button
            type="button"
            className="us-primary shrink-0"
            disabled={!draft.trim() || busy}
            onClick={() => submit(draft)}
          >
            {busy ? "…" : "Send"}
          </button>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <PanelButton
            active={panel === "introvert"}
            onClick={() => setPanel(panel === "introvert" ? "none" : "introvert")}
          >
            🫥 I don&apos;t know how
          </PanelButton>
          <PanelButton
            active={panel === "suggest"}
            onClick={() => setPanel(panel === "suggest" ? "none" : "suggest")}
          >
            ✉️ Words
          </PanelButton>
          <PanelButton
            active={panel === "draw"}
            onClick={() => setPanel(panel === "draw" ? "none" : "draw")}
          >
            🎨 Draw
          </PanelButton>
          <PanelButton
            active={panel === "voice"}
            onClick={() => setPanel(panel === "voice" ? "none" : "voice")}
          >
            🎙️ Voice
          </PanelButton>
          <PanelButton
            onClick={() => {
              if (!isCloudinaryConfigured) {
                notify({
                  emoji: "📸",
                  title: "Photos need Cloudinary",
                  body: "Add the two NEXT_PUBLIC_CLOUDINARY_* values.",
                });
                return;
              }
              fileRef.current?.click();
            }}
          >
            📸 Photo
          </PanelButton>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          run(() => actions.sendPhoto(file), "The photo didn't upload.");
        }}
      />
    </div>
  );
}

function PanelButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button type="button" className="us-chip text-xs" data-active={active} onClick={onClick}>
      {children}
    </button>
  );
}

function previewFor(message: UsMessage): string {
  switch (message.type) {
    case "drawing":
      return "a drawing";
    case "photo":
      return "a photo";
    case "voice":
      return "a voice note";
    case "mood":
      return `feeling ${message.mood?.label ?? ""}`.trim();
    default:
      return "a message";
  }
}
