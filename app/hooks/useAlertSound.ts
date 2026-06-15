"use client";

import { useCallback, useRef } from "react";

/**
 * 알림 출력: 비프음(Web Audio) · 음성(SpeechSynthesis) · 진동(Vibration).
 *
 * 모바일 브라우저는 오디오/음성을 사용자 제스처 전에는 막으므로, 전투 전
 * "알림 테스트" 탭에서 `unlock`을 호출해 오디오 컨텍스트와 TTS를 미리 깨운다.
 */
export function useAlertSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;

    const context = audioContextRef.current ?? new AudioContextCtor();
    audioContextRef.current = context;
    return context;
  }, []);

  const vibrate = useCallback((strong = false) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(strong ? [180, 90, 180, 90, 180] : [120]);
    }
  }, []);

  const playBeep = useCallback(
    (strong = false) => {
      const context = getContext();
      if (!context) return;

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
    },
    [getContext],
  );

  const speak = useCallback((text: string) => {
    const synth = window.speechSynthesis;
    if (!synth || !text) return;

    // 이전 발화가 큐에 남아 밀리지 않도록 취소 후 재생.
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 1.1;
    utterance.volume = 1;
    synth.speak(utterance);
  }, []);

  // 사용자 제스처 안에서 호출해 오디오/TTS 재생 권한을 확보한다.
  const unlock = useCallback(async () => {
    const context = getContext();
    if (context) await context.resume();
    // iOS 등은 제스처 중 한 번 speak해야 이후 자동 발화가 허용된다.
    window.speechSynthesis?.cancel();
  }, [getContext]);

  return { playBeep, speak, vibrate, unlock };
}
