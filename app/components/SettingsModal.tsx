import { Volume2, X } from "lucide-react";
import { memo } from "react";

import { defaultSettings } from "../lib/constants";
import { text } from "../lib/i18n";
import type { Language, TimerSettings } from "../lib/types";
import { normalizeNumber } from "../lib/utils";

type SettingsModalProps = {
  settings: TimerSettings;
  language: Language;
  onClose: () => void;
  onUpdate: (settings: Partial<TimerSettings>) => void;
  onTestAlert: () => void;
};

function SettingsModalImpl({
  settings,
  language,
  onClose,
  onUpdate,
  onTestAlert,
}: SettingsModalProps) {
  const modeHelp =
    settings.assistMode === "personal"
      ? text(language, "personalModeHelp")
      : text(language, "partyModeHelp");

  const updateAlertLeadSeconds = (value: string) => {
    const nextValue = normalizeNumber(
      Number(value),
      defaultSettings.alertLeadSeconds,
    );
    onUpdate({
      alertLeadSeconds: Math.min(15, Math.max(0, nextValue)),
    });
  };
  const updateTtsVolume = (value: string) => {
    const nextValue = normalizeNumber(
      Number(value),
      defaultSettings.ttsVolume * 100,
    );
    onUpdate({
      ttsVolume: Math.min(1, Math.max(0, nextValue / 100)),
    });
  };
  const ttsVolumePercent = Math.round(settings.ttsVolume * 100);

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-label={text(language, "settings")}
        className="settings-popover"
        role="dialog"
      >
        <div className="panel-head">
          <h2>{text(language, "settings")}</h2>
          <button className="icon-button" onClick={onClose} type="button">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="settings-body">
          <div className="setting-section">
            <span className="setting-label">{text(language, "useMode")}</span>
            <div className="segmented two-col" aria-label={text(language, "useMode")}>
              <button
                className={`segment ${settings.assistMode === "personal" ? "active" : ""}`}
                onClick={() =>
                  onUpdate({
                    assistMode: "personal",
                    partyChatCopy: false,
                    partySoundCopy: false,
                  })
                }
                type="button"
              >
                {text(language, "personalMode")}
              </button>
              <button
                className={`segment ${settings.assistMode === "raid" ? "active" : ""}`}
                onClick={() => onUpdate({ assistMode: "raid" })}
                type="button"
              >
                {text(language, "partyMode")}
              </button>
            </div>
            <p className="setting-help">{modeHelp}</p>
          </div>
          {settings.assistMode === "raid" ? (
            <div className="setting-section">
              <span className="setting-label">
                {text(language, "partyCallCopyOptions")}
              </span>
              <div className="inline-check-row">
                <label className="inline-setting-check">
                  <input
                    checked={settings.partyChatCopy}
                    onChange={(event) =>
                      onUpdate({ partyChatCopy: event.target.checked })
                    }
                    type="checkbox"
                  />
                  <span>{text(language, "partyChatCopy")}</span>
                </label>
                <label className="inline-setting-check">
                  <input
                    checked={settings.partySoundCopy}
                    onChange={(event) =>
                      onUpdate({ partySoundCopy: event.target.checked })
                    }
                    type="checkbox"
                  />
                  <span>{text(language, "addSound")}</span>
                </label>
              </div>
            </div>
          ) : null}
          <div className="setting-section">
            <span className="setting-label">{text(language, "registrationMode")}</span>
            <div
              className="segmented two-col"
              aria-label={text(language, "registrationMode")}
            >
              <button
                className={`segment ${settings.registrationMode === "instant" ? "active" : ""}`}
                onClick={() => onUpdate({ registrationMode: "instant" })}
                type="button"
              >
                {text(language, "instant")}
              </button>
              <button
                className={`segment ${settings.registrationMode === "confirm" ? "active" : ""}`}
                onClick={() => onUpdate({ registrationMode: "confirm" })}
                type="button"
              >
                {text(language, "confirmButton")}
              </button>
            </div>
            <p className="setting-help">
              {text(language, "instantHelp")}
            </p>
          </div>
          <div className="setting-section">
            <span className="setting-label">{text(language, "theme")}</span>
            <div className="segmented two-col" aria-label={text(language, "theme")}>
              <button
                className={`segment ${settings.theme === "dark" ? "active" : ""}`}
                onClick={() => onUpdate({ theme: "dark" })}
                type="button"
              >
                {text(language, "dark")}
              </button>
              <button
                className={`segment ${settings.theme === "light" ? "active" : ""}`}
                onClick={() => onUpdate({ theme: "light" })}
                type="button"
              >
                {text(language, "light")}
              </button>
            </div>
          </div>
          <div className="setting-section">
            <span className="setting-label">{text(language, "soundAlert")}</span>
            <div
              className="segmented two-col"
              aria-label={text(language, "soundAlert")}
            >
              <button
                className={`segment ${settings.alertSound === "tts" ? "active" : ""}`}
                onClick={() => onUpdate({ alertSound: "tts" })}
                type="button"
              >
                {text(language, "tts")}
              </button>
              <button
                className={`segment ${settings.alertSound === "off" ? "active" : ""}`}
                onClick={() => onUpdate({ alertSound: "off" })}
                type="button"
              >
                {text(language, "off")}
              </button>
            </div>
            <p className="setting-help">
              {text(language, "soundHelp")}
            </p>
          </div>
          <label className="setting-section">
            <span className="setting-label">
              {text(language, "ttsVolume")} {ttsVolumePercent}%
            </span>
            <input
              className="range-field"
              disabled={settings.alertSound === "off"}
              max={100}
              min={0}
              onChange={(event) => updateTtsVolume(event.target.value)}
              step={5}
              type="range"
              value={ttsVolumePercent}
            />
          </label>
          <div className="setting-section">
            <span className="setting-label">{text(language, "vibration")}</span>
            <div
              className="segmented two-col"
              aria-label={text(language, "vibration")}
            >
              <button
                className={`segment ${!settings.vibrationEnabled ? "active" : ""}`}
                onClick={() => onUpdate({ vibrationEnabled: false })}
                type="button"
              >
                {text(language, "off")}
              </button>
              <button
                className={`segment ${settings.vibrationEnabled ? "active" : ""}`}
                onClick={() => onUpdate({ vibrationEnabled: true })}
                type="button"
              >
                {text(language, "on")}
              </button>
            </div>
          </div>
          <div className="setting-section">
            <span className="setting-label">{text(language, "aoeLabel")}</span>
            <div
              className="segmented two-col"
              aria-label={text(language, "aoeLabel")}
            >
              <button
                className={`segment ${settings.aoeLabelMode === "element" ? "active" : ""}`}
                onClick={() => onUpdate({ aoeLabelMode: "element" })}
                type="button"
              >
                {text(language, "elementLabels")}
              </button>
              <button
                className={`segment ${settings.aoeLabelMode === "shape" ? "active" : ""}`}
                onClick={() => onUpdate({ aoeLabelMode: "shape" })}
                type="button"
              >
                {text(language, "shapeLabels")}
              </button>
            </div>
          </div>
          <label className="number-field">
            <span>{text(language, "inputAlertBuffer")}</span>
            <small>{text(language, "inputAlertHelp")}</small>
            <input
              inputMode="numeric"
              max={15}
              min={0}
              onChange={(event) => updateAlertLeadSeconds(event.target.value)}
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
            {text(language, "testAlert")}
          </button>
          <p className="setting-help alert-test-help">
            {text(language, "alertTestHelp")}
          </p>
          <p className="settings-contact">
            <span>{text(language, "contact")}</span>
            <a href="mailto:pandappi123@gmail.com">pandappi123@gmail.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}

export const SettingsModal = memo(SettingsModalImpl);
