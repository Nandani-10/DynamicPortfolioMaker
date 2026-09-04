"use client";

import { motion } from "framer-motion";
import { answerRound, deleteRound } from "@/lib/us/store";
import { useUs } from "@/components/us/UsProvider";
import { relativeTime } from "@/lib/us/format";
import type { Round } from "@/types/us";

/**
 * Both answer blind; nothing is revealed until the second answer lands. That
 * small rule is what makes these fun instead of leading.
 */
export function RoundCard({ round }: { round: Round }) {
  const { uid, partner, nameFor } = useUs();
  const answers = round.answers ?? {};
  const mine = answers[uid]?.value;
  const theirs = partner ? answers[partner.uid]?.value : undefined;
  const revealed = Boolean(mine && theirs);
  const isTwoTruths = round.kind === "two-truths";

  // For two truths the creator's "answer" is the lie, so the guesser is the
  // only one who plays; reveal as soon as they've guessed.
  const twoTruthsGuess = isTwoTruths && round.createdBy !== uid ? mine : undefined;
  const twoTruthsLie = isTwoTruths ? answers[round.createdBy]?.value : undefined;
  const twoTruthsRevealed = isTwoTruths && Boolean(twoTruthsGuess);

  const showResult = isTwoTruths ? twoTruthsRevealed : revealed;
  const agreed = !isTwoTruths && mine === theirs;

  return (
    <motion.div layout className="us-card p-5" data-round={round.kind}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="us-muted text-[0.65rem] uppercase tracking-[0.2em]">
          {round.kind === "this-or-that"
            ? "This or that"
            : round.kind === "would-you-rather"
              ? "Would you rather"
              : isTwoTruths
                ? `Two truths & a lie · from ${nameFor(round.createdBy)}`
                : "Question"}
        </p>
        <span className="us-muted text-[0.68rem]">{relativeTime(round.createdAt)}</span>
      </div>

      <h3 className="us-title mt-2 text-base font-medium leading-snug">{round.prompt}</h3>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {round.options.map((option) => {
          const isMine = mine === option;
          const isTheirs = showResult && theirs === option;
          const isLie = isTwoTruths && showResult && twoTruthsLie === option;
          const disabled = isTwoTruths
            ? round.createdBy === uid || Boolean(twoTruthsGuess)
            : Boolean(mine);

          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => answerRound(round.id, uid, option).catch(() => {})}
              className="us-soft px-4 py-3 text-left text-sm transition disabled:cursor-default"
              style={{
                borderColor: isLie
                  ? "var(--us-accent-2)"
                  : isMine || isTheirs
                    ? "var(--us-accent)"
                    : "var(--us-border)",
                background:
                  isMine || isTheirs || isLie
                    ? "color-mix(in srgb, var(--us-accent) 14%, transparent)"
                    : undefined,
              }}
            >
              <span className="block">{option}</span>
              {(isMine || isTheirs || isLie) && (
                <span className="us-muted mt-1 block text-[0.68rem]">
                  {[
                    isMine ? "you" : null,
                    isTheirs ? (partner ? nameFor(partner.uid) : "them") : null,
                    isLie ? "the lie" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="us-muted mt-3 text-xs">
        {isTwoTruths
          ? round.createdBy === uid
            ? twoTruthsGuess
              ? "They guessed. Have a look."
              : "Waiting for their guess."
            : twoTruthsGuess
              ? twoTruthsGuess === twoTruthsLie
                ? "You caught the lie 😄"
                : "Wrong one — the lie is highlighted."
              : "Which one is the lie?"
          : !mine
            ? "Pick one — they can't see it until they've answered too."
            : !theirs
              ? "Answer locked in. Waiting for them."
              : agreed
                ? "Same answer ⭐"
                : "Okay, we need to discuss this 😂"}
      </p>

      {round.createdBy === uid && (
        <button
          type="button"
          className="us-muted mt-2 text-[0.68rem] underline-offset-4 hover:underline"
          onClick={() => deleteRound(round.id).catch(() => {})}
        >
          Remove
        </button>
      )}
    </motion.div>
  );
}
