import { memo } from "react";

import { roundLabel, text } from "../lib/i18n";
import type { Language, Round } from "../lib/types";

type TopBarProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  selectedRound: Round;
};

function TopBarImpl({
  language,
  onLanguageChange,
  selectedRound,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="icon-tile">
          <img alt="DMU P4 Assist" className="brand-logo" src="/logo.png" />
        </div>
        <div>
          <h1>DMU P4 Assist</h1>
          <p>
            {roundLabel(language, selectedRound)} {text(language, "select")}
          </p>
        </div>
      </div>
      <select
        aria-label="Language"
        className="language-select"
        onChange={(event) => onLanguageChange(event.target.value as Language)}
        value={language}
      >
        <option value="ko">KOR</option>
        <option value="en">ENG</option>
      </select>
    </header>
  );
}

export const TopBar = memo(TopBarImpl);
