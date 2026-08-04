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
    tx.set(portfolioRef(username), newPortfolio);
    tx.set(userRef(uid), {
      uid,
      username,
      email,
      displayName,
      createdAt: Date.now(),
    } satisfies UserProfile);
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

export async function updatePortfolio(
  username: string,
  data: Partial<Portfolio>
): Promise<void> {
  await updateDoc(portfolioRef(username), {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function setPublished(username: string, published: boolean): Promise<void> {
  await updateDoc(portfolioRef(username), {
    published,
    updatedAt: Date.now(),
  });
}
