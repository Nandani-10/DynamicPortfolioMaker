"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/us/format";

/**
 * Records a short voice note with MediaRecorder. Kept deliberately plain: hold
 * a conversation, not a studio. Falls back to a clear message where the
 * browser (or an insecure origin) won't allow recording.
 */
export function VoiceRecorder({
  onRecorded,
  onCancel,
}: {
  onRecorded: (blob: Blob, seconds: number) => void;
  onCancel: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAt = useRef(0);

  useEffect(() => {
    let timer: number | undefined;
    if (recording) {
      timer = window.setInterval(() => {
        setSeconds(Math.round((Date.now() - startedAt.current) / 1000));
      }, 250);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [recording]);

  // Never leave the microphone open behind us.
  useEffect(() => {
    return () => {
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function start() {
    setError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices) {
      setError("This browser won't record audio here.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        stream.getTracks().forEach((track) => track.stop());
        const length = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
        if (blob.size > 0) onRecorded(blob, length);
      };
      startedAt.current = Date.now();
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
    } catch {
      setError("Microphone access was declined.");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  return (
    <div className="us-card flex items-center gap-3 p-4">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
        style={{
          background: recording
            ? "color-mix(in srgb, var(--us-accent-2) 30%, transparent)"
            : "var(--us-surface)",
          animation: recording ? "us-breathe 1.6s ease-in-out infinite" : undefined,
        }}
      >
        🎙️
      </span>
      <div className="flex-1">
        <p className="text-sm">
          {recording ? `Recording… ${formatDuration(seconds)}` : "Voice note"}
        </p>
        {error && <p className="text-xs text-[var(--us-accent-2)]">{error}</p>}
        {!error && !recording && (
          <p className="us-muted text-xs">Even five seconds counts.</p>
        )}
      </div>
      {recording ? (
        <button type="button" className="us-primary" onClick={stop}>
          Stop &amp; send
        </button>
      ) : (
        <button type="button" className="us-primary" onClick={start}>
          Record
        </button>
      )}
      <button type="button" className="us-chip text-sm" onClick={onCancel}>
        Close
      </button>
    </div>
  );
}
