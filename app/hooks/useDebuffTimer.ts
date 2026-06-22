"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  debuffsByRound,
  type FinalDebuff,
  finalDebuffs,
  type WoundDebuff,
  woundDebuffs,
  initialState,
} from "../lib/constants";
import { actionDisplayText, roundLabel, truthLabel } from "../lib/i18n";
import {
  getDuration,
  getNextRound,
  inferRound3Duration,
  inferRound4,
} from "../lib/rules";
import {
  getActionText,
  getEntryActionText,
  getFinalActionText,
  getWavePairActionText,
  getWaveTimelineSeconds,
  isAccelerationBomb,
  isWaterLightning,
  TIMELINE_SECONDS,
} from "../lib/actions";
import { loadState, saveState } from "../lib/storage";
import type {
  DebuffEntry,
  DebuffName,
  Round,
  TimerSettings,
  TimerState,
  TruthState,
} from "../lib/types";
import { createLog, makeId } from "../lib/utils";
import { useAlertSound } from "./useAlertSound";
import { useNow } from "./useNow";

type TimelineProfile = {
  fastWave: number;
  round1Eye: number;
  entropy: number;
  slowWave: number;
  round3Eye: number;
  dynamicFluid: number;
};

const FOURTH_INPUT_TIMELINE: Record<"Entropy" | "Dynamic Fluid", TimelineProfile> = {
  Entropy: {
    fastWave: 29.15,
    round1Eye: 38.15,
    entropy: 45,
    slowWave: 54.1,
    round3Eye: 62.05,
    dynamicFluid: 67.8,
  },
  "Dynamic Fluid": {
    fastWave: 30.25,
    round1Eye: 39.3,
    entropy: 46.15,
    slowWave: 55.25,
    round3Eye: 63.25,
    dynamicFluid: 69,
  },
};

function getFourthInputTimelineProfile(round4Debuff: DebuffName): TimelineProfile {
  return round4Debuff === "Dynamic Fluid"
    ? FOURTH_INPUT_TIMELINE["Dynamic Fluid"]
    : FOURTH_INPUT_TIMELINE.Entropy;
}

function getTimelineSecondsForWave(
  duration: number | null,
  profile: TimelineProfile | null,
) {
  if (!profile) return getWaveTimelineSeconds(duration);
  const defaultSeconds = getWaveTimelineSeconds(duration);
  if (defaultSeconds === TIMELINE_SECONDS.fastWave) return profile.fastWave;
  if (defaultSeconds === TIMELINE_SECONDS.slowWave) return profile.slowWave;
  return null;
}

export function useDebuffTimer() {
  const [state, setState] = useState<TimerState>(initialState);
  const now = useNow();
  const [selectedDebuff, setSelectedDebuff] = useState<DebuffName | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedBombDuration, setSelectedBombDuration] = useState<
    number | "none" | null
  >(null);
  const [selectedTruth, setSelectedTruth] = useState<TruthState | null>(null);
  const [round2PresetTruth, setRound2PresetTruth] =
    useState<TruthState | null>(null);
  const [selectedWound, setSelectedWound] = useState<WoundDebuff | null>(null);
  const [selectedFinal, setSelectedFinal] = useState<FinalDebuff | null>(null);

  const { speak, vibrate, unlock } = useAlertSound();

  useEffect(() => {
    const saved = loadState();
    if (saved) setState(saved);
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addLog = useCallback((message: string) => {
    setState((current) => ({
      ...current,
      logs: [createLog(message, current.startedAt), ...current.logs].slice(0, 8),
    }));
  }, []);

  const enableAlerts = useCallback(async () => {
    await unlock();
    if (state.settings.alertSound === "tts") {
      speak(
        state.settings.language === "ko" ? "테스트" : "Test",
        state.settings.ttsVolume,
        state.settings.language,
      );
    }
    if (state.settings.vibrationEnabled) vibrate(false);
    setState((current) => ({ ...current, alertReady: true }));
    addLog("알림 테스트 완료");
  }, [
    addLog,
    speak,
    state.settings.alertSound,
    state.settings.language,
    state.settings.ttsVolume,
    state.settings.vibrationEnabled,
    unlock,
    vibrate,
  ]);

  const updateSettings = useCallback((settings: Partial<TimerSettings>) => {
    setState((current) => ({
      ...current,
      startedAt:
        (settings.assistMode &&
          settings.assistMode !== current.settings.assistMode) ||
        (settings.fifthDebuffSkip !== undefined &&
          settings.fifthDebuffSkip !== current.settings.fifthDebuffSkip)
          ? null
          : current.startedAt,
      entries:
        (settings.assistMode &&
          settings.assistMode !== current.settings.assistMode) ||
        (settings.fifthDebuffSkip !== undefined &&
          settings.fifthDebuffSkip !== current.settings.fifthDebuffSkip)
          ? []
          : current.entries,
      selectedRound:
        (settings.assistMode &&
          settings.assistMode !== current.settings.assistMode) ||
        (settings.fifthDebuffSkip !== undefined &&
          settings.fifthDebuffSkip !== current.settings.fifthDebuffSkip)
          ? 1
          : current.selectedRound,
      firedAlerts:
        (settings.assistMode &&
          settings.assistMode !== current.settings.assistMode) ||
        (settings.fifthDebuffSkip !== undefined &&
          settings.fifthDebuffSkip !== current.settings.fifthDebuffSkip)
          ? {}
          : current.firedAlerts,
      settings: {
        ...current.settings,
        ...settings,
      },
    }));
  }, []);

  const setSelectedRound = useCallback((round: Round) => {
    setState((current) => ({ ...current, selectedRound: round }));
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

  const round1Entry = state.entries.find(
    (entry) => entry.kind === "input" && entry.round === 1,
  );
  const leaderRound1BombEntry = state.entries.find(
    (entry) =>
      entry.kind === "input" &&
      entry.round === 1 &&
      entry.debuff === "Acceleration Bomb",
  );
  const round2Entry = state.entries.find(
    (entry) => entry.kind === "input" && entry.round === 2,
  );
  const round3Entry = state.entries.find(
    (entry) => entry.kind === "input" && entry.round === 3,
  );
  const round4Entry = state.entries.find(
    (entry) => entry.kind === "input" && entry.round === 4,
  );
  const round5WoundEntry = state.entries.find(
    (entry) =>
      entry.kind === "input" &&
      entry.round === 5 &&
      (entry.debuff === "Black Wound" || entry.debuff === "White Wound"),
  );
  const round5FinalEntry = state.entries.find(
    (entry) =>
      entry.kind === "input" &&
      entry.round === 5 &&
      (entry.debuff === "Allagan Field" || entry.debuff === "Beyond Death"),
  );
  const visibleDebuffs =
    state.selectedRound === 1 || state.selectedRound === 2
      ? debuffsByRound[state.selectedRound]
      : [];
  const suggestedRound4 = round2Entry ? inferRound4(round2Entry.debuff) : null;
  const round1WasBomb = isAccelerationBomb(round1Entry?.debuff);
  const round1WasWaterLightning = isWaterLightning(round1Entry?.debuff);
  const isRaidMode = state.settings.assistMode === "raid";

  const activeEntries = useMemo(() => {
    return state.entries
      .filter((entry) => entry.notify && entry.expiresAt && entry.expiresAt > now)
      .sort((a, b) => (a.expiresAt ?? 0) - (b.expiresAt ?? 0));
  }, [now, state.entries]);

  const nextEntry = activeEntries[0];
  const nextAction = nextEntry
    ? getEntryActionText(nextEntry, state.entries)
    : null;
  const elapsedSeconds = state.startedAt ? (now - state.startedAt) / 1000 : 0;

  const allRoundsComplete = useMemo(
    () =>
      (state.settings.fifthDebuffSkip
        ? ([1, 2, 3, 4] as Round[])
        : ([1, 2, 3, 4, 5] as Round[])
      ).every(
        (round) =>
          round === 5
            ? Boolean(round5WoundEntry && round5FinalEntry)
            : entriesByRound[round].some((entry) => entry.kind === "input"),
      ),
    [
      entriesByRound,
      round5FinalEntry,
      round5WoundEntry,
      state.settings.fifthDebuffSkip,
    ],
  );

  useEffect(() => {
    if (!state.alertReady) return;

    const leadSeconds = Math.min(
      15,
      Math.max(-10, state.settings.alertLeadSeconds),
    );

    // 이번 tick에 알림 조건을 만족하는 항목을 모은다.
    const firing = state.entries
      .map((entry) => {
        if (!entry.notify || !entry.expiresAt) return null;
        const alertAt = entry.expiresAt - leadSeconds * 1000;
        const key = `${entry.id}:lead:${leadSeconds}`;
        const shouldFire = now >= alertAt && now < alertAt + 1000;
        if (!shouldFire || state.firedAlerts[key]) return null;
        return { entry, key, action: getEntryActionText(entry, state.entries) };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (firing.length === 0) return;

    // 가속도폭탄은 우선도가 낮다 → 같은 시점에 겹친 알림 중 맨 뒤에 읽는다.
    const order = [...firing].sort((a, b) => {
      const aBomb = isAccelerationBomb(a.entry.debuff) ? 1 : 0;
      const bBomb = isAccelerationBomb(b.entry.debuff) ? 1 : 0;
      if (aBomb !== bBomb) return aBomb - bBomb;
      return (a.entry.expiresAt ?? 0) - (b.entry.expiresAt ?? 0);
    });

    if (state.settings.alertSound === "tts") {
      let spokenCount = 0;
      for (const item of order) {
        if (!item.action) continue;
        const phrase =
          actionDisplayText(state.settings.language, item.action) ??
          item.action;
        // 첫 음성만 기존 큐를 끊고, 이후(낮은 우선도)는 이어서 재생되도록 큐잉.
        speak(
          phrase,
          state.settings.ttsVolume,
          state.settings.language,
          spokenCount > 0,
        );
        spokenCount += 1;
      }
    }
    if (state.settings.vibrationEnabled) vibrate(true);

    setState((current) => {
      const firedAlerts = { ...current.firedAlerts };
      let logs = current.logs;
      for (const item of order) {
        firedAlerts[item.key] = true;
        logs = [
          createLog(`${item.action ?? item.entry.debuff}`, current.startedAt),
          ...logs,
        ];
      }
      return { ...current, firedAlerts, logs: logs.slice(0, 8) };
    });
  }, [
    now,
    speak,
    vibrate,
    state.alertReady,
    state.entries,
    state.firedAlerts,
    state.settings.alertLeadSeconds,
    state.settings.alertSound,
    state.settings.language,
    state.settings.ttsVolume,
    state.settings.vibrationEnabled,
  ]);

  useEffect(() => {
    setSelectedDebuff(null);
    setSelectedDuration(null);
    setSelectedBombDuration(null);
    setSelectedTruth(
      state.selectedRound === 2 && state.settings.round2TruthPreselect
        ? round2PresetTruth
        : null,
    );
    setSelectedWound(null);
    setSelectedFinal(null);
  }, [state.selectedRound, state.settings.round2TruthPreselect]);

  useEffect(() => {
    setSelectedDebuff(null);
    setSelectedDuration(null);
    setSelectedBombDuration(null);
    setSelectedTruth(null);
    setRound2PresetTruth(null);
    setSelectedWound(null);
    setSelectedFinal(null);
  }, [state.settings.assistMode, state.settings.fifthDebuffSkip]);

  useEffect(() => {
    if (!state.settings.round2TruthPreselect) {
      setRound2PresetTruth(null);
    }
  }, [state.settings.round2TruthPreselect]);

  const selectedEffectiveDuration = selectedDuration;
  const canRegister =
    isRaidMode && state.selectedRound === 1
      ? Boolean(
          selectedTruth && selectedDuration && selectedBombDuration !== null,
        )
      : state.selectedRound === 1
        ? Boolean(selectedTruth && selectedDebuff && selectedDuration)
      : state.selectedRound === 2
        ? Boolean(selectedTruth && selectedDebuff)
        : state.selectedRound === 3
          ? isRaidMode
            ? leaderRound1BombEntry
              ? Boolean(selectedTruth && round1Entry?.duration)
              : Boolean(selectedTruth && round1Entry?.duration && selectedDuration)
            : round1WasBomb
              ? Boolean(
                  selectedTruth &&
                    isWaterLightning(selectedDebuff) &&
                    selectedDuration,
                )
              : round1WasWaterLightning
                ? Boolean(selectedTruth && selectedDuration)
                : false
          : state.selectedRound === 4
            ? Boolean(selectedTruth && suggestedRound4)
            : Boolean(
                selectedWound &&
                  selectedFinal &&
                  round1Entry &&
                  round2Entry &&
                  round3Entry &&
                  round4Entry,
              );

  const buildInputEntry = useCallback(
    ({
      round,
      debuff,
      duration,
      source,
      truthState,
      actionText,
    }: {
      round: Round;
      debuff: DebuffName;
      duration: number | null;
      source: "manual" | "auto";
      truthState: TruthState;
      actionText: string | null;
    }): DebuffEntry => {
      return {
        id: makeId(),
        kind: "input",
        round,
        debuff,
        duration,
        appliedAt: 0,
        expiresAt: null,
        notify: false,
        source,
        truthState,
        timelineSeconds: null,
        actionText,
      };
    },
    [],
  );

  const buildTimelineEntry = useCallback(
    ({
      round,
      debuff,
      truthState,
      timelineSeconds,
      startedAt,
      actionText,
      source = "auto",
    }: {
      round: Round;
      debuff: DebuffName;
      truthState: TruthState;
      timelineSeconds: number;
      startedAt: number;
      actionText: string;
      source?: "manual" | "auto";
    }): DebuffEntry => ({
      id: makeId(),
      kind: "timeline",
      round,
      debuff,
      duration: timelineSeconds,
      appliedAt: startedAt,
      expiresAt: startedAt + timelineSeconds * 1000,
      notify: true,
      source,
      truthState,
      timelineSeconds,
      actionText,
    }),
    [],
  );

  const buildTimelineEntries = useCallback(
    ({
      assistMode,
      inputs,
      skipFifthDebuff,
      startedAt,
    }: {
      assistMode: TimerSettings["assistMode"];
      inputs: DebuffEntry[];
      skipFifthDebuff: boolean;
      startedAt: number;
    }) => {
      const r1 = inputs.find((entry) => entry.round === 1);
      const r2 = inputs.find((entry) => entry.round === 2);
      const r3 = inputs.find((entry) => entry.round === 3);
      const r4 = inputs.find((entry) => entry.round === 4);
      const wound = inputs.find(
        (entry) =>
          entry.round === 5 &&
          (entry.debuff === "Black Wound" || entry.debuff === "White Wound"),
      );
      const final = inputs.find(
        (entry) =>
          entry.round === 5 &&
          (entry.debuff === "Allagan Field" || entry.debuff === "Beyond Death"),
      );

      if (!r1 || !r2 || !r3 || !r4 || !r1.duration) {
        return [];
      }

      if (!skipFifthDebuff && (!wound || !final)) {
        return [];
      }

      const skipProfile = skipFifthDebuff
        ? getFourthInputTimelineProfile(r4.debuff)
        : null;
      const round1EyeSeconds =
        skipProfile?.round1Eye ?? TIMELINE_SECONDS.round1Eye;
      const round3EyeSeconds =
        skipProfile?.round3Eye ?? TIMELINE_SECONDS.round3Eye;
      const getChaosSeconds = (debuff: DebuffName) =>
        debuff === "Entropy"
          ? (skipProfile?.entropy ?? TIMELINE_SECONDS.entropy)
          : (skipProfile?.dynamicFluid ?? TIMELINE_SECONDS.dynamicFluid);
      const finalEntry =
        !skipFifthDebuff && final && wound
          ? buildTimelineEntry({
              round: 5,
              debuff: final.debuff,
              truthState: "truth",
              timelineSeconds: TIMELINE_SECONDS.final,
              startedAt,
              actionText: getFinalActionText(final.debuff, wound.debuff),
              source: "manual",
            })
          : null;

      if (assistMode === "raid") {
        const r1Bomb = inputs.find(
          (entry) => entry.round === 1 && entry.debuff === "Acceleration Bomb",
        );
        const r3Bomb = inputs.find(
          (entry) => entry.round === 3 && entry.debuff === "Acceleration Bomb",
        );

        const raidWaveEntries = [r1, r3]
          .map((entry) => ({
            entry,
            seconds: getTimelineSecondsForWave(entry.duration, skipProfile),
          }))
          .filter((item) => item.seconds !== null)
          .map(({ entry, seconds }) =>
            buildTimelineEntry({
              round: entry.round,
              debuff: "Compressed Water",
              truthState: entry.truthState,
              timelineSeconds: seconds!,
              startedAt,
              actionText: getWavePairActionText(entry.truthState),
            }),
          );

        const leaderBombEntries = [r1Bomb, r3Bomb]
          .filter((entry): entry is DebuffEntry => Boolean(entry?.duration))
          .map((entry) => {
            const timelineSeconds = getTimelineSecondsForWave(
              entry.duration,
              skipProfile,
            );
            if (timelineSeconds === null) return null;
            return buildTimelineEntry({
              round: entry.round,
              debuff: "Acceleration Bomb",
              truthState: entry.truthState,
              timelineSeconds,
              startedAt,
              actionText: getActionText("Acceleration Bomb", entry.truthState) ?? "",
              source: "manual",
            });
          })
          .filter((entry): entry is DebuffEntry => Boolean(entry));

        const chaosEntries = [r2, r4].map((entry) =>
          buildTimelineEntry({
            round: entry.round,
            debuff: entry.debuff,
            truthState: entry.truthState,
            timelineSeconds: getChaosSeconds(entry.debuff),
            startedAt,
            actionText: getActionText(entry.debuff, entry.truthState) ?? "",
          }),
        );

        return [
          finalEntry,
          ...raidWaveEntries,
          ...leaderBombEntries,
          buildTimelineEntry({
            round: 1,
            debuff: "Cursed Shriek",
            truthState: r1.truthState,
            timelineSeconds: round1EyeSeconds,
            startedAt,
            actionText: getActionText("Cursed Shriek", r1.truthState) ?? "",
          }),
          ...chaosEntries,
          buildTimelineEntry({
            round: 3,
            debuff: "Cursed Shriek",
            truthState: r3.truthState,
            timelineSeconds: round3EyeSeconds,
            startedAt,
            actionText: getActionText("Cursed Shriek", r3.truthState) ?? "",
          }),
        ]
          .filter((entry): entry is DebuffEntry => Boolean(entry))
          .sort((a, b) => (a.timelineSeconds ?? 0) - (b.timelineSeconds ?? 0));
      }

      const round1WaveTime = getTimelineSecondsForWave(
        r1.duration,
        skipProfile,
      );
      const round3WaveTime = getTimelineSecondsForWave(
        r3.duration,
        skipProfile,
      );
      const waveEntries = [
        {
          round: 1 as const,
          debuff: r1.debuff,
          truthState: r1.truthState,
          seconds: round1WaveTime,
        },
        {
          round: 3 as const,
          debuff: r3.debuff,
          truthState: r3.truthState,
          seconds: round3WaveTime,
        },
      ]
        .filter((entry) => entry.seconds !== null)
        .map((entry) =>
          buildTimelineEntry({
            round: entry.round,
            debuff: entry.debuff,
            truthState: entry.truthState,
            timelineSeconds: entry.seconds!,
            startedAt,
            actionText: getActionText(entry.debuff, entry.truthState) ?? "",
          }),
        );

      const chaosEntries = [r2, r4].map((entry) =>
        buildTimelineEntry({
          round: entry.round,
          debuff: entry.debuff,
          truthState: entry.truthState,
          timelineSeconds: getChaosSeconds(entry.debuff),
          startedAt,
          actionText: getActionText(entry.debuff, entry.truthState) ?? "",
        }),
      );

      return [
        finalEntry,
        ...waveEntries,
        buildTimelineEntry({
          round: 1,
          debuff: "Cursed Shriek",
          truthState: r1.truthState,
          timelineSeconds: round1EyeSeconds,
          startedAt,
          actionText: getActionText("Cursed Shriek", r1.truthState) ?? "",
        }),
        ...chaosEntries,
        buildTimelineEntry({
          round: 3,
          debuff: "Cursed Shriek",
          truthState: r3.truthState,
          timelineSeconds: round3EyeSeconds,
          startedAt,
          actionText: getActionText("Cursed Shriek", r3.truthState) ?? "",
        }),
      ]
        .filter((entry): entry is DebuffEntry => Boolean(entry))
        .sort((a, b) => (a.timelineSeconds ?? 0) - (b.timelineSeconds ?? 0));
    },
    [buildTimelineEntry],
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
      finalDebuff?: FinalDebuff | null;
      source?: "manual" | "auto";
      truthState?: TruthState | null;
      wound?: WoundDebuff | null;
    } = {}) => {
      const isRound5 = state.selectedRound === 5;
      const autoRound4 = state.selectedRound === 4 ? suggestedRound4 : null;
      const ready = isRound5
        ? Boolean(
            wound &&
              finalDebuff &&
              round1Entry &&
              round2Entry &&
              round3Entry &&
              round4Entry,
          )
        : isRaidMode && state.selectedRound === 1
          ? Boolean(
              truthState && duration && selectedBombDuration !== null,
            )
          : state.selectedRound === 1
            ? Boolean(truthState && debuff && duration)
          : state.selectedRound === 2
            ? Boolean(truthState && debuff)
            : state.selectedRound === 3
              ? isRaidMode
                ? leaderRound1BombEntry
                  ? Boolean(truthState && round1Entry?.duration)
                  : Boolean(truthState && round1Entry?.duration && duration)
                : round1WasBomb
                  ? Boolean(truthState && isWaterLightning(debuff) && duration)
                  : round1WasWaterLightning
                    ? Boolean(truthState && duration)
                    : false
              : Boolean(truthState && autoRound4);
      if (!ready) return;

      if (isRound5) {
        if (!wound || !finalDebuff) return;

        const woundEntry = buildInputEntry({
          round: 5,
          debuff: wound,
          duration: null,
          source: "manual",
          truthState: "truth",
          actionText: null,
        });
        const finalEntry = buildInputEntry({
          round: 5,
          debuff: finalDebuff,
          duration: TIMELINE_SECONDS.final,
          source: "manual",
          truthState: "truth",
          actionText: getFinalActionText(finalDebuff, wound),
        });

        setState((current) => {
          const startedAt = Date.now();
          const language = current.settings.language;
          const inputEntries = [
            ...current.entries.filter(
              (entry) => entry.kind === "input" && entry.round !== 5,
            ),
            woundEntry,
            finalEntry,
          ].sort((a, b) => a.round - b.round);
          const timelineEntries = buildTimelineEntries({
            assistMode: state.settings.assistMode,
            inputs: inputEntries,
            skipFifthDebuff: false,
            startedAt,
          });

          return {
            ...current,
            startedAt,
            firedAlerts: {},
            entries: [...inputEntries, ...timelineEntries],
            logs: [
              createLog(
                language === "ko"
                  ? `5차 ${wound} + ${finalDebuff} 기준 Assist 시작`
                  : `Assist started from Round 5 ${wound} + ${finalDebuff}`,
                startedAt,
              ),
              ...current.logs,
            ].slice(0, 8),
          };
        });
        setSelectedDebuff(null);
        setSelectedDuration(null);
        setSelectedTruth(null);
        setRound2PresetTruth(null);
        setSelectedWound(null);
        setSelectedFinal(null);
        return;
      }

      if (isRaidMode && state.selectedRound === 1) {
        if (!truthState || !duration || selectedBombDuration === null) return;

        const waveEntry = buildInputEntry({
          round: 1,
          debuff: "Compressed Water",
          duration,
          source: "manual",
          truthState,
          actionText: getWavePairActionText(truthState),
        });
        const newEntries = [waveEntry];

        if (selectedBombDuration !== "none") {
          newEntries.push(
            buildInputEntry({
              round: 1,
              debuff: "Acceleration Bomb",
              duration: selectedBombDuration,
              source: "manual",
              truthState,
              actionText: getActionText("Acceleration Bomb", truthState),
            }),
          );
        }

        setState((current) => {
          const language = current.settings.language;
          const inputEntries = current.entries.filter(
            (entry) =>
              entry.kind === "input" && entry.round < current.selectedRound,
          );
          const nextEntries = [...inputEntries, ...newEntries];

          return {
            ...current,
            startedAt: null,
            firedAlerts: {},
            entries: nextEntries.sort((a, b) => a.round - b.round),
            selectedRound: getNextRound(current.selectedRound),
            logs: [
              createLog(
                language === "ko"
                  ? `${roundLabel(language, 1)} ${truthLabel(language, truthState)} 리딩 입력`
                  : `${roundLabel(language, 1)} ${truthLabel(language, truthState)} party input`,
                current.startedAt,
              ),
              ...current.logs,
            ].slice(0, 8),
          };
        });
        setSelectedDebuff(null);
        setSelectedDuration(null);
        setSelectedBombDuration(null);
        setSelectedTruth(null);
        setSelectedWound(null);
        setSelectedFinal(null);
        return;
      }

      if (isRaidMode && state.selectedRound === 3) {
        if (!truthState || !round1Entry?.duration) return;
        const inferredWaveDuration = inferRound3Duration(round1Entry.duration);
        if (!inferredWaveDuration) return;
        if (!leaderRound1BombEntry && !duration) return;

        const newEntries = [
          buildInputEntry({
            round: 3,
            debuff: "Compressed Water",
            duration: inferredWaveDuration,
            source: "auto",
            truthState,
            actionText: getWavePairActionText(truthState),
          }),
        ];

        if (!leaderRound1BombEntry && duration) {
          newEntries.push(
            buildInputEntry({
              round: 3,
              debuff: "Acceleration Bomb",
              duration,
              source: "manual",
              truthState,
              actionText: getActionText("Acceleration Bomb", truthState),
            }),
          );
        }

        setState((current) => {
          const language = current.settings.language;
          const inputEntries = current.entries.filter(
            (entry) =>
              entry.kind === "input" && entry.round < current.selectedRound,
          );
          const nextEntries = [...inputEntries, ...newEntries];

          return {
            ...current,
            startedAt: null,
            firedAlerts: {},
            entries: nextEntries.sort((a, b) => a.round - b.round),
            selectedRound: getNextRound(current.selectedRound),
            logs: [
              createLog(
                language === "ko"
                  ? `${roundLabel(language, 3)} ${truthLabel(language, truthState)} 리딩 입력`
                  : `${roundLabel(language, 3)} ${truthLabel(language, truthState)} party input`,
                current.startedAt,
              ),
              ...current.logs,
            ].slice(0, 8),
          };
        });
        setSelectedDebuff(null);
        setSelectedDuration(null);
        setSelectedBombDuration(null);
        setSelectedTruth(null);
        setSelectedWound(null);
        setSelectedFinal(null);
        return;
      }

      const entryDebuff =
        state.selectedRound === 1
          ? debuff
          : state.selectedRound === 3
            ? round1WasWaterLightning
              ? "Acceleration Bomb"
              : debuff
            : autoRound4?.debuff ?? debuff;
      const entryDuration =
        state.selectedRound === 3
          ? duration
          : state.selectedRound === 2 && entryDebuff
            ? getDuration(2, entryDebuff)
            : autoRound4?.duration ?? duration;
      const entrySource = autoRound4 ? "auto" : source;

      if (!truthState || !entryDebuff || entryDuration === null) return;

      const actionText =
        state.selectedRound === 1
          ? getActionText(entryDebuff, truthState)
          : state.selectedRound === 3
            ? getActionText(entryDebuff, truthState)
            : getActionText(entryDebuff, truthState);

      const newEntry = buildInputEntry({
        round: state.selectedRound,
        debuff: entryDebuff,
        duration: entryDuration,
        source: entrySource,
        truthState,
        actionText,
      });

      setState((current) => {
        const language = current.settings.language;
        const inputEntries = current.entries.filter(
          (entry) =>
            entry.kind === "input" && entry.round < current.selectedRound,
        );
        const nextEntries = [...inputEntries, newEntry].sort(
          (a, b) => a.round - b.round,
        );
        const startsAfterRound4 =
          current.settings.fifthDebuffSkip && newEntry.round === 4;

        if (startsAfterRound4) {
          const startedAt = Date.now();
          const timelineEntries = buildTimelineEntries({
            assistMode: current.settings.assistMode,
            inputs: nextEntries,
            skipFifthDebuff: true,
            startedAt,
          });

          return {
            ...current,
            startedAt,
            firedAlerts: {},
            entries: [...nextEntries, ...timelineEntries],
            logs: [
              createLog(
                language === "ko"
                  ? "4차 입력 기준 Assist 시작"
                  : "Assist started from Round 4 input",
                startedAt,
              ),
              ...current.logs,
            ].slice(0, 8),
          };
        }

        return {
          ...current,
          startedAt: null,
          firedAlerts: {},
          entries: nextEntries,
          selectedRound: getNextRound(current.selectedRound),
          logs: [
            createLog(
              language === "ko"
                ? `${roundLabel(language, newEntry.round)} ${truthLabel(language, truthState)} ${actionText ?? newEntry.debuff} 입력`
                : `${roundLabel(language, newEntry.round)} ${truthLabel(language, truthState)} ${actionDisplayText(language, actionText) ?? newEntry.debuff} input`,
              current.startedAt,
            ),
            ...current.logs,
          ].slice(0, 8),
        };
      });
      setSelectedDebuff(null);
      setSelectedDuration(null);
      setSelectedTruth(null);
      if (state.selectedRound >= 2) {
        setRound2PresetTruth(null);
      }
      setSelectedWound(null);
      setSelectedFinal(null);
    },
    [
      buildInputEntry,
      buildTimelineEntries,
      isRaidMode,
      leaderRound1BombEntry,
      round1Entry,
      round2Entry,
      round3Entry,
      round4Entry,
      selectedDebuff,
      selectedBombDuration,
      selectedEffectiveDuration,
      selectedFinal,
      selectedTruth,
      selectedWound,
      state.selectedRound,
      state.settings.assistMode,
      state.settings.language,
      suggestedRound4,
    ],
  );

  const reset = useCallback(() => {
    setState({ ...initialState, alertReady: true, settings: state.settings });
    setSelectedDebuff(null);
    setSelectedDuration(null);
    setSelectedBombDuration(null);
    setSelectedTruth(null);
    setRound2PresetTruth(null);
    setSelectedWound(null);
    setSelectedFinal(null);
  }, [state.settings]);

  const handleTruthSelect = useCallback((truthState: TruthState) => {
    setSelectedTruth(truthState);
  }, []);

  const handleRound2PresetTruthSelect = useCallback((truthState: TruthState) => {
    setRound2PresetTruth(truthState);
  }, []);

  const handleDebuffSelect = useCallback((debuff: DebuffName) => {
    setSelectedDebuff(debuff);
  }, []);

  const handleDurationSelect = useCallback((duration: number) => {
    setSelectedDuration(duration);
  }, []);

  const handleBombDurationSelect = useCallback((duration: number | "none") => {
    setSelectedBombDuration(duration);
  }, []);

  const handleWoundSelect = useCallback((debuff: DebuffName) => {
    setSelectedWound(debuff as WoundDebuff);
  }, []);

  const handleFinalSelect = useCallback((debuff: DebuffName) => {
    setSelectedFinal(debuff as FinalDebuff);
  }, []);

  useEffect(() => {
    if (state.settings.fifthDebuffSkip) return;
    if (state.selectedRound !== 5 || state.startedAt) return;
    if (!selectedWound || !selectedFinal || !canRegister) return;

    registerEntry({
      finalDebuff: selectedFinal,
      wound: selectedWound,
    });
  }, [
    canRegister,
    registerEntry,
    selectedFinal,
    selectedWound,
    state.selectedRound,
    state.settings.fifthDebuffSkip,
    state.startedAt,
  ]);

  useEffect(() => {
    if (state.settings.registrationMode !== "instant") return;

    if (state.selectedRound === 5) {
      return;
    }

    if (state.selectedRound === 4) {
      if (!selectedTruth || !suggestedRound4) return;
      registerEntry({
        truthState: selectedTruth,
      });
      return;
    }

    if (state.selectedRound === 1) {
      if (isRaidMode) {
        if (!selectedTruth || !selectedDuration || selectedBombDuration === null) {
          return;
        }
        registerEntry({
          duration: selectedDuration,
          truthState: selectedTruth,
        });
        return;
      }
      if (!selectedTruth || !selectedDebuff || !selectedDuration) return;
      registerEntry({
        debuff: selectedDebuff,
        duration: selectedDuration,
        truthState: selectedTruth,
      });
      return;
    }

    if (state.selectedRound === 3) {
      if (isRaidMode) {
        if (!selectedTruth || !round1Entry?.duration) return;
        if (!leaderRound1BombEntry && !selectedDuration) return;
        registerEntry({
          duration: selectedDuration,
          truthState: selectedTruth,
        });
        return;
      }
      if (!selectedTruth || !round1Entry?.duration) return;
      if (round1WasBomb && !isWaterLightning(selectedDebuff)) return;
      if (!selectedDuration) return;
      registerEntry({
        debuff: round1WasWaterLightning ? "Acceleration Bomb" : selectedDebuff,
        duration: selectedDuration,
        truthState: selectedTruth,
      });
      return;
    }

    if (!selectedTruth || !selectedDebuff) return;
    registerEntry({
      debuff: selectedDebuff,
      duration: selectedDuration,
      source: "manual",
      truthState: selectedTruth,
    });
  }, [
    isRaidMode,
    leaderRound1BombEntry,
    registerEntry,
    round1Entry?.duration,
    round1WasBomb,
    round1WasWaterLightning,
    selectedBombDuration,
    selectedDebuff,
    selectedDuration,
    selectedFinal,
    selectedTruth,
    selectedWound,
    state.selectedRound,
    state.settings.registrationMode,
    suggestedRound4,
  ]);

  return {
    state,
    now,
    elapsedSeconds,
    nextEntry,
    nextAction,
    entriesByRound,
    allRoundsComplete,
    visibleDebuffs,
    round1Entry,
    leaderRound1BombEntry,
    suggestedRound4,
    selectedDebuff,
    selectedDuration,
    selectedBombDuration,
    selectedTruth,
    round2PresetTruth,
    selectedWound,
    selectedFinal,
    canRegister,
    handleTruthSelect,
    handleRound2PresetTruthSelect,
    handleDebuffSelect,
    handleDurationSelect,
    handleBombDurationSelect,
    handleWoundSelect,
    handleFinalSelect,
    registerEntry,
    reset,
    enableAlerts,
    updateSettings,
    setSelectedRound,
  };
}
