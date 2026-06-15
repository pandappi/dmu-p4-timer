import { Check, Sparkles } from "lucide-react";
import { memo } from "react";

import {
  finalDebuffs,
  roundLabels,
  woundDebuffs,
} from "../lib/constants";
import { debuffLabel } from "../lib/actions";
import { inferRound4 } from "../lib/rules";
import type {
  DebuffEntry,
  DebuffName,
  Round,
  TimerSettings,
  TruthState,
} from "../lib/types";
import { formatDurationLabel } from "../lib/utils";
import { DebuffButton } from "./DebuffButton";
import { DurationSelector } from "./DurationSelector";

type WorkspaceProps = {
  selectedRound: Round;
  displayMode: TimerSettings["displayMode"];
  registrationMode: TimerSettings["registrationMode"];
  durationMode: TimerSettings["durationMode"];
  nameLanguage: TimerSettings["nameLanguage"];
  suggestedRound4: ReturnType<typeof inferRound4>;
  suggestedRound3Duration: number | null;
  round1ElementEntry: DebuffEntry | undefined;
  visibleDebuffs: DebuffName[];
  selectedTruth: TruthState | null;
  selectedDebuff: DebuffName | null;
  selectedDuration: number | null;
  selectedWound: DebuffName | null;
  selectedFinal: DebuffName | null;
  canRegister: boolean;
  onTruthSelect: (truth: TruthState) => void;
  onDebuffSelect: (debuff: DebuffName) => void;
  onDebuffWithDuration: (debuff: DebuffName, duration: number) => void;
  onDurationSelect: (duration: number) => void;
  onWoundSelect: (debuff: DebuffName) => void;
  onFinalSelect: (debuff: DebuffName) => void;
  onRegister: (options: { source: "manual" | "auto" }) => void;
};

function WorkspaceImpl({
  selectedRound,
  displayMode,
  registrationMode,
  durationMode,
  nameLanguage,
  suggestedRound4,
  suggestedRound3Duration,
  round1ElementEntry,
  visibleDebuffs,
  selectedTruth,
  selectedDebuff,
  selectedDuration,
  selectedWound,
  selectedFinal,
  canRegister,
  onTruthSelect,
  onDebuffSelect,
  onDebuffWithDuration,
  onDurationSelect,
  onWoundSelect,
  onFinalSelect,
  onRegister,
}: WorkspaceProps) {
  const showAutoRound4 = selectedRound === 4 && Boolean(suggestedRound4);
  const isTimeRound = selectedRound === 1 || selectedRound === 3;
  const roundDurationOptions =
    selectedRound === 1 ? [51, 76] : selectedRound === 3 ? [36, 61] : [];

  return (
    <section className="panel workspace" id="workspace-panel">
      <div className="panel-head">
        <h2>{roundLabels[selectedRound]} 디버프</h2>
        {showAutoRound4 ? <Sparkles size={18} aria-hidden="true" /> : null}
      </div>
      <div className="panel-body selector">
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

        {showAutoRound4 && suggestedRound4 ? (
          <div className="auto-box">
            <p>
              4차는 2차에 따라{" "}
              {debuffLabel(suggestedRound4.debuff, nameLanguage)}{" "}
              {formatDurationLabel(suggestedRound4.duration)}로 자동 결정됩니다.
            </p>
          </div>
        ) : null}

        {showAutoRound4 ? null : selectedRound === 5 ? (
          <>
            <div className="group-label">Wound</div>
            <div className="button-grid">
              {woundDebuffs.map((debuff) => (
                <DebuffButton
                  debuff={debuff}
                  displayMode={displayMode}
                  key={debuff}
                  nameLanguage={nameLanguage}
                  onClick={onWoundSelect}
                  selected={selectedWound === debuff}
                />
              ))}
            </div>
            <div className="group-label">Final Debuff</div>
            <div className="button-grid">
              {finalDebuffs.map((debuff) => (
                <DebuffButton
                  debuff={debuff}
                  displayMode={displayMode}
                  key={debuff}
                  nameLanguage={nameLanguage}
                  onClick={onFinalSelect}
                  selected={selectedFinal === debuff}
                />
              ))}
            </div>
          </>
        ) : isTimeRound ? (
          <DurationSelector
            debuffs={visibleDebuffs}
            displayMode={displayMode}
            mode={durationMode}
            nameLanguage={nameLanguage}
            onDebuffSelect={onDebuffSelect}
            onDebuffWithDuration={onDebuffWithDuration}
            onDurationSelect={onDurationSelect}
            options={roundDurationOptions}
            selectedDebuff={selectedDebuff}
            selectedDuration={selectedDuration}
          />
        ) : (
          <div className="button-grid">
            {visibleDebuffs.map((debuff) => (
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
        )}

        {suggestedRound3Duration ? (
          <p className="hint">
            1차 {round1ElementEntry?.duration}초 기준,{" "}
            {formatDurationLabel(suggestedRound3Duration)} 자동
          </p>
        ) : null}

        {registrationMode === "confirm" ? (
          <button
            className="primary register-button"
            disabled={!canRegister}
            onClick={() =>
              onRegister({ source: suggestedRound3Duration ? "auto" : "manual" })
            }
            type="button"
          >
            <Check size={18} aria-hidden="true" />
            등록
          </button>
        ) : (
          <p className="hint">선택이 완료되면 바로 등록됩니다.</p>
        )}
      </div>
    </section>
  );
}

export const Workspace = memo(WorkspaceImpl);
