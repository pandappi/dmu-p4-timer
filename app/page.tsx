"use client";

import {
  BellRing,
  Check,
  Clock3,
  RotateCcw,
  Settings,
  Siren,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Round = 1 | 2 | 3 | 4 | 5;

type DebuffName =
  | "Forked Lightning"
  | "Compressed Water"
  | "Cursed Shriek"
  | "Acceleration Bomb"
  | "Entropy"
  | "Dynamic Fluid"
  | "Black Wound"
  | "White Wound"
  | "Allagan Field"
  | "Beyond Death";

type DebuffEntry = {
  id: string;
  round: Round;
  debuff: DebuffName;
  duration: number | null;
  appliedAt: number;
  expiresAt: number | null;
  notify: boolean;
  source: "manual" | "auto";
  truthState: TruthState;
};

type TruthState = "truth" | "lie";

type TimerLog = {
  id: string;
  message: string;
};

type TimerSettings = {
  alertLeadSeconds: number;
  displayMode: "icon-label" | "icon-only";
  registrationMode: "confirm" | "instant";
};

type TimerState = {
  startedAt: number | null;
  entries: DebuffEntry[];
  selectedRound: Round;
  alertReady: boolean;
  firedAlerts: Record<string, true>;
  logs: TimerLog[];
  settings: TimerSettings;
};

const STORAGE_KEY = "dmu-p4-timer-state-v3";

const defaultSettings: TimerSettings = {
  alertLeadSeconds: 4,
  displayMode: "icon-only",
  registrationMode: "instant",
};

const roundLabels: Record<Round, string> = {
  1: "1차",
  2: "2차",
  3: "3차",
  4: "4차",
  5: "5차",
};

const debuffsByRound: Record<Exclude<Round, 5>, DebuffName[]> = {
  1: [
    "Forked Lightning",
    "Compressed Water",
    "Cursed Shriek",
    "Acceleration Bomb",
  ],
  2: ["Entropy", "Dynamic Fluid"],
  3: [
    "Forked Lightning",
    "Compressed Water",
    "Cursed Shriek",
    "Acceleration Bomb",
  ],
  4: ["Entropy", "Dynamic Fluid"],
};

const woundDebuffs = ["Black Wound", "White Wound"] as const;
const finalDebuffs = ["Allagan Field", "Beyond Death"] as const;

const truthLabels: Record<TruthState, string> = {
  truth: "진실",
  lie: "거짓",
};

const debuffMeta: Record<
  DebuffName,
  { short: string; color: string; icon: string }
> = {
  "Forked Lightning": {
    short: "Lightning",
    color: "#facc15",
    icon: "/debuffs/forked-lightning.png",
  },
  "Compressed Water": {
    short: "Water",
    color: "#38bdf8",
    icon: "/debuffs/compressed-water.png",
  },
  "Cursed Shriek": {
    short: "Shriek",
    color: "#f97316",
    icon: "/debuffs/cursed-shriek.png",
  },
  "Acceleration Bomb": {
    short: "Bomb",
    color: "#fb7185",
    icon: "/debuffs/acceleration-bomb.png",
  },
  Entropy: {
    short: "Entropy",
    color: "#ef4444",
    icon: "/debuffs/entropy.png",
  },
  "Dynamic Fluid": {
    short: "Fluid",
    color: "#2dd4bf",
    icon: "/debuffs/dynamic-fluid.png",
  },
  "Black Wound": {
    short: "Black",
    color: "#60a5fa",
    icon: "/debuffs/black-wound.png",
  },
  "White Wound": {
    short: "White",
    color: "#f9a8d4",
    icon: "/debuffs/white-wound.png",
  },
  "Allagan Field": {
    short: "Field",
    color: "#facc15",
    icon: "/debuffs/allagan-field.png",
  },
  "Beyond Death": {
    short: "Death",
    color: "#c084fc",
    icon: "/debuffs/beyond-death.png",
  },
};

const initialState: TimerState = {
  startedAt: null,
  entries: [],
  selectedRound: 1,
  alertReady: false,
  firedAlerts: {},
  logs: [],
  settings: defaultSettings,
};

function getDuration(
  round: Round,
  debuff: DebuffName,
  selectedDuration?: number,
) {
  if (round === 1) {
    if (debuff === "Cursed Shriek") return 60;
    return selectedDuration ?? null;
  }

  if (round === 2) {
    if (debuff === "Entropy") return 60;
    if (debuff === "Dynamic Fluid") return 84;
  }

  if (round === 3) {
    if (debuff === "Cursed Shriek") return 69;
    return selectedDuration ?? null;
  }

  if (round === 4) {
    if (debuff === "Entropy") return 45;
    if (debuff === "Dynamic Fluid") return 69;
  }

  if (round === 5) {
    if (debuff === "Allagan Field" || debuff === "Beyond Death") return 15;
    return null;
  }

  return null;
}

function inferRound3Duration(round1Duration: number) {
  if (round1Duration === 51) return 61;
  if (round1Duration === 76) return 36;
  return null;
}

function inferRound4(round2Debuff: DebuffName) {
  if (round2Debuff === "Entropy") {
    return { debuff: "Dynamic Fluid" as const, duration: 69 };
  }

  if (round2Debuff === "Dynamic Fluid") {
    return { debuff: "Entropy" as const, duration: 45 };
  }

  return null;
}

function getRound3Candidates(round1Debuff?: DebuffName) {
  if (round1Debuff === "Forked Lightning" || round1Debuff === "Compressed Water") {
    return ["Acceleration Bomb", "Cursed Shriek"] satisfies DebuffName[];
  }

  if (round1Debuff === "Acceleration Bomb" || round1Debuff === "Cursed Shriek") {
    return ["Forked Lightning", "Compressed Water"] satisfies DebuffName[];
  }

  return debuffsByRound[3];
}

function formatClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getNextRound(round: Round): Round {
  return Math.min(5, round + 1) as Round;
}

function createLog(message: string, startedAt: number | null): TimerLog {
  return {
    id: makeId(),
    message: `${formatClock((Date.now() - (startedAt ?? Date.now())) / 1000)} ${message}`,
  };
}

function normalizeNumber(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function DebuffButton({
  debuff,
  selected,
  displayMode,
  onClick,
}: {
  debuff: DebuffName;
  selected: boolean;
  displayMode: TimerSettings["displayMode"];
  onClick: () => void;
}) {
  const meta = debuffMeta[debuff];
  const iconOnly = displayMode === "icon-only";

  return (
    <button
      aria-label={debuff}
      className={`choice ${selected ? "selected" : ""} ${iconOnly ? "icon-only" : ""}`}
      onClick={onClick}
      style={{ color: meta.color }}
      type="button"
    >
      <img alt="" className="debuff-icon" src={meta.icon} />
      {iconOnly ? null : (
        <span className="choice-copy">
          <span className="name">{debuff}</span>
          <small>{meta.short}</small>
        </span>
      )}
      {selected ? <Check size={18} aria-hidden="true" /> : null}
    </button>
  );
}

export default function Home() {
  const [state, setState] = useState<TimerState>(initialState);
  const [now, setNow] = useState(Date.now());
  const [selectedDebuff, setSelectedDebuff] = useState<DebuffName | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedTruth, setSelectedTruth] = useState<TruthState | null>(null);
  const [selectedWound, setSelectedWound] = useState<(typeof woundDebuffs)[number] | null>(
    null,
  );
  const [selectedFinal, setSelectedFinal] = useState<(typeof finalDebuffs)[number] | null>(
    null,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<TimerState> & {
        logs?: Array<TimerLog | string>;
        settings?: Partial<TimerSettings>;
      };
      const logs =
        parsed.logs?.map((log) =>
          typeof log === "string" ? { id: makeId(), message: log } : log,
        ) ?? [];
      const settings = { ...defaultSettings, ...parsed.settings };

      setState({ ...initialState, ...parsed, logs, settings });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const playAlert = useCallback((strong = false) => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = audioContextRef.current ?? new AudioContextCtor();
    audioContextRef.current = context;
    void context.resume();

    const repeats = strong ? 3 : 1;
    const frequency = strong ? 1080 : 760;

    for (let index = 0; index < repeats; index += 1) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = context.currentTime + index * 0.18;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.12);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + 0.14);
    }

    if ("vibrate" in navigator) {
      navigator.vibrate(strong ? [180, 90, 180, 90, 180] : [120]);
    }
  }, []);

  const addLog = useCallback((message: string) => {
    setState((current) => ({
      ...current,
      logs: [createLog(message, current.startedAt), ...current.logs].slice(0, 8),
    }));
  }, []);

  const enableAlerts = useCallback(async () => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

    if (AudioContextCtor) {
      const context = audioContextRef.current ?? new AudioContextCtor();
      audioContextRef.current = context;
      await context.resume();
    }

    playAlert(false);
    setState((current) => ({ ...current, alertReady: true }));
    addLog("알림 테스트 완료");
  }, [addLog, playAlert]);

  const updateSettings = useCallback((settings: Partial<TimerSettings>) => {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        ...settings,
      },
    }));
  }, []);

  const entriesByRound = useMemo(() => {
    return state.entries.reduce<Record<Round, DebuffEntry[]>>(
      (acc, entry) => {
        acc[entry.round].push(entry);
        return acc;
      },
      { 1: [], 2: [], 3: [], 4: [], 5: [] },
    );
  }, [state.entries]);

  const round1ElementEntry = state.entries.find(
    (entry) =>
      entry.round === 1 &&
      (entry.debuff === "Forked Lightning" || entry.debuff === "Compressed Water"),
  );
  const round1Entry = state.entries.find((entry) => entry.round === 1);
  const round2Entry = state.entries.find((entry) => entry.round === 2);
  const visibleDebuffs =
    state.selectedRound === 3
      ? getRound3Candidates(round1Entry?.debuff)
      : state.selectedRound === 5
        ? []
        : debuffsByRound[state.selectedRound];

  const suggestedRound3Duration =
    state.selectedRound === 3 &&
    selectedDebuff &&
    (selectedDebuff === "Forked Lightning" || selectedDebuff === "Compressed Water") &&
    round1ElementEntry?.duration
      ? inferRound3Duration(round1ElementEntry.duration)
      : null;

  const suggestedRound4 = round2Entry ? inferRound4(round2Entry.debuff) : null;

  const activeEntries = useMemo(() => {
    return state.entries
      .filter((entry) => entry.notify && entry.expiresAt && entry.expiresAt > now)
      .sort((a, b) => (a.expiresAt ?? 0) - (b.expiresAt ?? 0));
  }, [now, state.entries]);

  const nextEntry = activeEntries[0];
  const elapsedSeconds = state.startedAt ? (now - state.startedAt) / 1000 : 0;

  useEffect(() => {
    if (!state.alertReady) return;

    state.entries.forEach((entry) => {
      if (!entry.notify || !entry.expiresAt) return;

      const leadSeconds = Math.max(0, state.settings.alertLeadSeconds);
      const alertAt = entry.expiresAt - leadSeconds * 1000;
      const key = `${entry.id}:lead:${leadSeconds}`;
      const shouldFire = now >= alertAt && now < alertAt + 1000;

      if (!shouldFire || state.firedAlerts[key]) return;

      playAlert(true);
      setState((current) => ({
        ...current,
        firedAlerts: { ...current.firedAlerts, [key]: true },
        logs: [
          createLog(`${entry.debuff} ${leadSeconds}초 전 알림`, current.startedAt),
          ...current.logs,
        ].slice(0, 8),
      }));
    });
  }, [
    now,
    playAlert,
    state.alertReady,
    state.entries,
    state.firedAlerts,
    state.settings.alertLeadSeconds,
  ]);

  useEffect(() => {
    setSelectedDebuff(null);
    setSelectedDuration(null);
    setSelectedTruth(null);
    setSelectedWound(null);
    setSelectedFinal(null);
  }, [state.selectedRound]);

  useEffect(() => {
    if (!selectedDebuff) {
      setSelectedDuration(null);
      return;
    }

    const duration = getDuration(state.selectedRound, selectedDebuff);
    setSelectedDuration(duration);
  }, [selectedDebuff, state.selectedRound]);

  const durationOptions = useMemo(() => {
    if (!selectedDebuff) return [];
    if (state.selectedRound === 1 && selectedDebuff !== "Cursed Shriek") return [51, 76];
    if (state.selectedRound === 3 && selectedDebuff !== "Cursed Shriek") return [36, 61];
    return [];
  }, [selectedDebuff, state.selectedRound]);

  const selectedEffectiveDuration = suggestedRound3Duration ?? selectedDuration;
  const canRegister =
    state.selectedRound === 5
      ? Boolean(selectedTruth && selectedWound && selectedFinal)
      : Boolean(selectedTruth && selectedDebuff) && selectedEffectiveDuration !== null;

  const buildEntry = useCallback(
    ({
      round,
      debuff,
      duration,
      appliedAt,
      source,
      truthState,
    }: {
      round: Round;
      debuff: DebuffName;
      duration: number | null;
      appliedAt: number;
      source: "manual" | "auto";
      truthState: TruthState;
    }): DebuffEntry => {
      const notify = duration !== null && debuff !== "Black Wound" && debuff !== "White Wound";
      return {
        id: makeId(),
        round,
        debuff,
        duration,
        appliedAt,
        expiresAt: notify && duration !== null ? appliedAt + duration * 1000 : null,
        notify,
        source,
        truthState,
      };
    },
    [],
  );

  const registerEntry = useCallback(
    ({
      debuff = selectedDebuff,
      duration = selectedEffectiveDuration,
      finalDebuff = selectedFinal,
      source = "manual",
      truthState = selectedTruth,
      wound = selectedWound,
    }: {
      debuff?: DebuffName | null;
      duration?: number | null;
      finalDebuff?: (typeof finalDebuffs)[number] | null;
      source?: "manual" | "auto";
      truthState?: TruthState | null;
      wound?: (typeof woundDebuffs)[number] | null;
    } = {}) => {
      const isRound5 = state.selectedRound === 5;
      const autoRound4 = state.selectedRound === 4 ? suggestedRound4 : null;
      const ready = isRound5
        ? Boolean(truthState && wound && finalDebuff)
        : Boolean(
            truthState &&
              ((debuff && duration !== null) ||
                (autoRound4 && autoRound4.duration !== null)),
          );
      if (!ready) return;

      const appliedAt = Date.now();

      if (isRound5) {
        if (!truthState || !wound || !finalDebuff) return;

        const woundEntry = buildEntry({
          round: 5,
          debuff: wound,
          duration: null,
          appliedAt,
          source: "manual",
          truthState,
        });
        const finalEntry = buildEntry({
          round: 5,
          debuff: finalDebuff,
          duration: 15,
          appliedAt,
          source: "manual",
          truthState,
        });

        setState((current) => {
          const nextEntries = [
            ...current.entries.filter((entry) => entry.round !== 5),
            woundEntry,
            finalEntry,
          ].sort((a, b) => a.round - b.round);

          return {
            ...current,
            startedAt: current.startedAt ?? Date.now(),
            entries: nextEntries,
            logs: [
              createLog(
                `5차 ${truthLabels[truthState]} ${wound} + ${finalDebuff} 등록`,
                current.startedAt,
              ),
              ...current.logs,
            ].slice(0, 8),
          };
        });
        setSelectedDebuff(null);
        setSelectedDuration(null);
        setSelectedTruth(null);
        setSelectedWound(null);
        setSelectedFinal(null);
        return;
      }

      const entryDebuff = autoRound4?.debuff ?? debuff;
      const entryDuration = autoRound4?.duration ?? duration;
      const entrySource = autoRound4 ? "auto" : source;

      if (!truthState || !entryDebuff || entryDuration === null) return;

      const nextEntry = buildEntry({
        round: state.selectedRound,
        debuff: entryDebuff,
        duration: entryDuration,
        appliedAt,
        source: entrySource,
        truthState,
      });

      setState((current) => {
        const withoutRound = current.entries.filter(
          (entry) => entry.round !== current.selectedRound || entry.debuff !== entryDebuff,
        );
        let nextEntries = [...withoutRound, nextEntry];

        if (current.selectedRound === 2) {
          const inferred = inferRound4(entryDebuff);
          if (inferred) {
            const autoEntry = buildEntry({
              round: 4,
              debuff: inferred.debuff,
              duration: inferred.duration,
              appliedAt,
              source: "auto",
              truthState,
            });
            nextEntries = nextEntries.filter((entry) => entry.round !== 4);
            nextEntries.push(autoEntry);
          }
        }

        return {
          ...current,
          startedAt: current.startedAt ?? Date.now(),
          entries: nextEntries.sort((a, b) => a.round - b.round),
          selectedRound: getNextRound(current.selectedRound),
          logs: [
            createLog(
              `${roundLabels[nextEntry.round]} ${truthLabels[truthState]} ${nextEntry.debuff} 등록`,
              current.startedAt,
            ),
            ...current.logs,
          ].slice(0, 8),
        };
      });
      setSelectedDebuff(null);
      setSelectedDuration(null);
      setSelectedTruth(null);
      setSelectedWound(null);
      setSelectedFinal(null);
    },
    [
      buildEntry,
      selectedDebuff,
      selectedEffectiveDuration,
      selectedFinal,
      selectedTruth,
      selectedWound,
      state.selectedRound,
      suggestedRound4,
    ],
  );

  const reset = useCallback(() => {
    setState({ ...initialState, settings: state.settings });
    setSelectedDebuff(null);
    setSelectedDuration(null);
    setSelectedTruth(null);
    setSelectedWound(null);
    setSelectedFinal(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, [state.settings]);

  const getReadyDuration = useCallback(
    (debuff: DebuffName, duration: number | null) => {
      const inferredDuration =
        state.selectedRound === 3 &&
        (debuff === "Forked Lightning" || debuff === "Compressed Water") &&
        round1ElementEntry?.duration
          ? inferRound3Duration(round1ElementEntry.duration)
          : null;

      return inferredDuration ?? duration ?? getDuration(state.selectedRound, debuff);
    },
    [round1ElementEntry?.duration, state.selectedRound],
  );

  const handleTruthSelect = useCallback(
    (truthState: TruthState) => {
      setSelectedTruth(truthState);
    },
    [],
  );

  const handleDebuffSelect = useCallback(
    (debuff: DebuffName) => {
      setSelectedDebuff(debuff);
    },
    [],
  );

  const handleDurationSelect = useCallback(
    (duration: number) => {
      setSelectedDuration(duration);
    },
    [],
  );

  const handleWoundSelect = useCallback(
    (wound: (typeof woundDebuffs)[number]) => {
      setSelectedWound(wound);
    },
    [],
  );

  const handleFinalSelect = useCallback(
    (finalDebuff: (typeof finalDebuffs)[number]) => {
      setSelectedFinal(finalDebuff);
    },
    [],
  );

  useEffect(() => {
    if (state.settings.registrationMode !== "instant") return;

    if (state.selectedRound === 5) {
      if (!selectedTruth || !selectedWound || !selectedFinal) return;
      registerEntry({
        finalDebuff: selectedFinal,
        truthState: selectedTruth,
        wound: selectedWound,
      });
      return;
    }

    if (state.selectedRound === 4) {
      if (!selectedTruth || !suggestedRound4) return;
      registerEntry({
        truthState: selectedTruth,
      });
      return;
    }

    if (!selectedTruth || !selectedDebuff) return;

    const duration = getReadyDuration(selectedDebuff, selectedDuration);
    if (duration === null) return;

    registerEntry({
      debuff: selectedDebuff,
      duration,
      source: suggestedRound3Duration ? "auto" : "manual",
      truthState: selectedTruth,
    });
  }, [
    getReadyDuration,
    registerEntry,
    selectedDebuff,
    selectedDuration,
    selectedFinal,
    selectedTruth,
    selectedWound,
    state.selectedRound,
    state.settings.registrationMode,
    suggestedRound3Duration,
    suggestedRound4,
  ]);

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="icon-tile">
            <Siren size={20} aria-hidden="true" />
          </div>
          <div>
            <h1>Dancing Mad Debuff Timer</h1>
            <p>{roundLabels[state.selectedRound]} 선택</p>
          </div>
        </div>
        <div className="elapsed">
          <span>경과</span>
          {formatClock(elapsedSeconds)}
        </div>
      </header>

      <section className="main compact-main">
        <section className="panel status-panel">
          <div className="next-debuff">
            <span>다음 알림</span>
            {nextEntry ? (
              <>
                <strong>
                  {formatClock(
                    ((nextEntry.expiresAt ?? now) -
                      state.settings.alertLeadSeconds * 1000 -
                      now) /
                      1000,
                  )}
                </strong>
                <span>
                  {roundLabels[nextEntry.round]} {nextEntry.debuff}
                </span>
              </>
            ) : (
              <>
                <strong>--:--</strong>
                <span>등록된 알림 없음</span>
              </>
            )}
          </div>
          <div className={state.alertReady ? "alert-ready ready" : "alert-ready"}>
            <BellRing size={16} aria-hidden="true" />
            {state.alertReady
              ? `${state.settings.alertLeadSeconds}초 전 알림`
              : "설정에서 알림 테스트"}
          </div>
        </section>

        <section className="round-strip" aria-label="차수 선택">
          {([1, 2, 3, 4, 5] as Round[]).map((round) => {
            const hasManual = entriesByRound[round].some((entry) => entry.source === "manual");
            const hasAuto = entriesByRound[round].some((entry) => entry.source === "auto");
            const className = [
              "round-tab",
              state.selectedRound === round ? "active" : "",
              hasManual ? "done" : "",
              hasAuto ? "auto" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                className={className}
                key={round}
                onClick={() => setState((current) => ({ ...current, selectedRound: round }))}
                type="button"
              >
                {roundLabels[round]}
              </button>
            );
          })}
        </section>

        <section className="panel workspace">
          <div className="panel-head">
            <h2>{roundLabels[state.selectedRound]} 디버프</h2>
            {state.selectedRound === 4 && suggestedRound4 ? (
              <Sparkles size={18} aria-hidden="true" />
            ) : null}
          </div>
          <div className="panel-body selector">
            <div className="truth-toggle" aria-label="진실 거짓 선택">
              <button
                className={`truth-button truth ${selectedTruth === "truth" ? "active" : ""}`}
                onClick={() => handleTruthSelect("truth")}
                type="button"
              >
                진실
              </button>
              <button
                className={`truth-button lie ${selectedTruth === "lie" ? "active" : ""}`}
                onClick={() => handleTruthSelect("lie")}
                type="button"
              >
                거짓
              </button>
            </div>

            {state.selectedRound === 4 && suggestedRound4 ? (
              <div className="auto-box">
                <p>
                  4차는 2차에 따라 {suggestedRound4.debuff} {suggestedRound4.duration}초로
                  자동 결정됩니다.
                </p>
              </div>
            ) : null}

            {state.selectedRound === 4 && suggestedRound4 ? null : state.selectedRound === 5 ? (
              <>
                <div className="group-label">Wound</div>
                <div className="button-grid">
                  {woundDebuffs.map((debuff) => (
                    <DebuffButton
                      debuff={debuff}
                      displayMode={state.settings.displayMode}
                      key={debuff}
                      onClick={() => handleWoundSelect(debuff)}
                      selected={selectedWound === debuff}
                    />
                  ))}
                </div>
                <div className="group-label">Final Debuff</div>
                <div className="button-grid">
                  {finalDebuffs.map((debuff) => (
                    <DebuffButton
                      debuff={debuff}
                      displayMode={state.settings.displayMode}
                      key={debuff}
                      onClick={() => handleFinalSelect(debuff)}
                      selected={selectedFinal === debuff}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="button-grid">
                {visibleDebuffs.map((debuff) => (
                  <DebuffButton
                    debuff={debuff}
                    displayMode={state.settings.displayMode}
                    key={debuff}
                    onClick={() => handleDebuffSelect(debuff)}
                    selected={selectedDebuff === debuff}
                  />
                ))}
              </div>
            )}

            {suggestedRound3Duration ? (
              <p className="hint">
                1차 {round1ElementEntry?.duration}초 기준, {suggestedRound3Duration}초 자동
              </p>
            ) : null}

            {durationOptions.length > 0 ? (
              <div className="segmented two-col" aria-label="지속시간 선택">
                {durationOptions.map((duration) => (
                  <button
                    className={`segment ${selectedDuration === duration ? "active" : ""}`}
                    key={duration}
                    onClick={() => handleDurationSelect(duration)}
                    type="button"
                  >
                    {duration}초
                  </button>
                ))}
              </div>
            ) : null}

            {state.settings.registrationMode === "confirm" ? (
              <button
                className="primary register-button"
                disabled={!canRegister}
                onClick={() =>
                  registerEntry({ source: suggestedRound3Duration ? "auto" : "manual" })
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

        <section className="panel compact-list">
          <div className="panel-head">
            <h3>등록됨</h3>
            <span>{state.entries.length}</span>
          </div>
          <div className="panel-body entry-list">
            {state.entries.length === 0 ? (
              <p className="hint">아직 등록된 디버프가 없습니다.</p>
            ) : (
              state.entries.map((entry) => {
                const remaining = entry.expiresAt ? (entry.expiresAt - now) / 1000 : null;
                return (
                  <div className="entry" key={entry.id}>
                    <img alt="" className="entry-icon" src={debuffMeta[entry.debuff].icon} />
                    <div>
                      <strong>{entry.debuff}</strong>
                      <small>
                        {roundLabels[entry.round]} · {truthLabels[entry.truthState]} ·{" "}
                        {entry.source === "auto" ? "자동" : "수동"}
                      </small>
                    </div>
                    <div className={entry.notify ? "entry-time" : "entry-time off"}>
                      {remaining !== null ? formatClock(remaining) : "기록"}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </section>

      <nav className="bottom-bar">
        <button className="secondary" onClick={() => setSettingsOpen(true)} type="button">
          <Settings size={18} aria-hidden="true" />
          설정
        </button>
        <button className="danger" onClick={reset} type="button">
          <RotateCcw size={18} aria-hidden="true" />
          초기화
        </button>
      </nav>

      {settingsOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section aria-label="설정" className="settings-popover" role="dialog">
            <div className="panel-head">
              <h2>설정</h2>
              <button className="icon-button" onClick={() => setSettingsOpen(false)} type="button">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="settings-body">
              <div className="setting-section">
                <span className="setting-label">보기 모드</span>
                <div className="segmented two-col" aria-label="디버프 보기 모드">
                  <button
                    className={`segment ${state.settings.displayMode === "icon-only" ? "active" : ""}`}
                    onClick={() => updateSettings({ displayMode: "icon-only" })}
                    type="button"
                  >
                    아이콘만
                  </button>
                  <button
                    className={`segment ${state.settings.displayMode === "icon-label" ? "active" : ""}`}
                    onClick={() => updateSettings({ displayMode: "icon-label" })}
                    type="button"
                  >
                    이름 같이
                  </button>
                </div>
              </div>
              <div className="setting-section">
                <span className="setting-label">등록 방식</span>
                <div className="segmented two-col" aria-label="디버프 등록 방식">
                  <button
                    className={`segment ${state.settings.registrationMode === "confirm" ? "active" : ""}`}
                    onClick={() => updateSettings({ registrationMode: "confirm" })}
                    type="button"
                  >
                    등록 버튼
                  </button>
                  <button
                    className={`segment ${state.settings.registrationMode === "instant" ? "active" : ""}`}
                    onClick={() => updateSettings({ registrationMode: "instant" })}
                    type="button"
                  >
                    선택 즉시
                  </button>
                </div>
                <p className="setting-help">
                  선택 즉시는 디버프와 시간이 모두 정해지는 순간 다음 차수로 넘어갑니다.
                </p>
              </div>
              <label className="number-field">
                <span>몇 초 전에 알림</span>
                <small>디버프 확인 후 아이콘을 누르기까지 걸리는 시간을 포함해, 만료보다 몇 초 빨리 소리낼지</small>
                <input
                  inputMode="numeric"
                  min={0}
                  onChange={(event) =>
                    updateSettings({
                      alertLeadSeconds: Math.max(
                        0,
                        normalizeNumber(Number(event.target.value), defaultSettings.alertLeadSeconds),
                      ),
                    })
                  }
                  type="number"
                  value={state.settings.alertLeadSeconds}
                />
              </label>
              <button className="primary" onClick={enableAlerts} type="button">
                <Volume2 size={18} aria-hidden="true" />
                알림 테스트
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
