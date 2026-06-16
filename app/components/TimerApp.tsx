"use client";

import { RotateCcw, Settings } from "lucide-react";
import { useEffect, useState } from "react";

import { useDebuffTimer } from "../hooks/useDebuffTimer";
import { EntryList } from "./EntryList";
import { RoundStrip } from "./RoundStrip";
import { SettingsModal } from "./SettingsModal";
import { Timeline } from "./Timeline";
import { TopBar } from "./TopBar";
import { Workspace } from "./Workspace";
import { AoeGuide } from "./AoeGuide";

export function TimerApp() {
  const timer = useDebuffTimer();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme } = timer.state.settings;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <main className="app">
      <TopBar
        selectedRound={timer.state.selectedRound}
      />

      <section className="main compact-main">
        {timer.allRoundsComplete ? (
          <>
            <Timeline entries={timer.state.entries} now={timer.now} />
            <AoeGuide labelMode={timer.state.settings.aoeLabelMode} />
          </>
        ) : null}

        <RoundStrip
          selectedRound={timer.state.selectedRound}
          entriesByRound={timer.entriesByRound}
          onSelectRound={timer.setSelectedRound}
        />

        <Workspace
          selectedRound={timer.state.selectedRound}
          assistMode={timer.state.settings.assistMode}
          registrationMode={timer.state.settings.registrationMode}
          suggestedRound4={timer.suggestedRound4}
          round1Entry={timer.round1Entry}
          leaderRound1BombEntry={timer.leaderRound1BombEntry}
          visibleDebuffs={timer.visibleDebuffs}
          selectedTruth={timer.selectedTruth}
          selectedDebuff={timer.selectedDebuff}
          selectedDuration={timer.selectedDuration}
          selectedBombDuration={timer.selectedBombDuration}
          selectedWound={timer.selectedWound}
          selectedFinal={timer.selectedFinal}
          canRegister={timer.canRegister}
          onTruthSelect={timer.handleTruthSelect}
          onDebuffSelect={timer.handleDebuffSelect}
          onDurationSelect={timer.handleDurationSelect}
          onBombDurationSelect={timer.handleBombDurationSelect}
          onWoundSelect={timer.handleWoundSelect}
          onFinalSelect={timer.handleFinalSelect}
          onRegister={timer.registerEntry}
        />

        <EntryList
          entries={timer.state.entries}
          now={timer.now}
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
