"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useUs } from "@/components/us/UsProvider";
import { useUsActions } from "@/hooks/useUsActions";
import { DailyCheckIn } from "@/components/us/DailyCheckIn";
import { RoundCard } from "@/components/us/RoundCard";
import { SuggestionSheet } from "@/components/us/SuggestionSheet";
import { createRound, answerRound } from "@/lib/us/store";
import {
  CONVERSATION_STARTERS,
  THIS_OR_THAT,
  WOULD_YOU_RATHER,
  pickRandom,
} from "@/lib/us/content";

export default function PlayPage() {
  const { rounds, uid } = useUs();
  const actions = useUsActions();
  const [starter, setStarter] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [twoTruths, setTwoTruths] = useState<string[]>(["", "", ""]);
  const [lieIndex, setLieIndex] = useState(0);
  const [showTwoTruths, setShowTwoTruths] = useState(false);

  const openRounds = useMemo(
    () =>
      rounds.filter((round) => {
        const answers = round.answers ?? {};
        return Object.keys(answers).length < 2;
      }),
    [rounds]
  );
  const doneRounds = useMemo(
    () => rounds.filter((round) => Object.keys(round.answers ?? {}).length >= 2),
    [rounds]
  );

  async function newRound(kind: "this-or-that" | "would-you-rather") {
    setBusy(true);
    try {
      const source = kind === "this-or-that" ? THIS_OR_THAT : WOULD_YOU_RATHER;
      const used = new Set(rounds.filter((r) => r.kind === kind).map((r) => r.prompt + r.options.join()));
      const fresh = source.filter((item) => !used.has(item.prompt + item.options.join()));
      const item = pickRandom(fresh.length > 0 ? fresh : source);
      await createRound({
        kind,
        prompt: item.prompt,
        options: [...item.options],
        createdBy: uid,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="us-card p-6">
        <h1 className="us-title text-2xl font-semibold">Something to do</h1>
        <p className="us-muted mt-1 text-sm">
          For the days when talking needs a starting point.
        </p>
      </header>

      <section className="us-card p-5">
        <h2 className="us-title text-base font-medium">🎲 Talk to me</h2>
        <p className="us-muted mt-1 text-sm">One question at a time. Ask, or just read.</p>

        <motion.div
          key={starter ?? "empty"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="us-soft mt-4 p-4"
        >
          <p className="us-title text-base leading-snug">
            {starter ?? "Tap below and I'll think of something."}
          </p>
        </motion.div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="us-primary text-sm"
            onClick={() =>
              setStarter(pickRandom(CONVERSATION_STARTERS, starter ?? undefined))
            }
          >
            {starter ? "Another one" : "Give me a question"}
          </button>
          {starter && (
            <button
              type="button"
              className="us-chip text-sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await actions.sendText(starter, undefined, "question");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Send it to them
            </button>
          )}
        </div>
      </section>

      <DailyCheckIn />

      <section className="us-card p-5">
        <h2 className="us-title text-base font-medium">Play a round</h2>
        <p className="us-muted mt-1 text-sm">
          Answers stay hidden until you&apos;ve both picked.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="us-chip text-xs"
            disabled={busy}
            onClick={() => newRound("this-or-that")}
          >
            ⚖️ This or That
          </button>
          <button
            type="button"
            className="us-chip text-xs"
            disabled={busy}
            onClick={() => newRound("would-you-rather")}
          >
            🤔 Would You Rather
          </button>
          <button
            type="button"
            className="us-chip text-xs"
            data-active={showTwoTruths}
            onClick={() => setShowTwoTruths((open) => !open)}
          >
            🕵️ Two Truths &amp; a Lie
          </button>
        </div>

        {showTwoTruths && (
          <form
            className="mt-4 space-y-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const statements = twoTruths.map((line) => line.trim());
              if (statements.some((line) => !line) || busy) return;
              setBusy(true);
              try {
                const id = await createRound({
                  kind: "two-truths",
                  prompt: "Two of these are true. One isn't.",
                  options: statements,
                  createdBy: uid,
                });
                // The creator's stored answer *is* the lie, revealed only once
                // the other person has guessed.
                await answerRound(id, uid, statements[lieIndex]);
                setTwoTruths(["", "", ""]);
                setLieIndex(0);
                setShowTwoTruths(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            {twoTruths.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className="us-input flex-1"
                  placeholder={`Statement ${index + 1}`}
                  value={value}
                  maxLength={120}
                  onChange={(event) =>
                    setTwoTruths((prev) =>
                      prev.map((line, i) => (i === index ? event.target.value : line))
                    )
                  }
                />
                <button
                  type="button"
                  className="us-chip shrink-0 text-[0.68rem]"
                  data-active={lieIndex === index}
                  onClick={() => setLieIndex(index)}
                >
                  {lieIndex === index ? "the lie" : "mark as lie"}
                </button>
              </div>
            ))}
            <button
              type="submit"
              className="us-primary text-sm"
              disabled={busy || twoTruths.some((line) => !line.trim())}
            >
              Send it over
            </button>
          </form>
        )}
      </section>

      {openRounds.length > 0 && (
        <div className="space-y-3">
          <h2 className="us-muted px-1 pt-2 text-[0.65rem] uppercase tracking-[0.2em]">
            Waiting on an answer
          </h2>
          {openRounds.map((round) => (
            <RoundCard key={round.id} round={round} />
          ))}
        </div>
      )}

      {doneRounds.length > 0 && (
        <div className="space-y-3">
          <h2 className="us-muted px-1 pt-2 text-[0.65rem] uppercase tracking-[0.2em]">
            Already played
          </h2>
          {doneRounds.slice(0, 8).map((round) => (
            <RoundCard key={round.id} round={round} />
          ))}
        </div>
      )}

      <section className="us-card p-5">
        <h2 className="us-title text-base font-medium">Still nothing to say?</h2>
        <p className="us-muted mt-1 text-sm">Borrow a line. Nobody has to know.</p>
        <div className="mt-2">
          <SuggestionSheet
            compact
            onSend={async (text) => {
              await actions.sendText(text);
            }}
          />
        </div>
      </section>
    </div>
  );
}
