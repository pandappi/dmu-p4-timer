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
            <span className="setting-label">사용 모드</span>
            <div className="segmented two-col" aria-label="사용 모드">
              <button
                className={`segment ${settings.assistMode === "personal" ? "active" : ""}`}
                onClick={() => onUpdate({ assistMode: "personal" })}
                type="button"
              >
                개인용
              </button>
              <button
                className={`segment ${settings.assistMode === "raid" ? "active" : ""}`}
                onClick={() => onUpdate({ assistMode: "raid" })}
                type="button"
              >
                리딩용
              </button>
            </div>
            <p className="setting-help">
              리딩용은 8인 전체 처리 순서를 기준으로 물/번개 처리와 리딩자 폭탄을 함께 정리합니다.
            </p>
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
              선택 즉시는 필요한 입력이 모두 정해지는 순간 다음 차수로 넘어갑니다.
            </p>
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
            <span className="setting-label">소리 알림</span>
            <div className="segmented two-col" aria-label="소리 알림 방식">
              <button
                className={`segment ${settings.alertSound === "tts" ? "active" : ""}`}
                onClick={() => onUpdate({ alertSound: "tts" })}
                type="button"
              >
                TTS
              </button>
              <button
                className={`segment ${settings.alertSound === "off" ? "active" : ""}`}
                onClick={() => onUpdate({ alertSound: "off" })}
                type="button"
              >
                끄기
              </button>
            </div>
            <p className="setting-help">
              TTS는 처리 시점에 처리법(예: &ldquo;산개&rdquo;)을 읽어줍니다.
              기기/브라우저에 따라 한국어 음성이 없으면 기본 음성으로 재생됩니다.
            </p>
          </div>
          <div className="setting-section">
            <span className="setting-label">진동</span>
            <div className="segmented two-col" aria-label="진동 설정">
              <button
                className={`segment ${settings.vibrationEnabled ? "active" : ""}`}
                onClick={() => onUpdate({ vibrationEnabled: true })}
                type="button"
              >
                켜기
              </button>
              <button
                className={`segment ${!settings.vibrationEnabled ? "active" : ""}`}
                onClick={() => onUpdate({ vibrationEnabled: false })}
                type="button"
              >
                끄기
              </button>
            </div>
          </div>
          <div className="setting-section">
            <span className="setting-label">장판 표기</span>
            <div className="segmented two-col" aria-label="장판 표기">
              <button
                className={`segment ${settings.aoeLabelMode === "element" ? "active" : ""}`}
                onClick={() => onUpdate({ aoeLabelMode: "element" })}
                type="button"
              >
                번개/얼음
              </button>
              <button
                className={`segment ${settings.aoeLabelMode === "shape" ? "active" : ""}`}
                onClick={() => onUpdate({ aoeLabelMode: "shape" })}
                type="button"
              >
                직선/부채꼴
              </button>
            </div>
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
          <button
            className="primary"
            disabled={
              settings.alertSound === "off" && !settings.vibrationEnabled
            }
            onClick={onTestAlert}
            type="button"
          >
            <Volume2 size={18} aria-hidden="true" />
            알림 테스트
          </button>
        </div>
      </section>
    </div>
  );
}

export const SettingsModal = memo(SettingsModalImpl);
