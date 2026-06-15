import { Siren } from "lucide-react";
import { memo } from "react";

import { roundLabels } from "../lib/constants";
import type { Round } from "../lib/types";
import { formatClock } from "../lib/utils";

type TopBarProps = {
  selectedRound: Round;
  elapsedSeconds: number;
};

function TopBarImpl({ selectedRound, elapsedSeconds }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="icon-tile">
          <Siren size={20} aria-hidden="true" />
        </div>
        <div>
          <h1>DMU P4 Timer</h1>
          <p>{roundLabels[selectedRound]} 선택</p>
        </div>
      </div>
      <div className="elapsed">
        <span>경과</span>
        {formatClock(elapsedSeconds)}
      </div>
    </header>
  );
}

export const TopBar = memo(TopBarImpl);
