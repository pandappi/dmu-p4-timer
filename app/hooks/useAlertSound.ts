"use client";

import { useCallback } from "react";

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
    // iOS 등은 제스처 중 한 번 speak해야 이후 자동 발화가 허용된다.
    window.speechSynthesis?.cancel();
  }, []);

  return { speak, vibrate, unlock };
}
