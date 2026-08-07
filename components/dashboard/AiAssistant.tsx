"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowUp, Sparkles, Square, X } from "lucide-react";
import { useAiSettings } from "@/hooks/useAiSettings";
import { streamAssistantReply, type ChatMessage } from "@/lib/ai/tasks";
import { AiKeyForm } from "@/components/dashboard/AiKeyForm";

const SUGGESTIONS = [
  "How should I describe a project I built alone?",
  "What goes in a hero intro?",
  "Rewrite this bullet to sound less generic",
  "What do hiring managers look for in a portfolio?",
];

export function AiAssistant() {
  const { settings, hasKey } = useAiSettings();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest text in view as it streams in.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const question = text.trim();
    if (!question || streaming) return;

    setError(null);
    setInput("");
    const history: ChatMessage[] = [...messages, { role: "user", content: question }];
    // The empty assistant message is the target the stream appends into.
    setMessages([...history, { role: "assistant", content: "" }]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamAssistantReply(
        settings,
        history,
        (delta) => {
          setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, content: last.content + delta };
            return next;
          });
        },
        controller.signal
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      // Drop the empty placeholder so a failed turn doesn't leave a blank bubble.
      setMessages((current) =>
        current[current.length - 1]?.content ? current : current.slice(0, -1)
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the AI assistant"
        className="glass fixed bottom-6 right-24 z-30 flex items-center gap-2 rounded-full px-4 py-3 text-xs font-medium text-[var(--text)] shadow-[var(--shadow-soft)] transition-transform hover:scale-105 xl:bottom-8 xl:right-28"
      >
        <Sparkles className="h-4 w-4 text-[var(--accent-2)]" /> Ask AI
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              aria-label="Close assistant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--surface)]"
            >
              <header className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                <Sparkles className="h-4 w-4 shrink-0 text-[var(--accent-2)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Portfolio assistant</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    Writing help — it can&apos;t see or edit your portfolio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              {!hasKey ? (
                <div className="flex-1 overflow-y-auto p-4">
                  <AiKeyForm />
                </div>
              ) : (
                <>
                  <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
                    {messages.length === 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-[var(--text-muted)]">
                          Ask anything, or start with:
                        </p>
                        {SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => send(suggestion)}
                            className="block w-full rounded-xl border border-[var(--border)] px-3 py-2 text-left text-xs text-[var(--text-muted)] hover:border-[var(--accent-2)] hover:text-[var(--text)]"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={message.role === "user" ? "flex justify-end" : ""}
                      >
                        <div
                          className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                            message.role === "user"
                              ? "bg-[linear-gradient(120deg,var(--accent-2),var(--accent-3))] text-white"
                              : "bg-[var(--surface-alt)]"
                          }`}
                        >
                          {message.content ||
                            (streaming && index === messages.length - 1 ? "…" : "")}
                        </div>
                      </div>
                    ))}

                    {error && (
                      <p className="flex items-start gap-1.5 text-xs text-red-400">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {error}
                      </p>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      send(input);
                    }}
                    className="flex items-end gap-2 border-t border-[var(--border)] p-3"
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        // Enter sends; Shift+Enter is a newline.
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send(input);
                        }
                      }}
                      rows={2}
                      placeholder="Ask about wording, structure, anything…"
                      className="scrollbar-thin max-h-32 flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-sm outline-none focus:border-[var(--accent-2)]"
                    />
                    {streaming ? (
                      <button
                        type="button"
                        onClick={() => abortRef.current?.abort()}
                        aria-label="Stop generating"
                        className="shrink-0 rounded-xl border border-[var(--border)] p-2.5 text-[var(--text-muted)] hover:text-[var(--text)]"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        aria-label="Send"
                        className="shrink-0 rounded-xl bg-[linear-gradient(120deg,var(--accent-2),var(--accent-3))] p-2.5 text-white disabled:opacity-40"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    )}
                  </form>
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
