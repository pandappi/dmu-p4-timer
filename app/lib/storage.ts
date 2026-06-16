import { defaultSettings, initialState, STORAGE_KEY } from "./constants";
import type { TimerSettings, TimerState } from "./types";

/**
 * 옵션(설정)만 영구 저장한다. 전투 진행 상태(등록된 디버프·차수·로그)는
 * 저장하지 않으므로 새로고침하면 항상 초기 상태로 돌아가고 설정만 유지된다.
 * STORAGE_KEY가 스키마 버전을 담는다.
 */

type PersistedShape = {
  settings?: Partial<TimerSettings>;
};

export function loadState(): TimerState | null {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as PersistedShape;
    const settings = { ...defaultSettings, ...parsed.settings };
    return { ...initialState, settings };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveState(state: TimerState) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ settings: state.settings }),
  );
}

export function clearState() {
  window.localStorage.removeItem(STORAGE_KEY);
}
