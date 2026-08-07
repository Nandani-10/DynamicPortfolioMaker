"use client";

import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { createDefaultPortfolio } from "@/lib/portfolio-defaults";
import type { Portfolio, UserProfile } from "@/types/portfolio";

const portfolioRef = (username: string) => doc(db, "portfolios", username);
const userRef = (uid: string) => doc(db, "users", uid);

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
  return onSnapshot(userRef(uid), (snap) => {
    callback(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const snap = await getDoc(portfolioRef(username));
  return !snap.exists();
}

export async function claimUsernameAndCreatePortfolio(params: {
  uid: string;
  username: string;
  email: string | null;
  displayName: string | null;
}): Promise<Portfolio> {
  const { uid, username, email, displayName } = params;
  const newPortfolio = createDefaultPortfolio({
    ownerUid: uid,
    username,
    email,
    displayName,
  });

  await runTransaction(db, async (tx) => {
    const existingPortfolio = await tx.get(portfolioRef(username));
    if (existingPortfolio.exists()) {
      throw new Error("USERNAME_TAKEN");
    }
    // Same guard as updatePortfolio: a caller with no displayName or email
    // would otherwise fail the whole claim on an `undefined`.
    tx.set(portfolioRef(username), stripUndefined(newPortfolio));
    tx.set(
      userRef(uid),
      stripUndefined({
        uid,
        username,
        email,
        displayName,
        createdAt: Date.now(),
      } satisfies UserProfile)
    );
  });

  return newPortfolio;
}

export function subscribeToPortfolio(
  username: string,
  callback: (portfolio: Portfolio | null) => void
): Unsubscribe {
  return onSnapshot(portfolioRef(username), (snap) => {
    callback(snap.exists() ? (snap.data() as Portfolio) : null);
  });
}

export async function getPortfolioOnce(username: string): Promise<Portfolio | null> {
  const snap = await getDoc(portfolioRef(username));
  return snap.exists() ? (snap.data() as Portfolio) : null;
}

/**
 * Removes `undefined` values, at any depth.
 *
 * Firestore rejects the whole write if a single `undefined` appears anywhere
 * in it — "Unsupported field value: undefined" — and the error names the
 * document, not the field, so there's nothing to go on when it fires.
 *
 * Most of the portfolio's fields are optional, and in TypeScript an absent
 * optional field reads as `undefined`, so anything that builds an item from
 * incomplete input produces one naturally. Stripping here means every editor
 * is covered, rather than each one having to remember.
 *
 * Dropping the key is the correct reading of "no value": these are optional
 * fields, and the objects and arrays around them are always written whole, so
 * an absent key can't leave a stale value behind.
 */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => stripUndefined(entry)) as T;
  }
  // Plain objects only — anything else (a Date, a Firestore sentinel) has to
  // reach the SDK intact.
  if (value === null || typeof value !== "object") return value;
  if (Object.getPrototypeOf(value) !== Object.prototype) return value;

  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) result[key] = stripUndefined(entry);
  }
  return result as T;
}

export async function updatePortfolio(
  username: string,
  data: Partial<Portfolio>
): Promise<void> {
  await updateDoc(portfolioRef(username), {
    ...stripUndefined(data),
    updatedAt: Date.now(),
  });
}

export async function setPublished(username: string, published: boolean): Promise<void> {
  await updateDoc(portfolioRef(username), {
    published,
    updatedAt: Date.now(),
  });
}
