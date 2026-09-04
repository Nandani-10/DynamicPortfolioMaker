/** Types for the private couple space (`/us`). */

export type MessageType =
  | "text"
  | "morning"
  | "night"
  | "drawing"
  | "thought"
  | "mood"
  | "photo"
  | "voice"
  | "question"
  | "answer"
  | "surprise"
  | "checkin"
  | "memory";

export interface DrawingStroke {
  color: string;
  size: number;
  tool: "pen" | "pencil" | "eraser";
  /** Flattened [x, y, x, y, …] in 0–1 space so it scales to any canvas size. */
  points: number[];
}

export interface DrawingSticker {
  emoji: string;
  x: number;
  y: number;
  size: number;
}

export interface DrawingPayload {
  strokes: DrawingStroke[];
  stickers?: DrawingSticker[];
  /** Optional caption typed alongside the doodle. */
  note?: string;
}

export interface MediaPayload {
  url: string;
  width?: number;
  height?: number;
  /** Seconds, for voice notes. */
  duration?: number;
  caption?: string;
}

export interface ReplyRef {
  id: string;
  type: MessageType;
  preview: string;
  senderUid: string;
}

export interface UsMessage {
  id: string;
  senderUid: string;
  type: MessageType;
  text?: string;
  drawing?: DrawingPayload;
  media?: MediaPayload;
  /** Emoji + label for mood / status cards. */
  mood?: { emoji: string; label: string };
  createdAt: number;
  /** uid -> emoji. One reaction per person per message. */
  reactions?: Record<string, string>;
  replyTo?: ReplyRef;
  seenBy?: string[];
  /** Drawings and morning/night cards animate once, the first time they open. */
  openedBy?: string[];
}

export type MemberStatus =
  | "starting-my-day"
  | "busy"
  | "break"
  | "going-to-sleep"
  | "asleep"
  | "thinking"
  | "missing-you"
  | "free-to-talk"
  | "custom";

export interface UsMember {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  /** Fallback avatar when there is no photo. */
  avatarEmoji?: string;
  accent?: string;
  status?: { key: MemberStatus; label: string; emoji: string; at: number };
  mood?: { emoji: string; label: string; at: number };
  lastActiveAt?: number;
  typingAt?: number;
  /** Set when the person taps "I'm here" — powers the little presence dot. */
  createdAt?: number;
}

export interface Thought {
  id: string;
  authorUid: string;
  text: string;
  createdAt: number;
  discoveredAt?: number;
  discoveredBy?: string;
}

export interface Memory {
  id: string;
  authorUid: string;
  title: string;
  date: string;
  caption?: string;
  location?: string;
  note?: string;
  photoUrl?: string;
  createdAt: number;
}

export type RoundKind = "this-or-that" | "would-you-rather" | "question" | "two-truths";

export interface RoundAnswer {
  value: string;
  at: number;
}

export interface Round {
  id: string;
  kind: RoundKind;
  prompt: string;
  options: string[];
  createdBy: string;
  createdAt: number;
  /** uid -> answer. Hidden in the UI until both have answered. */
  answers?: Record<string, RoundAnswer>;
}

export interface DayLog {
  /** Document id is the YYYY-MM-DD date. */
  id: string;
  morning?: Record<string, number>;
  night?: Record<string, number>;
  checkIn?: {
    question: string;
    answers?: Record<string, { value: string; at: number }>;
  };
}

export interface SpecialDate {
  id: string;
  label: string;
  /** ISO date (YYYY-MM-DD) — optionally with a time. */
  date: string;
  emoji?: string;
}

export interface SpaceDoc {
  createdAt?: number;
  title?: string;
  dates?: SpecialDate[];
}
