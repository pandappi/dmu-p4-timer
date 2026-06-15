import { memo } from "react";

import { debuffMeta } from "../lib/constants";
import type { DebuffName, TimerSettings } from "../lib/types";
import { formatDurationLabel } from "../lib/utils";
import { DebuffButton } from "./DebuffButton";

type DurationSelectorProps = {
  mode: TimerSettings["durationMode"];
  debuffs: DebuffName[];
  displayMode: TimerSettings["displayMode"];
  nameLanguage: TimerSettings["nameLanguage"];
  options: number[];
  selectedDebuff: DebuffName | null;
  selectedDuration: number | null;
  onDebuffSelect: (debuff: DebuffName) => void;
  onDebuffWithDuration: (debuff: DebuffName, duration: number) => void;
  onDurationSelect: (duration: number) => void;
};

// 마안(시선)은 시간이 고정이라 시간 선택이 필요 없다.
function needsTime(debuff: DebuffName) {
  return debuff !== "Cursed Shriek";
}

// split-select: 선택된 디버프 칸을 좌/우 시간 버튼으로 분할(아이콘 없음).
function SplitSelectCell({
  debuff,
  options,
  selectedDuration,
  onPickTime,
}: {
  debuff: DebuffName;
  options: number[];
  selectedDuration: number | null;
  onPickTime: (duration: number) => void;
}) {
  return (
    <div
      aria-label={debuff}
      className="choice split-select selected"
      style={{ color: debuffMeta[debuff].color }}
    >
      <div className="split-lr">
        {options.map((duration) => (
          <button
            className={`lr-time ${selectedDuration === duration ? "active" : ""}`}
            key={duration}
            onClick={() => onPickTime(duration)}
            type="button"
          >
            {formatDurationLabel(duration)}
          </button>
        ))}
      </div>
    </div>
  );
}

// split-grid: 위에 디버프 아이콘, 아래에 (시간)/(시간). 한 번에 들어가도록 키를 키운다.
function SplitGridCell({
  debuff,
  selected,
  options,
  selectedDuration,
  onPickDebuff,
  onPickTime,
}: {
  debuff: DebuffName;
  selected: boolean;
  options: number[];
  selectedDuration: number | null;
  onPickDebuff: () => void;
  onPickTime: (duration: number) => void;
}) {
  const meta = debuffMeta[debuff];

  return (
    <div
      className={`choice split-grid ${selected ? "selected" : ""}`}
      style={{ color: meta.color }}
    >
      <button
        aria-label={debuff}
        className="sg-debuff"
        onClick={onPickDebuff}
        type="button"
      >
        <img alt="" className="debuff-icon" src={meta.icon} />
      </button>
      <div className="sg-times">
        {options.map((duration) => (
          <button
            className={`sg-time ${selected && selectedDuration === duration ? "active" : ""}`}
            key={duration}
            onClick={() => onPickTime(duration)}
            type="button"
          >
            {formatDurationLabel(duration)}
          </button>
        ))}
      </div>
    </div>
  );
}

function DurationSelectorImpl({
  mode,
  debuffs,
  displayMode,
  nameLanguage,
  options,
  selectedDebuff,
  selectedDuration,
  onDebuffSelect,
  onDebuffWithDuration,
  onDurationSelect,
}: DurationSelectorProps) {
  if (mode === "split-grid") {
    return (
      <div className="button-grid">
        {debuffs.map((debuff) =>
          needsTime(debuff) ? (
            <SplitGridCell
              debuff={debuff}
              key={debuff}
              onPickDebuff={() => onDebuffSelect(debuff)}
              onPickTime={(duration) => onDebuffWithDuration(debuff, duration)}
              options={options}
              selected={selectedDebuff === debuff}
              selectedDuration={selectedDuration}
            />
          ) : (
            <DebuffButton
              debuff={debuff}
              displayMode={displayMode}
              key={debuff}
              nameLanguage={nameLanguage}
              onClick={onDebuffSelect}
              selected={selectedDebuff === debuff}
            />
          ),
        )}
      </div>
    );
  }

  if (mode === "split-select") {
    return (
      <div className="button-grid">
        {debuffs.map((debuff) => {
          const selected = selectedDebuff === debuff;
          return selected && needsTime(debuff) ? (
            <SplitSelectCell
              debuff={debuff}
              key={debuff}
              onPickTime={onDurationSelect}
              options={options}
              selectedDuration={selectedDuration}
            />
          ) : (
            <DebuffButton
              debuff={debuff}
              displayMode={displayMode}
              key={debuff}
              nameLanguage={nameLanguage}
              onClick={onDebuffSelect}
              selected={selected}
            />
          );
        })}
      </div>
    );
  }

  // panel 모드: 시간 영역을 항상 보여주고, 시간이 필요한 디버프를 고른 경우에만 활성화.
  const panelEnabled = Boolean(selectedDebuff && needsTime(selectedDebuff));

  return (
    <>
      <div className="button-grid">
        {debuffs.map((debuff) => (
          <DebuffButton
            debuff={debuff}
            displayMode={displayMode}
            key={debuff}
            nameLanguage={nameLanguage}
            onClick={onDebuffSelect}
            selected={selectedDebuff === debuff}
          />
        ))}
      </div>
      <div
        className={`segmented two-col duration-panel ${panelEnabled ? "" : "disabled"}`}
        aria-label="지속시간 선택"
      >
        {options.map((duration) => (
          <button
            className={`segment ${selectedDuration === duration ? "active" : ""}`}
            disabled={!panelEnabled}
            key={duration}
            onClick={() => onDurationSelect(duration)}
            type="button"
          >
            {formatDurationLabel(duration)}
          </button>
        ))}
      </div>
    </>
  );
}

export const DurationSelector = memo(DurationSelectorImpl);
