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
import { OneLineSummary } from "./OneLineSummary";

export function TimerApp() {
  const timer = useDebuffTimer();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { language, theme } = timer.state.settings;
  const selectionComplete = timer.allRoundsComplete;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <main className="app">
      <TopBar
        language={language}
        onLanguageChange={(nextLanguage) =>
          timer.updateSettings({ language: nextLanguage })
        }
        selectedRound={timer.state.selectedRound}
      />

      <section className="main compact-main">
        {selectionComplete ? (
          <>
            {timer.state.settings.assistMode === "raid" ? (
              <OneLineSummary
                entries={timer.state.entries}
                language={language}
                partyChatCopy={timer.state.settings.partyChatCopy}
                partySoundCopy={timer.state.settings.partySoundCopy}
              />
            ) : null}
            <Timeline
              compact={timer.state.settings.assistMode === "raid"}
              entries={timer.state.entries}
              language={language}
              now={timer.now}
              showRound5FalseWarning={!timer.state.settings.fifthDebuffSkip}
            />
            <AoeGuide
              labelMode={timer.state.settings.aoeLabelMode}
              language={language}
            />
          </>
        ) : null}

        {selectionComplete ? null : (
          <>
            <RoundStrip
              selectedRound={timer.state.selectedRound}
              entriesByRound={timer.entriesByRound}
              fifthDebuffSkip={timer.state.settings.fifthDebuffSkip}
              language={language}
              onSelectRound={timer.setSelectedRound}
            />

            <Workspace
              selectedRound={timer.state.selectedRound}
              assistMode={timer.state.settings.assistMode}
              language={language}
              registrationMode={timer.state.settings.registrationMode}
              suggestedRound4={timer.suggestedRound4}
              round1Entry={timer.round1Entry}
              leaderRound1BombEntry={timer.leaderRound1BombEntry}
              visibleDebuffs={timer.visibleDebuffs}
              selectedTruth={timer.selectedTruth}
              selectedDebuff={timer.selectedDebuff}
              selectedDuration={timer.selectedDuration}
              selectedBombDuration={timer.selectedBombDuration}
              round2TruthPreselect={timer.state.settings.round2TruthPreselect}
              round2PresetTruth={timer.round2PresetTruth}
              selectedWound={timer.selectedWound}
              selectedFinal={timer.selectedFinal}
              canRegister={timer.canRegister}
              onTruthSelect={timer.handleTruthSelect}
              onDebuffSelect={timer.handleDebuffSelect}
              onDurationSelect={timer.handleDurationSelect}
              onBombDurationSelect={timer.handleBombDurationSelect}
              onRound2PresetTruthSelect={timer.handleRound2PresetTruthSelect}
              onWoundSelect={timer.handleWoundSelect}
              onFinalSelect={timer.handleFinalSelect}
              onRegister={timer.registerEntry}
            />
          </>
        )}

        <EntryList
          entries={timer.state.entries}
          language={language}
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
          {language === "ko" ? "설정" : "Settings"}
        </button>
        <button className="danger" onClick={timer.reset} type="button">
          <RotateCcw size={18} aria-hidden="true" />
          {language === "ko" ? "초기화" : "Reset"}
        </button>
      </nav>

      {settingsOpen ? (
        <SettingsModal
          settings={timer.state.settings}
          language={language}
          onClose={() => setSettingsOpen(false)}
          onUpdate={timer.updateSettings}
          onTestAlert={timer.enableAlerts}
        />
      ) : null}
    </main>
  );
}
