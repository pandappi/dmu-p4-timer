"use client";

import { RotateCcw, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useDebuffTimer } from "../hooks/useDebuffTimer";
import { EntryList } from "./EntryList";
import { RoundStrip } from "./RoundStrip";
import { SettingsModal } from "./SettingsModal";
import { StatusPanel } from "./StatusPanel";
import { Timeline } from "./Timeline";
import { TopBar } from "./TopBar";
import { Workspace } from "./Workspace";

export function TimerApp() {
  const timer = useDebuffTimer();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme } = timer.state.settings;
  const { selectedRound } = timer.state;
  const { allRoundsComplete } = timer;
  const didMountRef = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // 차수가 바뀌면(자동 진행 포함) 디버프 선택 화면이 바로 보이도록 스크롤.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    document
      .getElementById("workspace-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedRound]);

  // 5차까지 모두 완료되면 처리 순서 타임라인으로 스크롤.
  useEffect(() => {
    if (!allRoundsComplete) return;
    document
      .getElementById("timeline-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [allRoundsComplete]);

  return (
    <main className="app">
      <TopBar
        selectedRound={timer.state.selectedRound}
        elapsedSeconds={timer.elapsedSeconds}
      />

      <section className="main compact-main">
        <StatusPanel
          nextEntry={timer.nextEntry}
          nextAction={timer.nextAction}
          now={timer.now}
          alertReady={timer.state.alertReady}
          alertLeadSeconds={timer.state.settings.alertLeadSeconds}
          nameLanguage={timer.state.settings.nameLanguage}
        />

        {timer.allRoundsComplete ? (
          <Timeline
            entries={timer.state.entries}
            now={timer.now}
            nameLanguage={timer.state.settings.nameLanguage}
          />
        ) : null}

        <RoundStrip
          selectedRound={timer.state.selectedRound}
          entriesByRound={timer.entriesByRound}
          onSelectRound={timer.setSelectedRound}
        />

        <Workspace
          selectedRound={timer.state.selectedRound}
          displayMode={timer.state.settings.displayMode}
          registrationMode={timer.state.settings.registrationMode}
          durationMode={timer.state.settings.durationMode}
          nameLanguage={timer.state.settings.nameLanguage}
          suggestedRound4={timer.suggestedRound4}
          suggestedRound3Duration={timer.suggestedRound3Duration}
          round1ElementEntry={timer.round1ElementEntry}
          visibleDebuffs={timer.visibleDebuffs}
          selectedTruth={timer.selectedTruth}
          selectedDebuff={timer.selectedDebuff}
          selectedDuration={timer.selectedDuration}
          selectedWound={timer.selectedWound}
          selectedFinal={timer.selectedFinal}
          canRegister={timer.canRegister}
          onTruthSelect={timer.handleTruthSelect}
          onDebuffSelect={timer.handleDebuffSelect}
          onDebuffWithDuration={timer.handleDebuffWithDuration}
          onDurationSelect={timer.handleDurationSelect}
          onWoundSelect={timer.handleWoundSelect}
          onFinalSelect={timer.handleFinalSelect}
          onRegister={timer.registerEntry}
        />

        <EntryList
          entries={timer.state.entries}
          now={timer.now}
          nameLanguage={timer.state.settings.nameLanguage}
        />
      </section>

      <nav className="bottom-bar">
        <button
          className="secondary"
          onClick={() => setSettingsOpen(true)}
          type="button"
        >
          <Settings size={18} aria-hidden="true" />
          설정
        </button>
        <button className="danger" onClick={timer.reset} type="button">
          <RotateCcw size={18} aria-hidden="true" />
          초기화
        </button>
      </nav>

      {settingsOpen ? (
        <SettingsModal
          settings={timer.state.settings}
          onClose={() => setSettingsOpen(false)}
          onUpdate={timer.updateSettings}
          onTestAlert={timer.enableAlerts}
        />
      ) : null}
    </main>
  );
}
