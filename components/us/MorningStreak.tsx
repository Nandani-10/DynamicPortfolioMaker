"use client";

import { useMemo } from "react";
import { useUs } from "@/components/us/UsProvider";
import { dayKey } from "@/lib/us/format";

/**
 * Not a streak counter with a fire emoji — a little garden. Every morning the
 * two of you greet each other, one more plant grows, and it never scolds you
 * for a gap; it just keeps what has grown.
 */
export function MorningStreak() {
  const { days, uid, partner } = useUs();

  const { grown, both, todayDone, run } = useMemo(() => {
    const sorted = [...days].sort((a, b) => (a.id < b.id ? 1 : -1));
    const isBoth = (id: string) => {
      const day = sorted.find((d) => d.id === id);
      if (!day?.morning) return false;
      const greeters = Object.keys(day.morning);
      return greeters.length >= 2 || (partner ? greeters.includes(partner.uid) : false);
    };

    const grownCount = sorted.filter((d) => Object.keys(d.morning ?? {}).length > 0).length;
    const bothCount = sorted.filter((d) => Object.keys(d.morning ?? {}).length >= 2).length;

    const today = sorted.find((d) => d.id === dayKey());
    const doneToday = Boolean(today?.morning?.[uid]);

    // Consecutive mornings, counting back from today (or yesterday, if the
    // day is still young and nobody has said anything yet).
    let streak = 0;
    const cursor = new Date();
    if (!doneToday && !isBoth(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    for (let i = 0; i < 120; i += 1) {
      const key = dayKey(cursor);
      const day = sorted.find((d) => d.id === key);
      if (day && Object.keys(day.morning ?? {}).length > 0) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    return { grown: grownCount, both: bothCount, todayDone: doneToday, run: streak };
  }, [days, uid, partner]);

  const plants = Math.min(12, Math.max(1, run));
  const stages = ["🌱", "🌿", "🌾", "🌻", "🌳"];

  return (
    <section className="us-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="us-title text-base font-medium">Your mornings</h2>
        <span className="us-muted text-xs">
          {grown} so far · {both} shared
        </span>
      </div>

      <div className="mt-4 flex min-h-[3.25rem] flex-wrap items-end gap-1.5">
        {Array.from({ length: plants }, (_, i) => {
          const stage = stages[Math.min(stages.length - 1, Math.floor(i / 2.5))];
          return (
            <span
              key={i}
              className="us-breathe"
              style={{
                fontSize: `${1 + Math.min(0.9, i * 0.07)}rem`,
                animationDelay: `${i * 0.28}s`,
              }}
            >
              {stage}
            </span>
          );
        })}
      </div>

      <p className="us-muted mt-3 text-xs leading-relaxed">
        {run === 0
          ? "The garden starts with one good morning."
          : todayDone
            ? `${run} morning${run === 1 ? "" : "s"} in a row. Today's is already planted.`
            : `${run} morning${run === 1 ? "" : "s"} in a row — today's spot is still empty.`}
      </p>
    </section>
  );
}
