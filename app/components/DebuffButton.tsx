import { memo } from "react";

import { debuffMeta } from "../lib/constants";
import type { DebuffName } from "../lib/types";

type DebuffButtonProps = {
  debuff: DebuffName;
  selected: boolean;
  onClick: (debuff: DebuffName) => void;
};

function DebuffButtonImpl({
  debuff,
  selected,
  onClick,
}: DebuffButtonProps) {
  const meta = debuffMeta[debuff];

  return (
    <button
      aria-label={debuff}
      className={`choice icon-only ${selected ? "selected" : ""}`}
      onClick={() => onClick(debuff)}
      style={{ color: meta.color }}
      type="button"
    >
      <img alt="" className="debuff-icon" src={meta.icon} />
    </button>
  );
}

export const DebuffButton = memo(DebuffButtonImpl);
