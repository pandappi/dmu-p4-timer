"use client";

import { useCallback } from "react";

import type { Language } from "../lib/types";

const MALE_VOICE_KEYWORDS = [
  "male",
  "man",
  "masculine",
  "남성",
  "남자",
  "남",
];

function pickPreferredVoice(language: Language) {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const languagePrefix = language === "ko" ? "ko" : "en";
  const languageVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(languagePrefix),
  );
  const maleVoice = languageVoices.find((voice) =>
    MALE_VOICE_KEYWORDS.some((keyword) =>
      voice.name.toLowerCase().includes(keyword.toLowerCase()),
    ),
  );

  return maleVoice ?? languageVoices[0] ?? null;
}

/**
 * 알림 출력: 음성(SpeechSynthesis) · 진동(Vibration).
 *
 * 모바일 브라우저는 음성을 사용자 제스처 전에는 막을 수 있으므로, 설정에서
 * 알림 테스트를 누르면 TTS를 한 번 깨운다. 기본 흐름은 테스트 없이도 시도한다.
 */
export function useAlertSound() {
  const vibrate = useCallback((strong = false) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(strong ? [180, 90, 180, 90, 180] : [120]);
    }
  }, []);

  const speak = useCallback((text: string, volume = 1, language: Language = "ko") => {
    const synth = window.speechSynthesis;
    if (!synth || !text) return;

    // 이전 발화가 큐에 남아 밀리지 않도록 취소 후 재생.
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "ko" ? "ko-KR" : "en-US";
    utterance.voice = pickPreferredVoice(language);
    utterance.rate = 1.05;
    utterance.pitch = 0.78;
    utterance.volume = Math.min(1, Math.max(0, volume));
    synth.speak(utterance);
  }, []);

  // 사용자 제스처 안에서 호출해 오디오/TTS 재생 권한을 확보한다.
  const unlock = useCallback(async () => {
    // 실제 알림도 알림 테스트 없이 먼저 시도한다. 다만 일부 모바일 브라우저는
    // 사용자 제스처 전 자동 발화를 막을 수 있어, 설정의 알림 테스트가 보조 수단이다.
    window.speechSynthesis?.cancel();
  }, []);

  return { speak, vibrate, unlock };
}
