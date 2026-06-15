"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type FinalDebuff,
  finalDebuffs,
  type WoundDebuff,
  woundDebuffs,
  debuffsByRound,
  initialState,
  roundLabels,
  truthLabels,
} from "../lib/constants";
import {
  getDuration,
  getNextRound,
  getRound3Candidates,
  inferRound3Duration,
  inferRound4,
} from "../lib/rules";
import { EYE_DURATION_BY_ROUND, getEntryActionText } from "../lib/actions";
import { clearState, loadState, saveState } from "../lib/storage";
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

export function useDebuffTimer() {
  const [state, setState] = useState<TimerState>(initialState);
  const now = useNow();
  const [selectedDebuff, setSelectedDebuff] = useState<DebuffName | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedTruth, setSelectedTruth] = useState<TruthState | null>(null);
  const [selectedWound, setSelectedWound] = useState<WoundDebuff | null>(null);
  const [selectedFinal, setSelectedFinal] = useState<FinalDebuff | null>(null);

  const { playBeep, speak, vibrate, unlock } = useAlertSound();

  // split-grid 모드에서 디버프와 시간을 한 번에 고를 때, 디버프 변경에 따른
  // 시간 동기화 effect가 방금 고른 시간을 덮어쓰지 않도록 잠시 보관한다.
  const pendingDurationRef = useRef<number | null>(null);

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
      speak("테스트");
    } else {
      playBeep(false);
    }
    vibrate(false);
    setState((current) => ({ ...current, alertReady: true }));
    addLog("알림 테스트 완료");
  }, [addLog, playBeep, speak, state.settings.alertSound, unlock, vibrate]);

  const updateSettings = useCallback((settings: Partial<TimerSettings>) => {
    setState((current) => ({
      ...current,
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

  const round1ElementEntry = state.entries.find(
    (entry) =>
      entry.round === 1 &&
      (entry.debuff === "Forked Lightning" ||
        entry.debuff === "Compressed Water"),
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
    (selectedDebuff === "Forked Lightning" ||
      selectedDebuff === "Compressed Water") &&
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
  const nextAction = nextEntry
    ? getEntryActionText(nextEntry, state.entries)
    : null;
  const elapsedSeconds = state.startedAt ? (now - state.startedAt) / 1000 : 0;

  const allRoundsComplete = useMemo(
    () =>
      ([1, 2, 3, 4, 5] as Round[]).every(
        (round) => entriesByRound[round].length > 0,
      ),
    [entriesByRound],
  );

  useEffect(() => {
    if (!state.alertReady) return;

    state.entries.forEach((entry) => {
      if (!entry.notify || !entry.expiresAt) return;

      const leadSeconds = Math.max(0, state.settings.alertLeadSeconds);
      const alertAt = entry.expiresAt - leadSeconds * 1000;
      const key = `${entry.id}:lead:${leadSeconds}`;
      const shouldFire = now >= alertAt && now < alertAt + 1000;

      if (!shouldFire || state.firedAlerts[key]) return;

      const action = getEntryActionText(entry, state.entries);
      if (state.settings.alertSound === "tts" && action) {
        speak(action);
      } else {
        playBeep(true);
      }
      vibrate(true);

      setState((current) => ({
        ...current,
        firedAlerts: { ...current.firedAlerts, [key]: true },
        logs: [
          createLog(`${action ?? entry.debuff}`, current.startedAt),
          ...current.logs,
        ].slice(0, 8),
      }));
    });
  }, [
    now,
    playBeep,
    speak,
    vibrate,
    state.alertReady,
    state.entries,
    state.firedAlerts,
    state.settings.alertLeadSeconds,
    state.settings.alertSound,
  ]);

  useEffect(() => {
    pendingDurationRef.current = null;
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

    // 디버프+시간을 동시에 고른 경우엔 그 시간을 그대로 사용한다.
    if (pendingDurationRef.current !== null) {
      setSelectedDuration(pendingDurationRef.current);
      pendingDurationRef.current = null;
      return;
    }

    const duration = getDuration(state.selectedRound, selectedDebuff);
    setSelectedDuration(duration);
  }, [selectedDebuff, state.selectedRound]);

  const selectedEffectiveDuration = suggestedRound3Duration ?? selectedDuration;
  const canRegister =
    state.selectedRound === 5
      ? Boolean(selectedTruth && selectedWound && selectedFinal)
      : Boolean(selectedTruth && selectedDebuff) &&
        selectedEffectiveDuration !== null;

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
      const notify =
        duration !== null &&
        debuff !== "Black Wound" &&
        debuff !== "White Wound";
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
      finalDebuff?: FinalDebuff | null;
      source?: "manual" | "auto";
      truthState?: TruthState | null;
      wound?: WoundDebuff | null;
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

      const newEntry = buildEntry({
        round: state.selectedRound,
        debuff: entryDebuff,
        duration: entryDuration,
        appliedAt,
        source: entrySource,
        truthState,
      });

      setState((current) => {
        const withoutRound = current.entries.filter(
          (entry) =>
            entry.round !== current.selectedRound ||
            entry.debuff !== entryDebuff,
        );
        let nextEntries = [...withoutRound, newEntry];

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

        // 마안 자동 타이머: 1·3차는 선택 디버프와 별개로 Cursed Shriek 처리
        // 타이머를 자동 등록한다(1차 60초 / 3차 69초, 그 차수의 진실/거짓 적용).
        if (current.selectedRound === 1 || current.selectedRound === 3) {
          nextEntries = nextEntries.filter(
            (entry) =>
              !(
                entry.round === current.selectedRound &&
                entry.debuff === "Cursed Shriek" &&
                entry.source === "auto"
              ),
          );

          // 본인이 마안을 직접 선택했다면 그 엔트리가 곧 마안 타이머이므로 중복 등록 생략.
          if (entryDebuff !== "Cursed Shriek") {
            const eyeEntry = buildEntry({
              round: current.selectedRound,
              debuff: "Cursed Shriek",
              duration: EYE_DURATION_BY_ROUND[current.selectedRound],
              appliedAt,
              source: "auto",
              truthState,
            });
            nextEntries.push(eyeEntry);
          }
        }

        return {
          ...current,
          startedAt: current.startedAt ?? Date.now(),
          entries: nextEntries.sort((a, b) => a.round - b.round),
          selectedRound: getNextRound(current.selectedRound),
          logs: [
            createLog(
              `${roundLabels[newEntry.round]} ${truthLabels[truthState]} ${newEntry.debuff} 등록`,
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
    clearState();
  }, [state.settings]);

  const getReadyDuration = useCallback(
    (debuff: DebuffName, duration: number | null) => {
      const inferredDuration =
        state.selectedRound === 3 &&
        (debuff === "Forked Lightning" || debuff === "Compressed Water") &&
        round1ElementEntry?.duration
          ? inferRound3Duration(round1ElementEntry.duration)
          : null;

      return (
        inferredDuration ?? duration ?? getDuration(state.selectedRound, debuff)
      );
    },
    [round1ElementEntry?.duration, state.selectedRound],
  );

  const handleTruthSelect = useCallback((truthState: TruthState) => {
    setSelectedTruth(truthState);
  }, []);

  const handleDebuffSelect = useCallback((debuff: DebuffName) => {
    pendingDurationRef.current = null;
    setSelectedDebuff(debuff);
  }, []);

  // split-grid 모드: 디버프와 시간을 한 번에 선택.
  const handleDebuffWithDuration = useCallback(
    (debuff: DebuffName, duration: number) => {
      pendingDurationRef.current = duration;
      setSelectedDebuff(debuff);
      setSelectedDuration(duration);
    },
    [],
  );

  const handleDurationSelect = useCallback((duration: number) => {
    setSelectedDuration(duration);
  }, []);

  const handleWoundSelect = useCallback((debuff: DebuffName) => {
    setSelectedWound(debuff as WoundDebuff);
  }, []);

  const handleFinalSelect = useCallback((debuff: DebuffName) => {
    setSelectedFinal(debuff as FinalDebuff);
  }, []);

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

  return {
    state,
    now,
    elapsedSeconds,
    nextEntry,
    nextAction,
    entriesByRound,
    allRoundsComplete,
    visibleDebuffs,
    round1ElementEntry,
    suggestedRound3Duration,
    suggestedRound4,
    selectedDebuff,
    selectedDuration,
    selectedTruth,
    selectedWound,
    selectedFinal,
    canRegister,
    handleTruthSelect,
    handleDebuffSelect,
    handleDebuffWithDuration,
    handleDurationSelect,
    handleWoundSelect,
    handleFinalSelect,
    registerEntry,
    reset,
    enableAlerts,
    updateSettings,
    setSelectedRound,
  };
}
