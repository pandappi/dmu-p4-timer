import type { DebuffEntry, DebuffName, TruthState } from "./types";

/**
 * 디버프별 "처리법(행동)" 텍스트. 작업 요청서
 * (codex-debuff-action-timer-request.md) 기준.
 *
 * 만료 시점에는 디버프명이 아니라 이 행동 텍스트를 노출한다.
 * "5초 뒤", "곧" 같은 시간 표현은 붙이지 않는다(시간은 별도 UI).
 */

type Action = { truth: string; false: string };

// 진실/거짓에 따라 행동이 갈리는 디버프들.
const ACTION_TEXT_MAP: Partial<Record<DebuffName, Action>> = {
  "Compressed Water": { truth: "쉐어", false: "산개" },
  "Forked Lightning": { truth: "산개", false: "쉐어" },
  "Acceleration Bomb": { truth: "가만히", false: "움직이기" },
  "Cursed Shriek": { truth: "뒤돌기", false: "마안보기" },
  Entropy: { truth: "원형장판피하기", false: "도넛장판" },
  "Dynamic Fluid": { truth: "도넛장판", false: "원형장판피하기" },
};

export const TIMELINE_SECONDS = {
  final: 11,
  fastWave: 20,
  round1Eye: 29,
  entropy: 36,
  slowWave: 45,
  round3Eye: 53,
  dynamicFluid: 59,
} as const;

export const ASSIGNMENT_DURATIONS = {
  round1FastWave: 51,
  round1SlowWave: 76,
  round3FastWave: 36,
  round3SlowWave: 61,
} as const;

export const debuffKorean: Record<DebuffName, string> = {
  "Forked Lightning": "번개",
  "Compressed Water": "물",
  "Cursed Shriek": "저주의 외침",
  "Acceleration Bomb": "폭탄",
  Entropy: "혼돈의 불",
  "Dynamic Fluid": "혼돈의 물",
  "Black Wound": "죽은자의 상처",
  "White Wound": "산자의 상처",
  "Allagan Field": "알라그 필드",
  "Beyond Death": "죽음초월",
};

// 디버프 이름 표기(설정에 따라 한국어/영문).
export function debuffLabel(debuff: DebuffName, language: "ko" | "en") {
  return language === "ko" ? debuffKorean[debuff] : debuff;
}

function truthKey(truthState: TruthState): keyof Action {
  // 내부 상태는 'truth' | 'lie'; 요청서 매핑은 'truth' | 'false'.
  return truthState === "truth" ? "truth" : "false";
}

export function getActionText(
  debuff: DebuffName,
  truthState: TruthState,
): string | null {
  const action = ACTION_TEXT_MAP[debuff];
  return action ? action[truthKey(truthState)] : null;
}

export function getWavePairActionText(truthState: TruthState): string {
  return truthState === "truth"
    ? "물-쉐어 번개-산개"
    : "물-산개 번개-쉐어";
}

// Black Wound = 죽은자의 상처 = 파랑, White Wound = 산자의 상처 = 보라.
export function woundColorLabel(wound: DebuffName): string {
  return wound === "Black Wound" ? "파랑" : "보라";
}

/**
 * 5차: 죽음초월은 상처와 "같은" 색, 알라그필드는 상처와 "다른" 색을 맞는다.
 */
export function getFinalActionText(
  finalDebuff: DebuffName,
  woundDebuff: DebuffName,
): string {
  const woundIsBlack = woundDebuff === "Black Wound"; // 파랑
  if (finalDebuff === "Beyond Death") {
    return woundIsBlack ? "파랑 맞기" : "보라 맞기";
  }
  // Allagan Field → 상처와 다른 색
  return woundIsBlack ? "보라 맞기" : "파랑 맞기";
}

/**
 * 엔트리 하나의 처리법 텍스트. 5차 최종 디버프(알라그필드/죽음초월)는
 * 같은 5차에 등록된 상처 색과 조합해 결정한다.
 */
export function getEntryActionText(
  entry: DebuffEntry,
  entries: DebuffEntry[],
): string | null {
  if (entry.actionText) return entry.actionText;

  if (entry.debuff === "Allagan Field" || entry.debuff === "Beyond Death") {
    const wound = entries.find(
      (item) =>
        item.round === 5 &&
        (item.debuff === "Black Wound" || item.debuff === "White Wound"),
    );
    return wound ? getFinalActionText(entry.debuff, wound.debuff) : null;
  }

  if (entry.debuff === "Black Wound" || entry.debuff === "White Wound") {
    return woundColorLabel(entry.debuff);
  }

  return getActionText(entry.debuff, entry.truthState);
}

export function getWaveTimingLabel(seconds: number | null): string {
  if (
    seconds === ASSIGNMENT_DURATIONS.round1FastWave ||
    seconds === ASSIGNMENT_DURATIONS.round3FastWave ||
    seconds === TIMELINE_SECONDS.fastWave
  ) {
    return "빠른";
  }
  if (
    seconds === ASSIGNMENT_DURATIONS.round1SlowWave ||
    seconds === ASSIGNMENT_DURATIONS.round3SlowWave ||
    seconds === TIMELINE_SECONDS.slowWave
  ) {
    return "느린";
  }
  return "미정";
}

export function getOppositeWaveTime(seconds: number | null): number | null {
  if (seconds === ASSIGNMENT_DURATIONS.round1FastWave) {
    return ASSIGNMENT_DURATIONS.round3SlowWave;
  }
  if (seconds === ASSIGNMENT_DURATIONS.round1SlowWave) {
    return ASSIGNMENT_DURATIONS.round3FastWave;
  }
  return null;
}

export function getWaveTimelineSeconds(duration: number | null): number | null {
  if (
    duration === ASSIGNMENT_DURATIONS.round1FastWave ||
    duration === ASSIGNMENT_DURATIONS.round3FastWave
  ) {
    return TIMELINE_SECONDS.fastWave;
  }
  if (
    duration === ASSIGNMENT_DURATIONS.round1SlowWave ||
    duration === ASSIGNMENT_DURATIONS.round3SlowWave
  ) {
    return TIMELINE_SECONDS.slowWave;
  }
  return null;
}

export function isWaterLightning(debuff: DebuffName | null | undefined) {
  return debuff === "Compressed Water" || debuff === "Forked Lightning";
}

export function isAccelerationBomb(debuff: DebuffName | null | undefined) {
  return debuff === "Acceleration Bomb";
}
