import { memo } from "react";

import { debuffLabel } from "../lib/actions";
import { debuffMeta } from "../lib/constants";
import type { DebuffName, TimerSettings } from "../lib/types";

type DebuffButtonProps = {
  debuff: DebuffName;
  selected: boolean;
  displayMode: TimerSettings["displayMode"];
  nameLanguage: TimerSettings["nameLanguage"];
  onClick: (debuff: DebuffName) => void;
};

function DebuffButtonImpl({
  debuff,
  selected,
  displayMode,
  nameLanguage,
  onClick,
}: DebuffButtonProps) {
  const meta = debuffMeta[debuff];
  const iconOnly = displayMode === "icon-only";

  return (
    <button
      aria-label={debuff}
      className={`choice ${selected ? "selected" : ""} ${iconOnly ? "icon-only" : ""}`}
      onClick={() => onClick(debuff)}
      style={{ color: meta.color }}
      type="button"
    >
      <img alt="" className="debuff-icon" src={meta.icon} />
      {iconOnly ? null : (
        <span className="choice-copy">
          <span className="name">{debuffLabel(debuff, nameLanguage)}</span>
          <small>{meta.short}</small>
        </span>
      )}
    </button>
  );
}

export const DebuffButton = memo(DebuffButtonImpl);
