import { memo } from "react";

import { roundLabels } from "../lib/constants";
import type { Round } from "../lib/types";

type TopBarProps = {
  selectedRound: Round;
};

function TopBarImpl({ selectedRound }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="icon-tile">
          <img alt="DMU P4 Assist 로고" className="brand-logo" src="/logo.png" />
        </div>
        <div>
          <h1>DMU P4 Assist</h1>
          <p>{roundLabels[selectedRound]} 선택</p>
        </div>
      </div>
    </header>
  );
}

export const TopBar = memo(TopBarImpl);
