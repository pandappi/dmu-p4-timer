import { Check } from "lucide-react";
import { memo } from "react";

import {
  debuffMeta,
  finalDebuffs,
  woundDebuffs,
} from "../lib/constants";
import {
  ASSIGNMENT_DURATIONS,
  isAccelerationBomb,
  isWaterLightning,
} from "../lib/actions";
import {
  debuffDisplayName,
  roundLabel,
  text,
  truthLabel,
  waveTimingLabel,
} from "../lib/i18n";
import { inferRound4 } from "../lib/rules";
import type {
  AssistMode,
  DebuffEntry,
  DebuffName,
  Language,
  Round,
  TimerSettings,
  TruthState,
} from "../lib/types";
import { formatDurationLabel } from "../lib/utils";
import { DebuffButton } from "./DebuffButton";

type WorkspaceProps = {
  selectedRound: Round;
  assistMode: AssistMode;
  language: Language;
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

const round3WaveDurations = [
  ASSIGNMENT_DURATIONS.round3FastWave,
  ASSIGNMENT_DURATIONS.round3SlowWave,
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

function AutoDebuffTile({
  debuff,
  language,
}: {
  debuff: DebuffName;
  language: Language;
}) {
  const meta = debuffMeta[debuff];

  return (
    <div
      aria-label={`${debuffDisplayName(language, debuff)} ${text(language, "auto")}`}
      className="choice icon-only selected auto-choice"
      style={{ color: meta.color }}
    >
      <img alt="" className="debuff-icon" src={meta.icon} />
    </div>
  );
}

function DisabledDuration({
  duration,
  language,
}: {
  duration: number | null | undefined;
  language: Language;
}) {
  if (!duration) return null;
  const timingLabel = waveTimingLabel(language, duration);

  return (
    <div
      className="segment time-choice auto-segment active"
      aria-label={text(language, "round4AutoDuration")}
    >
      <strong>{formatDurationLabel(duration, language)}</strong>
      <small>{timingLabel === "미정" || timingLabel === "TBD" ? text(language, "auto") : timingLabel}</small>
    </div>
  );
}

function AutoDebuffRow({
  debuff,
  duration,
  language,
  message,
}: {
  debuff: DebuffName;
  duration?: number | null;
  language: Language;
  message: string;
}) {
  return (
    <>
      <div className="auto-debuff-row">
        <AutoDebuffTile debuff={debuff} language={language} />
        <div className="auto-box compact">
          <p>{message}</p>
        </div>
      </div>
      {duration ? (
        <DisabledDuration duration={duration} language={language} />
      ) : null}
    </>
  );
}

function AutoWaveRow({
  duration,
  language,
  message,
}: {
  duration: number | null;
  language: Language;
  message: string;
}) {
  return (
    <>
      <div className="leader-row auto-row">
        <WavePairTile />
        <DisabledDuration duration={duration} language={language} />
      </div>
      <div className="auto-box compact">
        <p>{message}</p>
      </div>
    </>
  );
}

function DurationButtons({
  ariaLabel,
  language,
  options,
  selected,
  onSelect,
}: {
  ariaLabel: string;
  language: Language;
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
          <strong>{formatDurationLabel(duration, language)}</strong>
          <small>{waveTimingLabel(language, duration)}</small>
        </button>
      ))}
    </div>
  );
}

function WorkspaceImpl({
  selectedRound,
  assistMode,
  language,
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
  const round3Durations =
    round1WasWaterLightning || round1WasBomb ? round3WaveDurations : [];
  const raidRound3AutoDuration = isRaidMode
    ? round1Entry?.duration === ASSIGNMENT_DURATIONS.round1FastWave
      ? ASSIGNMENT_DURATIONS.round3SlowWave
      : round1Entry?.duration === ASSIGNMENT_DURATIONS.round1SlowWave
        ? ASSIGNMENT_DURATIONS.round3FastWave
        : null
    : null;
  const round4AutoMessage =
    suggestedRound4 && language === "ko"
      ? `4차는 2차에 따라 ${debuffDisplayName(
          language,
          suggestedRound4.debuff,
        )} 처리로 자동 결정됩니다.`
      : suggestedRound4
        ? `Round 4 is auto-decided from Round 2 as ${debuffDisplayName(
            language,
            suggestedRound4.debuff,
          )}.`
        : "";

  return (
    <section className="panel workspace" id="workspace-panel">
      <div className="panel-head">
        <h2>
          {roundLabel(language, selectedRound)} {text(language, "debuff")}
        </h2>
      </div>
      <div className="panel-body selector">
        {showTruthToggle ? (
          <div className="truth-toggle" aria-label={text(language, "truthChoice")}>
            <button
              className={`truth-button truth ${selectedTruth === "truth" ? "active" : ""}`}
              onClick={() => onTruthSelect("truth")}
              type="button"
            >
              {truthLabel(language, "truth")}
            </button>
            <button
              className={`truth-button lie ${selectedTruth === "lie" ? "active" : ""}`}
              onClick={() => onTruthSelect("lie")}
              type="button"
            >
              {truthLabel(language, "lie")}
            </button>
          </div>
        ) : null}

        {isRaidMode && selectedRound === 1 ? (
          <>
            <div className="leader-row">
              <WavePairTile />
              <DurationButtons
                ariaLabel={text(language, "round1WaveDuration")}
                language={language}
                onSelect={onDurationSelect}
                options={waveDurations}
                selected={selectedDuration}
              />
            </div>
            <div className="leader-row">
              <BombTile />
              <div
                className="segmented three-col duration-panel"
                aria-label={text(language, "raidBombChoice")}
              >
                {waveDurations.map((duration) => (
                  <button
                    className={`segment time-choice ${selectedBombDuration === duration ? "active" : ""}`}
                    key={duration}
                    onClick={() => onBombDurationSelect(duration)}
                    type="button"
                  >
                    <strong>{formatDurationLabel(duration, language)}</strong>
                    <small>{waveTimingLabel(language, duration)}</small>
                  </button>
                ))}
                <button
                  className={`segment time-choice ${selectedBombDuration === "none" ? "active" : ""}`}
                  onClick={() => onBombDurationSelect("none")}
                  type="button"
                >
                  <strong>{text(language, "none")}</strong>
                  <small>{text(language, "notTarget")}</small>
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
              aria-label={text(language, "assignmentDuration")}
            >
              {waveDurations.map((duration) => (
                <button
                  className={`segment time-choice ${selectedDuration === duration ? "active" : ""}`}
                  key={duration}
                  onClick={() => onDurationSelect(duration)}
                  type="button"
                >
                  <strong>{formatDurationLabel(duration, language)}</strong>
                  <small>{waveTimingLabel(language, duration)}</small>
                </button>
              ))}
            </div>
            <div className="auto-box">
              <p>{text(language, "eyeCommon")}</p>
            </div>
          </>
        ) : isRaidMode && selectedRound === 3 ? (
          <>
            <AutoWaveRow
              duration={raidRound3AutoDuration}
              language={language}
              message={text(language, "round3WaveAuto")}
            />
            {!raidRound1HasBomb ? (
              <div className="leader-row">
                <BombTile />
                <DurationButtons
                  ariaLabel={text(language, "round3RaidBombDuration")}
                  language={language}
                  onSelect={onDurationSelect}
                  options={round3WaveDurations}
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
              <AutoDebuffRow
                debuff="Acceleration Bomb"
                language={language}
                message={text(language, "round3BombAuto")}
              />
            ) : (
              <div className="auto-box">
                <p>{text(language, "round3NeedRound1")}</p>
              </div>
            )}
            <div
              className="segmented two-col duration-panel"
              aria-label={text(language, "round3AssignmentDuration")}
            >
              {round3Durations.map((duration) => (
                <button
                  className={`segment time-choice ${selectedDuration === duration ? "active" : ""}`}
                  disabled={!round1WasBomb && !round1WasWaterLightning}
                  key={duration}
                  onClick={() => onDurationSelect(duration)}
                  type="button"
                >
                  <strong>{formatDurationLabel(duration, language)}</strong>
                  <small>{waveTimingLabel(language, duration)}</small>
                </button>
              ))}
            </div>
            <div className="auto-box">
              <p>{text(language, "eyeCommon")}</p>
            </div>
          </>
        ) : showAutoRound4 && suggestedRound4 ? (
          <AutoDebuffRow
            debuff={suggestedRound4.debuff}
            language={language}
            message={round4AutoMessage}
          />
        ) : null}

        {selectedRound === 5 ? (
          <>
            <div className="auto-box compact">
              <p>{text(language, "round5Same")}</p>
            </div>
            <div className="auto-box compact caution-box">
              <p>{text(language, "round5FalseCheck")}</p>
            </div>
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

        {selectedRound === 5 ? null : registrationMode === "confirm" ? (
          <button
            className="primary register-button"
            disabled={!canRegister}
            onClick={() => onRegister({ source: "manual" })}
            type="button"
          >
            <Check size={18} aria-hidden="true" />
            {text(language, "register")}
          </button>
        ) : (
          <p className="hint">{text(language, "completeHint")}</p>
        )}
      </div>
    </section>
  );
}

export const Workspace = memo(WorkspaceImpl);
