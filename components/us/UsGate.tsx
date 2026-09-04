"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import {
  PIN_STORAGE_KEY,
  PIN_TTL_MS,
  SPACE_PIN,
  isPinEnabled,
} from "@/lib/us/config";
import { probeAccess } from "@/lib/us/store";
import { UsProvider } from "@/components/us/UsProvider";
import type { AmbientPhase } from "@/lib/us/ambient";

/**
 * Three locks, in order: Firebase must exist, the database must recognise the
 * signed-in account as one of the two, and (optionally) a shared PIN unlocks
 * the device for a while.
 *
 * The second lock is the real one, and it is not enforced here — the rules
 * decide, and this screen only reports what they said. That keeps both
 * addresses out of the deployed bundle, and means there is no way to get in by
 * editing what the browser is running.
 */
export function UsGate({
  phase,
  children,
}: {
  phase: AmbientPhase;
  children: ReactNode;
}) {
  const { user, loading, signInWithGoogle, signOut, redirectError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(!isPinEnabled);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [access, setAccess] = useState<"checking" | "granted" | "denied" | "error">(
    "checking"
  );

  useEffect(() => {
    if (!isPinEnabled) return;
    try {
      const until = Number(window.localStorage.getItem(PIN_STORAGE_KEY) ?? 0);
      if (until > Date.now()) setUnlocked(true);
    } catch {
      // Private mode / blocked storage just means the PIN is asked again.
    }
  }, []);

  // Ask the rules whether this account belongs here.
  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;
    let cancelled = false;
    setAccess("checking");
    probeAccess()
      .then((result) => {
        if (!cancelled) setAccess(result);
      })
      .catch(() => {
        if (!cancelled) setAccess("error");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!isFirebaseConfigured) {
    return (
      <Shell title="Almost there">
        <p className="us-muted text-sm leading-relaxed">
          This space needs a Firebase project to live in. Set the{" "}
          <code>NEXT_PUBLIC_FIREBASE_*</code> values, and put the two of you in{" "}
          <code>firestore.rules</code> — that file is the guest list, and until
          it names you, nobody gets in.
        </p>
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell title="Opening the door">
        <div className="mt-2 h-1 w-40 overflow-hidden rounded-full bg-[var(--us-border)]">
          <div className="h-full w-1/2 animate-[us-drift_1.4s_ease-in-out_infinite] rounded-full bg-[var(--us-accent)]" />
        </div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell title="Just the two of us">
        <p className="us-muted max-w-sm text-sm leading-relaxed">
          A small private world. Sign in with the account you always use — nobody
          else can get in, and there is nothing here to find for anyone who tries.
        </p>
        <button
          type="button"
          className="us-primary mt-6"
          disabled={signingIn}
          onClick={async () => {
            setError(null);
            setSigningIn(true);
            try {
              await signInWithGoogle();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Sign-in failed.");
            } finally {
              setSigningIn(false);
            }
          }}
        >
          {signingIn ? "Opening…" : "Continue with Google"}
        </button>
        {Boolean(error || redirectError) && (
          <p className="mt-4 text-sm text-[var(--us-accent-2)]">
            {error ?? "That sign-in didn\u2019t complete. Try once more."}
          </p>
        )}
      </Shell>
    );
  }

  if (access === "checking") {
    return (
      <Shell title="One moment">
        <p className="us-muted text-sm">Checking whether this space is yours.</p>
      </Shell>
    );
  }

  if (access === "error") {
    return (
      <Shell title="Couldn't reach the space">
        <p className="us-muted max-w-sm text-sm leading-relaxed">
          The connection failed rather than being refused — usually the network,
          occasionally the project itself.
        </p>
        <button
          type="button"
          className="us-primary mt-6"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </Shell>
    );
  }

  if (access === "denied") {
    return (
      <Shell title="This one isn't yours">
        <p className="us-muted max-w-sm text-sm leading-relaxed">
          <span className="text-[var(--us-text)]">{user.email}</span> isn&apos;t one
          of the two accounts this space belongs to, so there is nothing here to
          show.
        </p>
        <button type="button" className="us-chip mt-6" onClick={() => signOut()}>
          Sign out
        </button>
      </Shell>
    );
  }

  if (!unlocked) {
    return (
      <Shell title="Enter the PIN">
        <form
          className="mt-4 flex flex-col items-center gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (pin.trim() === SPACE_PIN) {
              setUnlocked(true);
              try {
                window.localStorage.setItem(
                  PIN_STORAGE_KEY,
                  String(Date.now() + PIN_TTL_MS)
                );
              } catch {
                // Not being able to remember it is fine — just ask again.
              }
            } else {
              setPinError(true);
              setPin("");
            }
          }}
        >
          <input
            className="us-input max-w-[12rem] text-center text-2xl tracking-[0.4em]"
            value={pin}
            onChange={(event) => {
              setPin(event.target.value);
              setPinError(false);
            }}
            inputMode="numeric"
            autoComplete="off"
            aria-label="Shared PIN"
            maxLength={8}
          />
          <button type="submit" className="us-primary">
            Unlock
          </button>
          {pinError && (
            <p className="text-sm text-[var(--us-accent-2)]">Not quite. Try again.</p>
          )}
        </form>
      </Shell>
    );
  }

  return (
    <UsProvider user={user} phase={phase}>
      {children}
    </UsProvider>
  );
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-6 py-16">
      <div className="us-card us-rise flex w-full max-w-md flex-col items-center p-8 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--us-mine)] text-2xl shadow-lg">
          ❤
        </div>
        <h1 className="us-title text-2xl font-semibold">{title}</h1>
        <div className="mt-3 w-full">{children}</div>
      </div>
    </div>
  );
}
