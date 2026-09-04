"use client";

import { useEffect, useMemo, useState } from "react";
import { DAILY_CHECK_INS } from "@/lib/us/content";
import { answerCheckIn, setCheckInQuestion } from "@/lib/us/store";
import { useUs } from "@/components/us/UsProvider";
import { dayKey } from "@/lib/us/format";

/**
 * One shared question a day. The question is derived from the date rather than
 * drawn at random, so both of you get the same one without either client
 * having to "win" the write.
 */
function questionForToday(): string {
  const key = dayKey();
  const seed = Number(key.replaceAll("-", ""));
  return DAILY_CHECK_INS[seed % DAILY_CHECK_INS.length];
}

export function DailyCheckIn() {
  const { days, uid, partner, nameFor } = useUs();
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => days.find((day) => day.id === dayKey()), [days]);
  const question = today?.checkIn?.question ?? questionForToday();
  const answers = today?.checkIn?.answers ?? {};
  // An emptied answer means "let me redo this", so treat it as unanswered.
  const mine = answers[uid]?.value ? answers[uid] : undefined;
  const theirs = partner && answers[partner.uid]?.value ? answers[partner.uid] : undefined;

  // Pin the question for the day the first time anyone looks.
  useEffect(() => {
    if (today?.checkIn?.question) return;
    setCheckInQuestion(questionForToday()).catch(() => {});
  }, [today]);

  return (
    <section className="us-card p-5">
      <p className="us-muted text-[0.65rem] uppercase tracking-[0.2em]">
        Today&apos;s check-in
      </p>
      <h2 className="us-title mt-2 text-lg font-medium leading-snug">{question}</h2>

      {mine ? (
        <div className="mt-4 space-y-2">
          <div className="us-soft p-3">
            <p className="us-muted text-xs">You</p>
            <p className="mt-1 text-sm">{mine.value}</p>
          </div>
          {theirs ? (
            <div className="us-soft p-3">
              <p className="us-muted text-xs">{partner ? nameFor(partner.uid) : "Them"}</p>
              <p className="mt-1 text-sm">{theirs.value}</p>
            </div>
          ) : (
            <p className="us-muted text-xs">
              Waiting for {partner?.name?.split(" ")[0] ?? "them"} to answer.
            </p>
          )}
          <button
            type="button"
            className="us-chip text-xs"
            onClick={() => {
              setDraft(mine.value);
              answerCheckIn(uid, "").catch(() => {});
            }}
          >
            ✎ Change my answer
          </button>
        </div>
      ) : (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!draft.trim() || saving) return;
            setSaving(true);
            try {
              await answerCheckIn(uid, draft.trim());
              setDraft("");
            } finally {
              setSaving(false);
            }
          }}
        >
          <input
            className="us-input flex-1"
            placeholder="Short is fine."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={200}
          />
          <button type="submit" className="us-primary" disabled={!draft.trim() || saving}>
            {saving ? "…" : "Answer"}
          </button>
        </form>
      )}
    </section>
  );
}
