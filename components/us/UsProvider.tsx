"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  ensureMember,
  subscribeDays,
  subscribeMemories,
  subscribeMessages,
  subscribeMembers,
  subscribeRounds,
  subscribeSpace,
  subscribeThoughts,
  touchPresence,
} from "@/lib/us/store";
import type { AmbientPhase } from "@/lib/us/ambient";
import type {
  DayLog,
  Memory,
  Round,
  SpaceDoc,
  Thought,
  UsMember,
  UsMessage,
} from "@/types/us";

export interface UsToast {
  id: number;
  title: string;
  body?: string;
  emoji?: string;
}

interface UsContextValue {
  user: User;
  uid: string;
  me: UsMember | null;
  partner: UsMember | null;
  members: UsMember[];
  messages: UsMessage[];
  thoughts: Thought[];
  memories: Memory[];
  rounds: Round[];
  days: DayLog[];
  space: SpaceDoc | null;
  loading: boolean;
  phase: AmbientPhase;
  toasts: UsToast[];
  notify: (toast: Omit<UsToast, "id">) => void;
  dismissToast: (id: number) => void;
  /** Name to show for a uid, falling back to something friendly. */
  nameFor: (uid: string) => string;
}

const UsContext = createContext<UsContextValue | undefined>(undefined);

/** How long after a keystroke the partner still counts as "typing". */
export const TYPING_WINDOW_MS = 5000;

let toastSeq = 0;

export function UsProvider({
  user,
  phase,
  children,
}: {
  user: User;
  phase: AmbientPhase;
  children: ReactNode;
}) {
  const [members, setMembers] = useState<UsMember[]>([]);
  const [messages, setMessages] = useState<UsMessage[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [days, setDays] = useState<DayLog[]>([]);
  const [space, setSpace] = useState<SpaceDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<UsToast[]>([]);

  const uid = user.uid;

  const notify = useCallback((toast: Omit<UsToast, "id">) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register (or refresh) this person in the space, then open every stream.
  useEffect(() => {
    let cancelled = false;
    ensureMember({
      uid: user.uid,
      email: user.email ?? "",
      name: user.displayName ?? user.email?.split("@")[0] ?? "Me",
      photoURL: user.photoURL ?? undefined,
    }).catch(() => {
      // A failure here means the rules rejected us; the streams below will
      // stay empty and the gate copy already explains what to fix.
    });

    const unsubs = [
      subscribeMembers((next) => !cancelled && setMembers(next)),
      subscribeMessages((next) => {
        if (cancelled) return;
        setMessages(next);
        setLoading(false);
      }),
      subscribeThoughts((next) => !cancelled && setThoughts(next)),
      subscribeMemories((next) => !cancelled && setMemories(next)),
      subscribeRounds((next) => !cancelled && setRounds(next)),
      subscribeDays((next) => !cancelled && setDays(next)),
      subscribeSpace((next) => !cancelled && setSpace(next)),
    ];
    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [user]);

  // Presence: a heartbeat while the tab is actually being looked at.
  useEffect(() => {
    const beat = () => {
      if (document.visibilityState === "visible") touchPresence(uid).catch(() => {});
    };
    beat();
    const timer = window.setInterval(beat, 45_000);
    document.addEventListener("visibilitychange", beat);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [uid]);

  // Gentle arrival notices. Nothing shouts; the copy is deliberately soft.
  const seenMessageIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (loading) return;
    if (seenMessageIds.current === null) {
      seenMessageIds.current = new Set(messages.map((m) => m.id));
      return;
    }
    const known = seenMessageIds.current;
    const fresh = messages.filter((m) => !known.has(m.id) && m.senderUid !== uid);
    messages.forEach((m) => known.add(m.id));
    fresh.slice(-2).forEach((message) => {
      const note = arrivalNote(message);
      notify(note);
      if (document.visibilityState === "hidden" && "Notification" in window) {
        try {
          if (Notification.permission === "granted") {
            new Notification(note.title, { body: note.body, silent: true });
          }
        } catch {
          // Notifications are best-effort; never let them break the app.
        }
      }
    });
  }, [messages, loading, uid, notify]);

  const me = useMemo(() => members.find((m) => m.uid === uid) ?? null, [members, uid]);
  const partner = useMemo(
    () => members.find((m) => m.uid !== uid) ?? null,
    [members, uid]
  );

  const nameFor = useCallback(
    (target: string) => {
      if (target === uid) return me?.name ?? "You";
      return members.find((m) => m.uid === target)?.name ?? "Them";
    },
    [members, me, uid]
  );

  const value = useMemo<UsContextValue>(
    () => ({
      user,
      uid,
      me,
      partner,
      members,
      messages,
      thoughts,
      memories,
      rounds,
      days,
      space,
      loading,
      phase,
      toasts,
      notify,
      dismissToast,
      nameFor,
    }),
    [
      user,
      uid,
      me,
      partner,
      members,
      messages,
      thoughts,
      memories,
      rounds,
      days,
      space,
      loading,
      phase,
      toasts,
      notify,
      dismissToast,
      nameFor,
    ]
  );

  return <UsContext.Provider value={value}>{children}</UsContext.Provider>;
}

function arrivalNote(message: UsMessage): Omit<UsToast, "id"> {
  switch (message.type) {
    case "morning":
      return { emoji: "☀️", title: "You received a morning sunshine", body: message.text };
    case "night":
      return { emoji: "🌙", title: "A good night landed for you", body: message.text };
    case "hug":
      return { emoji: "🫂", title: "Someone sent you a hug" };
    case "thought":
      return { emoji: "💭", title: "Someone left a little thought for you" };
    case "drawing":
      return { emoji: "🎨", title: "A doodle is waiting for you" };
    case "surprise":
      return { emoji: "🎁", title: "You have a tiny surprise waiting" };
    case "voice":
      return { emoji: "🎙️", title: "A voice note arrived" };
    case "photo":
      return { emoji: "📸", title: "A photo arrived", body: message.media?.caption };
    case "mood":
      return {
        emoji: message.mood?.emoji ?? "🫶",
        title: `Mood update: ${message.mood?.label ?? ""}`.trim(),
      };
    case "question":
      return { emoji: "💬", title: "A question for you", body: message.text };
    default:
      return { emoji: "💌", title: "A message arrived", body: message.text };
  }
}

export function useUs(): UsContextValue {
  const ctx = useContext(UsContext);
  if (!ctx) throw new Error("useUs must be used inside the /us space");
  return ctx;
}
