"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase/client";
import { subscribeToUserProfile } from "@/lib/firestore/portfolio";
import { shouldFallBackToRedirect } from "@/lib/auth-errors";
import type { UserProfile } from "@/types/portfolio";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  /** Error from a redirect-based sign-in, which has no call site to catch it. */
  redirectError: unknown;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [redirectError, setRedirectError] = useState<unknown>(null);

  useEffect(() => {
    // Firebase isn't configured (e.g. this build/preview has no env vars) —
    // skip auth entirely instead of letting the SDK throw on prerender.
    if (!isFirebaseConfigured) {
      setAuthLoading(false);
      setProfileLoading(false);
      return;
    }
    // Completes the redirect flow when we fell back to it. Without this the
    // error from a failed redirect sign-in is never surfaced anywhere.
    getRedirectResult(auth).catch((error) => {
      setRedirectError(error);
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (!firebaseUser) {
        setProfile(null);
        setProfileLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    const unsubscribe = subscribeToUserProfile(user.uid, (p) => {
      setProfile(p);
      setProfileLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading: authLoading || (!!user && profileLoading),
      redirectError,
      signInWithGoogle: async () => {
        if (!isFirebaseConfigured) {
          throw new Error(
            "Firebase isn't configured yet. Add your Firebase env vars to enable sign-in."
          );
        }
        try {
          await signInWithPopup(auth, googleProvider);
        } catch (error) {
          // Popups are blocked outright in some browsers and in embedded
          // webviews (Instagram/LinkedIn in-app browsers), where the only
          // workable flow is a full-page redirect.
          if (shouldFallBackToRedirect(error)) {
            await signInWithRedirect(auth, googleProvider);
            return;
          }
          throw error;
        }
      },
      signOut: async () => {
        await firebaseSignOut(auth);
      },
    }),
    [user, profile, authLoading, profileLoading, redirectError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
