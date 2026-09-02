"use client";

import { useCallback, useMemo } from "react";
import { useUs } from "@/components/us/UsProvider";
import { useEffectsLayer } from "@/components/us/EffectsLayer";
import {
  addThought,
  logGreeting,
  sendMessage,
  setMood as saveMood,
  type NewMessage,
} from "@/lib/us/store";
import { uploadToCloudinary } from "@/lib/cloudinary/client";
import {
  HUG_LINES,
  MORNING_LINES,
  NIGHT_LINES,
  pickRandom,
} from "@/lib/us/content";
import type { DrawingPayload, MessageType, ReplyRef } from "@/types/us";

/**
 * Every way to say something, in one place, so the composer, the home screen
 * and the games all send messages the same way (including the hidden
 * animations that certain words trigger).
 */
export function useUsActions() {
  const { uid, notify } = useUs();
  const { play, playForText } = useEffectsLayer();

  const send = useCallback(
    (message: Omit<NewMessage, "senderUid">) => {
      if (message.text) playForText(message.text);
      return sendMessage({ ...message, senderUid: uid });
    },
    [uid, playForText]
  );

  const sendText = useCallback(
    (text: string, replyTo?: ReplyRef, type: MessageType = "text") => {
      const trimmed = text.trim();
      if (!trimmed) return Promise.resolve("");
      return send({ type, text: trimmed, replyTo });
    },
    [send]
  );

  const sendGreeting = useCallback(
    async (kind: "morning" | "night", text?: string) => {
      const line = text ?? pickRandom(kind === "morning" ? MORNING_LINES : NIGHT_LINES);
      play(kind === "morning" ? "sun" : "stars");
      const id = await send({ type: kind, text: line });
      logGreeting(kind, uid).catch(() => {});
      return { id, text: line };
    },
    [send, play, uid]
  );

  const sendHug = useCallback(async () => {
    play("hug");
    return send({ type: "hug", text: pickRandom(HUG_LINES) });
  }, [send, play]);

  const sendDrawing = useCallback(
    (drawing: DrawingPayload) => send({ type: "drawing", drawing }),
    [send]
  );

  const sendMood = useCallback(
    async (mood: { emoji: string; label: string }, note?: string) => {
      await saveMood(uid, mood).catch(() => {});
      return send({ type: "mood", mood, text: note?.trim() || undefined });
    },
    [send, uid]
  );

  const sendThought = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      // A thought lives in its own drawer *and* in the thread, so it can be
      // stumbled on later or noticed right away.
      await addThought(uid, trimmed);
      await send({ type: "thought", text: trimmed });
      notify({ emoji: "💭", title: "Left where they'll find it" });
    },
    [send, uid, notify]
  );

  const sendPhoto = useCallback(
    async (file: File, caption?: string) => {
      const result = await uploadToCloudinary(file, "us-photos");
      return send({
        type: "photo",
        media: {
          url: result.secureUrl,
          width: result.width,
          height: result.height,
          caption: caption?.trim() || undefined,
        },
      });
    },
    [send]
  );

  const sendVoice = useCallback(
    async (blob: Blob, seconds: number) => {
      const file = new File([blob], `voice-${Date.now()}.webm`, {
        type: blob.type || "audio/webm",
      });
      const result = await uploadToCloudinary(file, "us-voice");
      return send({
        type: "voice",
        media: { url: result.secureUrl, duration: seconds },
      });
    },
    [send]
  );

  return useMemo(
    () => ({
      send,
      sendText,
      sendGreeting,
      sendHug,
      sendDrawing,
      sendMood,
      sendThought,
      sendPhoto,
      sendVoice,
    }),
    [
      send,
      sendText,
      sendGreeting,
      sendHug,
      sendDrawing,
      sendMood,
      sendThought,
      sendPhoto,
      sendVoice,
    ]
  );
}
