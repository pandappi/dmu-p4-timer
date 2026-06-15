import { memo } from "react";

import { roundLabels } from "../lib/constants";
import type { DebuffEntry, Round } from "../lib/types";

const ROUNDS: Round[] = [1, 2, 3, 4, 5];

type RoundStripProps = {
  selectedRound: Round;
  entriesByRound: Record<Round, DebuffEntry[]>;
  onSelectRound: (round: Round) => void;
};

function RoundStripImpl({
  selectedRound,
  entriesByRound,
  onSelectRound,
}: RoundStripProps) {
  return (
    <section className="round-strip" aria-label="차수 선택">
      {ROUNDS.map((round) => {
        const hasManual = entriesByRound[round].some(
          (entry) => entry.source === "manual",
        );
        const hasAuto = entriesByRound[round].some(
          (entry) => entry.source === "auto",
        );
        const className = [
          "round-tab",
          selectedRound === round ? "active" : "",
          hasManual ? "done" : "",
          hasAuto ? "auto" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            className={className}
            key={round}
            onClick={() => onSelectRound(round)}
            type="button"
          >
            {roundLabels[round]}
          </button>
        );
      })}
    </section>
  );
}

export const RoundStrip = memo(RoundStripImpl);
