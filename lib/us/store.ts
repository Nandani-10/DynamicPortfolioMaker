"use client";

import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { SPACE_ID } from "@/lib/us/config";
import { dayKey } from "@/lib/us/format";
import type {
  DayLog,
  DrawingPayload,
  MediaPayload,
  Memory,
  MessageType,
  ReplyRef,
  Round,
  RoundKind,
  SpaceDoc,
  SpecialDate,
  Thought,
  UsMember,
  UsMessage,
} from "@/types/us";

/**
 * Everything lives under one space document so the security rules can gate the
 * entire tree on a two-address allowlist in a single `match` block.
 */
const spaceRef = () => doc(db, "spaces", SPACE_ID);
const sub = (name: string) => collection(db, "spaces", SPACE_ID, name);

/**
 * Firestore rejects `undefined` anywhere in a document, and optional fields
 * here are often absent — including nested ones, like the note on a drawing.
 * So the strip has to walk the whole value, not just the top level.
 */
function clean<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => clean(item)) as unknown as T;
  }
  if (input && typeof input === "object" && (input as object).constructor === Object) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (value !== undefined) out[key] = clean(value);
    }
    return out as T;
  }
  return input;
}

/**
 * Local writes have no server timestamp yet. Estimating it keeps a message the
 * user just sent from jumping around the list once the server value lands.
 */
function readData(snap: QueryDocumentSnapshot<DocumentData>): DocumentData {
  return snap.data({ serverTimestamps: "estimate" });
}

function millis(value: unknown, fallback = Date.now()): number {
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === "number") return value;
  return fallback;
}

// ── Members ────────────────────────────────────────────────────────────────

export async function ensureMember(member: {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
}): Promise<void> {
  const ref = doc(db, "spaces", SPACE_ID, "members", member.uid);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(
      ref,
      clean({
        uid: member.uid,
        email: member.email,
        name: member.name,
        photoURL: member.photoURL,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      })
    );
    // The space doc is what the rules and the countdown list hang off.
    await setDoc(spaceRef(), { createdAt: serverTimestamp() }, { merge: true });
    return;
  }
  await updateDoc(ref, clean({ email: member.email, lastActiveAt: serverTimestamp() }));
}

export function subscribeMembers(onChange: (members: UsMember[]) => void) {
  return onSnapshot(sub("members"), (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = readData(d);
        return {
          uid: d.id,
          email: data.email ?? "",
          name: data.name ?? "Someone",
          photoURL: data.photoURL,
          avatarEmoji: data.avatarEmoji,
          accent: data.accent,
          status: data.status
            ? { ...data.status, at: millis(data.status.at, 0) }
            : undefined,
          mood: data.mood ? { ...data.mood, at: millis(data.mood.at, 0) } : undefined,
          lastActiveAt: millis(data.lastActiveAt, 0),
          typingAt: millis(data.typingAt, 0),
          createdAt: millis(data.createdAt, 0),
        } satisfies UsMember;
      })
    );
  });
}

export function updateMember(uid: string, patch: Partial<UsMember>) {
  return updateDoc(doc(db, "spaces", SPACE_ID, "members", uid), clean(patch as DocumentData));
}

export function setStatus(
  uid: string,
  status: { key: string; label: string; emoji: string } | null
) {
  const ref = doc(db, "spaces", SPACE_ID, "members", uid);
  if (!status) return updateDoc(ref, { status: deleteField() });
  return updateDoc(ref, { status: { ...status, at: Date.now() } });
}

export function setMood(uid: string, mood: { emoji: string; label: string }) {
  return updateDoc(doc(db, "spaces", SPACE_ID, "members", uid), {
    mood: { ...mood, at: Date.now() },
  });
}

export function touchPresence(uid: string) {
  return updateDoc(doc(db, "spaces", SPACE_ID, "members", uid), {
    lastActiveAt: serverTimestamp(),
  });
}

export function setTyping(uid: string) {
  return updateDoc(doc(db, "spaces", SPACE_ID, "members", uid), {
    typingAt: serverTimestamp(),
  });
}

// ── Messages ───────────────────────────────────────────────────────────────

export interface NewMessage {
  senderUid: string;
  type: MessageType;
  text?: string;
  drawing?: DrawingPayload;
  media?: MediaPayload;
  mood?: { emoji: string; label: string };
  replyTo?: ReplyRef;
}

export async function sendMessage(message: NewMessage): Promise<string> {
  const ref = await addDoc(
    sub("messages"),
    clean({ ...message, createdAt: serverTimestamp(), reactions: {}, seenBy: [message.senderUid] })
  );
  return ref.id;
}

export function subscribeMessages(
  onChange: (messages: UsMessage[]) => void,
  count = 300
) {
  const q = query(sub("messages"), orderBy("createdAt", "desc"), limit(count));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => {
      const data = readData(d);
      return {
        id: d.id,
        senderUid: data.senderUid,
        type: data.type,
        text: data.text,
        drawing: data.drawing,
        media: data.media,
        mood: data.mood,
        createdAt: millis(data.createdAt),
        reactions: data.reactions ?? {},
        replyTo: data.replyTo,
        seenBy: data.seenBy ?? [],
        openedBy: data.openedBy ?? [],
      } satisfies UsMessage;
    });
    // Newest-first from the query so `limit` keeps the *latest* messages;
    // the UI wants them oldest-first.
    messages.reverse();
    onChange(messages);
  });
}

export function reactToMessage(messageId: string, uid: string, emoji: string | null) {
  const ref = doc(db, "spaces", SPACE_ID, "messages", messageId);
  return updateDoc(ref, {
    [`reactions.${uid}`]: emoji === null ? deleteField() : emoji,
  });
}

export function markSeen(messageId: string, uid: string) {
  return updateDoc(doc(db, "spaces", SPACE_ID, "messages", messageId), {
    seenBy: arrayUnion(uid),
  });
}

/** Drawings and morning/night cards play their animation once per person. */
export function markOpened(messageId: string, uid: string) {
  return updateDoc(doc(db, "spaces", SPACE_ID, "messages", messageId), {
    openedBy: arrayUnion(uid),
  });
}

export function deleteMessage(messageId: string) {
  return deleteDoc(doc(db, "spaces", SPACE_ID, "messages", messageId));
}

// ── Thoughts (little notes to be found later) ──────────────────────────────

export function addThought(authorUid: string, text: string) {
  return addDoc(sub("thoughts"), {
    authorUid,
    text,
    createdAt: serverTimestamp(),
  });
}

export function subscribeThoughts(onChange: (thoughts: Thought[]) => void) {
  const q = query(sub("thoughts"), orderBy("createdAt", "desc"), limit(100));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = readData(d);
        return {
          id: d.id,
          authorUid: data.authorUid,
          text: data.text,
          createdAt: millis(data.createdAt),
          discoveredAt: data.discoveredAt ? millis(data.discoveredAt) : undefined,
          discoveredBy: data.discoveredBy,
        } satisfies Thought;
      })
    );
  });
}

export function discoverThought(id: string, uid: string) {
  return updateDoc(doc(db, "spaces", SPACE_ID, "thoughts", id), {
    discoveredAt: serverTimestamp(),
    discoveredBy: uid,
  });
}

export function deleteThought(id: string) {
  return deleteDoc(doc(db, "spaces", SPACE_ID, "thoughts", id));
}

// ── Memories ───────────────────────────────────────────────────────────────

export function addMemory(memory: Omit<Memory, "id" | "createdAt">) {
  return addDoc(sub("memories"), clean({ ...memory, createdAt: serverTimestamp() }));
}

export function subscribeMemories(onChange: (memories: Memory[]) => void) {
  const q = query(sub("memories"), orderBy("date", "desc"), limit(200));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = readData(d);
        return {
          id: d.id,
          authorUid: data.authorUid,
          title: data.title ?? "",
          date: data.date ?? "",
          caption: data.caption,
          location: data.location,
          note: data.note,
          photoUrl: data.photoUrl,
          createdAt: millis(data.createdAt),
        } satisfies Memory;
      })
    );
  });
}

export function deleteMemory(id: string) {
  return deleteDoc(doc(db, "spaces", SPACE_ID, "memories", id));
}

// ── Rounds: this-or-that, would-you-rather, questions ──────────────────────

export async function createRound(round: {
  kind: RoundKind;
  prompt: string;
  options: string[];
  createdBy: string;
}): Promise<string> {
  const ref = await addDoc(sub("rounds"), {
    ...round,
    answers: {},
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function answerRound(id: string, uid: string, value: string) {
  return updateDoc(doc(db, "spaces", SPACE_ID, "rounds", id), {
    [`answers.${uid}`]: { value, at: Date.now() },
  });
}

export function subscribeRounds(onChange: (rounds: Round[]) => void, count = 40) {
  const q = query(sub("rounds"), orderBy("createdAt", "desc"), limit(count));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = readData(d);
        return {
          id: d.id,
          kind: data.kind,
          prompt: data.prompt,
          options: data.options ?? [],
          createdBy: data.createdBy,
          createdAt: millis(data.createdAt),
          answers: data.answers ?? {},
        } satisfies Round;
      })
    );
  });
}

export function deleteRound(id: string) {
  return deleteDoc(doc(db, "spaces", SPACE_ID, "rounds", id));
}

// ── Days: morning/night streak + the daily check-in ────────────────────────

/**
 * Day documents are keyed by date *and* carry it as a field: ordering by the
 * document id descending isn't supported, so the field is what the newest-first
 * query below sorts on.
 */
export function logGreeting(kind: "morning" | "night", uid: string) {
  const today = dayKey();
  const ref = doc(db, "spaces", SPACE_ID, "days", today);
  return setDoc(ref, { date: today, [kind]: { [uid]: Date.now() } }, { merge: true });
}

export function setCheckInQuestion(question: string) {
  const today = dayKey();
  return setDoc(
    doc(db, "spaces", SPACE_ID, "days", today),
    { date: today, checkIn: { question } },
    { merge: true }
  );
}

export function answerCheckIn(uid: string, value: string) {
  const today = dayKey();
  return setDoc(
    doc(db, "spaces", SPACE_ID, "days", today),
    { date: today, checkIn: { answers: { [uid]: { value, at: Date.now() } } } },
    { merge: true }
  );
}

/** The most recent day documents — enough for the streak garden. */
export function subscribeDays(onChange: (days: DayLog[]) => void, count = 60) {
  const q = query(sub("days"), orderBy("date", "desc"), limit(count));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = readData(d);
        return {
          id: d.id,
          morning: data.morning ?? {},
          night: data.night ?? {},
          checkIn: data.checkIn,
        } satisfies DayLog;
      })
    );
  });
}

// ── Space document (shared settings + countdown dates) ─────────────────────

export function subscribeSpace(onChange: (space: SpaceDoc | null) => void) {
  return onSnapshot(spaceRef(), (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    const data = snap.data({ serverTimestamps: "estimate" });
    onChange({
      createdAt: millis(data.createdAt, 0),
      title: data.title,
      dates: (data.dates ?? []) as SpecialDate[],
    });
  });
}

export function saveDates(dates: SpecialDate[]) {
  return setDoc(spaceRef(), { dates }, { merge: true });
}
