"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUs } from "@/components/us/UsProvider";
import type { SpecialDate } from "@/types/us";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
}

function remainingUntil(iso: string, now: number): Remaining {
  const target = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso).getTime();
  const diff = target - now;
  const abs = Math.abs(diff);
  return {
    days: Math.floor(abs / 86_400_000),
    hours: Math.floor((abs % 86_400_000) / 3_600_000),
    minutes: Math.floor((abs % 3_600_000) / 60_000),
    seconds: Math.floor((abs % 60_000) / 1000),
    past: diff < 0,
  };
}

/** The nearest date, counted down to the second, with the rest listed under it. */
export function CountdownCard() {
  const { space } = useUs();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const dates = useMemo<SpecialDate[]>(() => space?.dates ?? [], [space]);

  const upcoming = useMemo(() => {
    const future = dates
      .map((date) => ({ date, at: new Date(
        date.date.length <= 10 ? `${date.date}T00:00:00` : date.date
      ).getTime() }))
      .filter((entry) => Number.isFinite(entry.at) && entry.at > now)
      .sort((a, b) => a.at - b.at);
    return future[0]?.date ?? null;
  }, [dates, now]);

  if (dates.length === 0) {
    return (
      <section className="us-card p-5">
        <h2 className="us-title text-base font-medium">Until our day</h2>
        <p className="us-muted mt-2 text-sm leading-relaxed">
          Add the dates that matter — the wedding, the next time you meet, the day
          you first spoke — and this counts down to them.
        </p>
        <Link href="/us/settings" className="us-chip mt-3 text-xs">
          Add a date
        </Link>
      </section>
    );
  }

  const target = upcoming ?? dates[0];
  const left = remainingUntil(target.date, now);

  return (
    <section className="us-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="us-title text-base font-medium">
          {target.emoji ? `${target.emoji} ` : ""}
          {target.label}
        </h2>
        <Link href="/us/settings" className="us-muted text-xs underline-offset-4 hover:underline">
          Edit
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[
          { value: left.days, label: "days" },
          { value: left.hours, label: "hours" },
          { value: left.minutes, label: "min" },
          { value: left.seconds, label: "sec" },
        ].map((unit) => (
          <div key={unit.label} className="us-soft py-3">
            <p className="us-title text-xl font-semibold tabular-nums">{unit.value}</p>
            <p className="us-muted text-[0.62rem] uppercase tracking-[0.18em]">
              {unit.label}
            </p>
          </div>
        ))}
      </div>

      <p className="us-muted mt-3 text-xs">
        {left.past ? "That one has already happened." : "Counting down, quietly."}
      </p>

      {dates.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {dates
            .filter((date) => date.id !== target.id)
            .slice(0, 5)
            .map((date) => (
              <span key={date.id} className="us-chip text-[0.7rem]">
                {date.emoji} {date.label} ·{" "}
                {new Date(
                  date.date.length <= 10 ? `${date.date}T00:00:00` : date.date
                ).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
              </span>
            ))}
        </div>
      )}
    </section>
  );
}
