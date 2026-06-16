import type { Language, TimerLog } from "./types";

export function formatClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createLog(
  message: string,
  startedAt: number | null,
): TimerLog {
  return {
    id: makeId(),
    message: `${formatClock((Date.now() - (startedAt ?? Date.now())) / 1000)} ${message}`,
  };
}

export function normalizeNumber(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

// 지속시간 라벨. 60초를 넘으면 인게임 표기에 맞춰 분 단위를 괄호로 병기한다.
// 인게임은 1분 초과 시 "1m"으로만 표시하므로 초 단위는 생략한다. 예: 76 → "76초 (1m)".
export function formatDurationLabel(seconds: number, language: Language = "ko") {
  const unit = language === "ko" ? "초" : "s";
  if (seconds <= 60) return `${seconds}${unit}`;
  const minutes = Math.floor(seconds / 60);
  return `${seconds}${unit} (${minutes}m)`;
}
