import { Volume2, X } from "lucide-react";
import { memo } from "react";

import { defaultSettings } from "../lib/constants";
import type { TimerSettings } from "../lib/types";
import { normalizeNumber } from "../lib/utils";

type SettingsModalProps = {
  settings: TimerSettings;
  onClose: () => void;
  onUpdate: (settings: Partial<TimerSettings>) => void;
  onTestAlert: () => void;
};

function SettingsModalImpl({
  settings,
  onClose,
  onUpdate,
  onTestAlert,
}: SettingsModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-label="설정" className="settings-popover" role="dialog">
        <div className="panel-head">
          <h2>설정</h2>
          <button className="icon-button" onClick={onClose} type="button">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="settings-body">
          <div className="setting-section">
            <span className="setting-label">보기 모드</span>
            <div className="segmented two-col" aria-label="디버프 보기 모드">
              <button
                className={`segment ${settings.displayMode === "icon-only" ? "active" : ""}`}
                onClick={() => onUpdate({ displayMode: "icon-only" })}
                type="button"
              >
                아이콘만
              </button>
              <button
                className={`segment ${settings.displayMode === "icon-label" ? "active" : ""}`}
                onClick={() => onUpdate({ displayMode: "icon-label" })}
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
                className={`segment ${settings.registrationMode === "confirm" ? "active" : ""}`}
                onClick={() => onUpdate({ registrationMode: "confirm" })}
                type="button"
              >
                등록 버튼
              </button>
              <button
                className={`segment ${settings.registrationMode === "instant" ? "active" : ""}`}
                onClick={() => onUpdate({ registrationMode: "instant" })}
                type="button"
              >
                선택 즉시
              </button>
            </div>
            <p className="setting-help">
              선택 즉시는 디버프와 시간이 모두 정해지는 순간 다음 차수로 넘어갑니다.
            </p>
          </div>
          <div className="setting-section">
            <span className="setting-label">디버프 이름</span>
            <div className="segmented two-col" aria-label="디버프 이름 표기">
              <button
                className={`segment ${settings.nameLanguage === "ko" ? "active" : ""}`}
                onClick={() => onUpdate({ nameLanguage: "ko" })}
                type="button"
              >
                한국어
              </button>
              <button
                className={`segment ${settings.nameLanguage === "en" ? "active" : ""}`}
                onClick={() => onUpdate({ nameLanguage: "en" })}
                type="button"
              >
                English
              </button>
            </div>
          </div>
          <div className="setting-section">
            <span className="setting-label">테마</span>
            <div className="segmented two-col" aria-label="테마">
              <button
                className={`segment ${settings.theme === "dark" ? "active" : ""}`}
                onClick={() => onUpdate({ theme: "dark" })}
                type="button"
              >
                다크
              </button>
              <button
                className={`segment ${settings.theme === "light" ? "active" : ""}`}
                onClick={() => onUpdate({ theme: "light" })}
                type="button"
              >
                라이트
              </button>
            </div>
          </div>
          <div className="setting-section">
            <span className="setting-label">시간 선택 방식</span>
            <div className="segmented stack" aria-label="시간 선택 방식">
              <button
                className={`segment ${settings.durationMode === "panel" ? "active" : ""}`}
                onClick={() => onUpdate({ durationMode: "panel" })}
                type="button"
              >
                시간 영역 항상 표시
              </button>
              <button
                className={`segment ${settings.durationMode === "split-select" ? "active" : ""}`}
                onClick={() => onUpdate({ durationMode: "split-select" })}
                type="button"
              >
                선택 시 칸 좌우 분리
              </button>
              <button
                className={`segment ${settings.durationMode === "split-grid" ? "active" : ""}`}
                onClick={() => onUpdate({ durationMode: "split-grid" })}
                type="button"
              >
                디버프+시간 동시 선택
              </button>
            </div>
            <p className="setting-help">
              1·3차에서 지속시간을 고르는 방식입니다. 시간이 필요 없는 디버프는
              영향받지 않습니다.
            </p>
          </div>
          <div className="setting-section">
            <span className="setting-label">알림 방식</span>
            <div className="segmented two-col" aria-label="알림 출력 방식">
              <button
                className={`segment ${settings.alertSound === "tts" ? "active" : ""}`}
                onClick={() => onUpdate({ alertSound: "tts" })}
                type="button"
              >
                음성(TTS)
              </button>
              <button
                className={`segment ${settings.alertSound === "beep" ? "active" : ""}`}
                onClick={() => onUpdate({ alertSound: "beep" })}
                type="button"
              >
                비프음
              </button>
            </div>
            <p className="setting-help">
              음성은 만료 시점에 처리법(예: &ldquo;산개&rdquo;)을 한국어로 읽어줍니다.
              기기/브라우저에 따라 한국어 음성이 없으면 기본 음성으로 재생됩니다.
            </p>
          </div>
          <label className="number-field">
            <span>몇 초 전에 알림</span>
            <small>
              디버프 확인 후 아이콘을 누르기까지 걸리는 시간을 포함해, 만료보다 몇 초
              빨리 소리낼지
            </small>
            <input
              inputMode="numeric"
              min={0}
              onChange={(event) =>
                onUpdate({
                  alertLeadSeconds: Math.max(
                    0,
                    normalizeNumber(
                      Number(event.target.value),
                      defaultSettings.alertLeadSeconds,
                    ),
                  ),
                })
              }
              type="number"
              value={settings.alertLeadSeconds}
            />
          </label>
          <button className="primary" onClick={onTestAlert} type="button">
            <Volume2 size={18} aria-hidden="true" />
            알림 테스트
          </button>
        </div>
      </section>
    </div>
  );
}

export const SettingsModal = memo(SettingsModalImpl);
