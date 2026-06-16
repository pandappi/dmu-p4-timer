import { memo } from "react";

import { roundLabel } from "../lib/i18n";
import type { DebuffEntry, Language, Round } from "../lib/types";

const ROUNDS: Round[] = [1, 2, 3, 4, 5];

type RoundStripProps = {
  selectedRound: Round;
  entriesByRound: Record<Round, DebuffEntry[]>;
  language: Language;
  onSelectRound: (round: Round) => void;
};

function RoundStripImpl({
  selectedRound,
  entriesByRound,
  language,
  onSelectRound,
}: RoundStripProps) {
  const isRoundComplete = (round: Round) =>
    entriesByRound[round].some((entry) => entry.kind === "input");
  const canOpenRound = (round: Round) => {
    for (let index = 1; index < round; index += 1) {
      if (!isRoundComplete(index as Round)) return false;
    }
    return true;
  };

  return (
    <section className="round-strip" aria-label="차수 선택">
      {ROUNDS.map((round) => {
        const locked = !canOpenRound(round);
        const hasManual = entriesByRound[round].some(
          (entry) => entry.kind === "input" && entry.source === "manual",
        );
        const hasAuto = entriesByRound[round].some(
          (entry) => entry.kind === "input" && entry.source === "auto",
        );
        const className = [
          "round-tab",
          selectedRound === round ? "active" : "",
          hasManual ? "done" : "",
          hasAuto ? "auto" : "",
          locked ? "locked" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            className={className}
            disabled={locked}
            key={round}
            onClick={() => onSelectRound(round)}
            type="button"
          >
            {roundLabel(language, round)}
          </button>
        );
      })}
    </section>
  );
}

export const RoundStrip = memo(RoundStripImpl);
