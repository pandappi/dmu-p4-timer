import { Check } from "lucide-react";
import { memo } from "react";

import {
  finalDebuffs,
  roundLabels,
  woundDebuffs,
} from "../lib/constants";
import {
  ASSIGNMENT_DURATIONS,
  debuffLabel,
  getWaveTimingLabel,
  isAccelerationBomb,
  isWaterLightning,
} from "../lib/actions";
import { inferRound4 } from "../lib/rules";
import type {
  AssistMode,
  DebuffEntry,
  DebuffName,
  Round,
  TimerSettings,
  TruthState,
} from "../lib/types";
import { formatDurationLabel } from "../lib/utils";
import { DebuffButton } from "./DebuffButton";

type WorkspaceProps = {
  selectedRound: Round;
  assistMode: AssistMode;
  registrationMode: TimerSettings["registrationMode"];
  suggestedRound4: ReturnType<typeof inferRound4>;
  round1Entry: DebuffEntry | undefined;
  leaderRound1BombEntry: DebuffEntry | undefined;
  visibleDebuffs: DebuffName[];
  selectedTruth: TruthState | null;
  selectedDebuff: DebuffName | null;
  selectedDuration: number | null;
  selectedBombDuration: number | "none" | null;
  selectedWound: DebuffName | null;
  selectedFinal: DebuffName | null;
  canRegister: boolean;
  onTruthSelect: (truth: TruthState) => void;
  onDebuffSelect: (debuff: DebuffName) => void;
  onDurationSelect: (duration: number) => void;
  onBombDurationSelect: (duration: number | "none") => void;
  onWoundSelect: (debuff: DebuffName) => void;
  onFinalSelect: (debuff: DebuffName) => void;
  onRegister: (options: { source: "manual" | "auto" }) => void;
};

const waveDurations = [
  ASSIGNMENT_DURATIONS.round1FastWave,
  ASSIGNMENT_DURATIONS.round1SlowWave,
];

function WavePairTile() {
  return (
    <div className="leader-tile" aria-label="물 번개">
      <img alt="" src="/debuffs/compressed-water.png" />
      <img alt="" src="/debuffs/forked-lightning.png" />
    </div>
  );
}

function BombTile() {
  return (
    <div className="leader-tile single" aria-label="가속도폭탄">
      <img alt="" src="/debuffs/acceleration-bomb.png" />
    </div>
  );
}

function DurationButtons({
  ariaLabel,
  options,
  selected,
  onSelect,
}: {
  ariaLabel: string;
  options: number[];
  selected: number | null;
  onSelect: (duration: number) => void;
}) {
  return (
    <div className="segmented two-col duration-panel" aria-label={ariaLabel}>
      {options.map((duration) => (
        <button
          className={`segment time-choice ${selected === duration ? "active" : ""}`}
          key={duration}
          onClick={() => onSelect(duration)}
          type="button"
        >
          <strong>{formatDurationLabel(duration)}</strong>
          <small>{getWaveTimingLabel(duration)}</small>
        </button>
      ))}
    </div>
  );
}

function WorkspaceImpl({
  selectedRound,
  assistMode,
  registrationMode,
  suggestedRound4,
  round1Entry,
  leaderRound1BombEntry,
  visibleDebuffs,
  selectedTruth,
  selectedDebuff,
  selectedDuration,
  selectedBombDuration,
  selectedWound,
  selectedFinal,
  canRegister,
  onTruthSelect,
  onDebuffSelect,
  onDurationSelect,
  onBombDurationSelect,
  onWoundSelect,
  onFinalSelect,
  onRegister,
}: WorkspaceProps) {
  const showAutoRound4 = selectedRound === 4 && Boolean(suggestedRound4);
  const showTruthToggle = selectedRound !== 5;
  const isRaidMode = assistMode === "raid";
  const round1WasBomb = isAccelerationBomb(round1Entry?.debuff);
  const round1WasWaterLightning = isWaterLightning(round1Entry?.debuff);
  const raidRound1HasBomb = Boolean(leaderRound1BombEntry);
  const round3Debuffs = round1WasBomb
    ? (["Compressed Water", "Forked Lightning"] satisfies DebuffName[])
    : [];
  const round3Durations = round1WasWaterLightning
    ? [
        ASSIGNMENT_DURATIONS.round3FastWave,
        ASSIGNMENT_DURATIONS.round3SlowWave,
      ]
    : round1WasBomb
      ? [
          ASSIGNMENT_DURATIONS.round3FastWave,
          ASSIGNMENT_DURATIONS.round3SlowWave,
        ]
      : [];

  return (
    <section className="panel workspace" id="workspace-panel">
      <div className="panel-head">
        <h2>{roundLabels[selectedRound]} 디버프</h2>
      </div>
      <div className="panel-body selector">
        {showTruthToggle ? (
          <div className="truth-toggle" aria-label="진실 거짓 선택">
            <button
              className={`truth-button truth ${selectedTruth === "truth" ? "active" : ""}`}
              onClick={() => onTruthSelect("truth")}
              type="button"
            >
              진실
            </button>
            <button
              className={`truth-button lie ${selectedTruth === "lie" ? "active" : ""}`}
              onClick={() => onTruthSelect("lie")}
              type="button"
            >
              거짓
            </button>
          </div>
        ) : null}

        {isRaidMode && selectedRound === 1 ? (
          <>
            <div className="leader-row">
              <WavePairTile />
              <DurationButtons
                ariaLabel="물 번개 부여 당시 지속시간 선택"
                onSelect={onDurationSelect}
                options={waveDurations}
                selected={selectedDuration}
              />
            </div>
            <div className="leader-row">
              <BombTile />
              <div
                className="segmented three-col duration-panel"
                aria-label="리딩자 가속도폭탄 선택"
              >
                {waveDurations.map((duration) => (
                  <button
                    className={`segment time-choice ${selectedBombDuration === duration ? "active" : ""}`}
                    key={duration}
                    onClick={() => onBombDurationSelect(duration)}
                    type="button"
                  >
                    <strong>{formatDurationLabel(duration)}</strong>
                    <small>{getWaveTimingLabel(duration)}</small>
                  </button>
                ))}
                <button
                  className={`segment time-choice ${selectedBombDuration === "none" ? "active" : ""}`}
                  onClick={() => onBombDurationSelect("none")}
                  type="button"
                >
                  <strong>없음</strong>
                  <small>미대상</small>
                </button>
              </div>
            </div>
          </>
        ) : selectedRound === 1 ? (
          <>
            <div className="button-grid three-col">
              {visibleDebuffs.map((debuff) => (
                <DebuffButton
                  debuff={debuff}
                  key={debuff}
                  onClick={onDebuffSelect}
                  selected={selectedDebuff === debuff}
                />
              ))}
            </div>
            <div
              className="segmented two-col duration-panel"
              aria-label="부여 당시 지속시간 선택"
            >
              {waveDurations.map((duration) => (
                <button
                  className={`segment time-choice ${selectedDuration === duration ? "active" : ""}`}
                  key={duration}
                  onClick={() => onDurationSelect(duration)}
                  type="button"
                >
                  <strong>{formatDurationLabel(duration)}</strong>
                  <small>{getWaveTimingLabel(duration)}</small>
                </button>
              ))}
            </div>
            <div className="auto-box">
              <p>마안 대상자는 공통 처리입니다. 징 여부만 확인하세요.</p>
            </div>
          </>
        ) : isRaidMode && selectedRound === 3 ? (
          <>
            <div className="auto-box">
              <p>물/번개 시간은 1차 입력 시간으로 자동 결정됩니다.</p>
            </div>
            {!raidRound1HasBomb ? (
              <div className="leader-row">
                <BombTile />
                <DurationButtons
                  ariaLabel="3차 리딩자 가속도폭탄 지속시간 선택"
                  onSelect={onDurationSelect}
                  options={waveDurations}
                  selected={selectedDuration}
                />
              </div>
            ) : null}
          </>
        ) : selectedRound === 3 ? (
          <>
            {round1WasBomb ? (
              <div className="button-grid two-col">
                {round3Debuffs.map((debuff) => (
                  <DebuffButton
                    debuff={debuff}
                    key={debuff}
                    onClick={onDebuffSelect}
                    selected={selectedDebuff === debuff}
                  />
                ))}
              </div>
            ) : round1WasWaterLightning ? (
              <div className="auto-box">
                <p>1차 물/번개 대상자는 3차 가속도폭탄 대상자입니다.</p>
              </div>
            ) : (
              <div className="auto-box">
                <p>1차 입력을 먼저 완료하면 3차 입력 방식이 결정됩니다.</p>
              </div>
            )}
            <div
              className="segmented two-col duration-panel"
              aria-label="3차 부여 당시 지속시간 선택"
            >
              {round3Durations.map((duration) => (
                <button
                  className={`segment time-choice ${selectedDuration === duration ? "active" : ""}`}
                  disabled={!round1WasBomb && !round1WasWaterLightning}
                  key={duration}
                  onClick={() => onDurationSelect(duration)}
                  type="button"
                >
                  <strong>{formatDurationLabel(duration)}</strong>
                  <small>{getWaveTimingLabel(duration)}</small>
                </button>
              ))}
            </div>
            <div className="auto-box">
              <p>마안 대상자는 공통 처리입니다. 징 여부만 확인하세요.</p>
            </div>
          </>
        ) : showAutoRound4 && suggestedRound4 ? (
          <div className="auto-box">
            <p>
              4차는 2차에 따라{" "}
              {debuffLabel(suggestedRound4.debuff, "ko")}{" "}
              처리로 자동 결정됩니다.
            </p>
          </div>
        ) : null}

        {selectedRound === 5 ? (
          <>
            <div className="button-grid">
              {woundDebuffs.map((debuff) => (
                <DebuffButton
                  debuff={debuff}
                  key={debuff}
                  onClick={onWoundSelect}
                  selected={selectedWound === debuff}
                />
              ))}
            </div>
            <div className="button-grid">
              {finalDebuffs.map((debuff) => (
                <DebuffButton
                  debuff={debuff}
                  key={debuff}
                  onClick={onFinalSelect}
                  selected={selectedFinal === debuff}
                />
              ))}
            </div>
          </>
        ) : selectedRound === 2 ? (
          <div className="button-grid">
            {visibleDebuffs.map((debuff) => (
              <DebuffButton
                debuff={debuff}
                key={debuff}
                onClick={onDebuffSelect}
                selected={selectedDebuff === debuff}
              />
            ))}
          </div>
        ) : null}

        {selectedRound === 5 && !canRegister ? (
          <p className="hint">1~4차 입력을 마치면 Assist를 시작할 수 있습니다.</p>
        ) : null}

        {selectedRound === 5 ? (
          <p className="hint">상처와 최종 디버프가 모두 선택되면 바로 시작됩니다.</p>
        ) : registrationMode === "confirm" ? (
          <button
            className="primary register-button"
            disabled={!canRegister}
            onClick={() => onRegister({ source: "manual" })}
            type="button"
          >
            <Check size={18} aria-hidden="true" />
            등록
          </button>
        ) : (
          <p className="hint">선택이 완료되면 다음 차수로 넘어갑니다.</p>
        )}
      </div>
    </section>
  );
}

export const Workspace = memo(WorkspaceImpl);
