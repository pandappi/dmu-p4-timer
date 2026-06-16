import { BellRing } from "lucide-react";
import { memo } from "react";

import { actionDisplayText, debuffDisplayName, roundLabel } from "../lib/i18n";
import type { DebuffEntry, Language, TimerSettings } from "../lib/types";
import { formatClock } from "../lib/utils";

type StatusPanelProps = {
  nextEntry: DebuffEntry | undefined;
  nextAction: string | null;
  language?: Language;
  now: number;
  alertReady: boolean;
  alertLeadSeconds: number;
  alertSound: TimerSettings["alertSound"];
};

function StatusPanelImpl({
  nextEntry,
  nextAction,
  language = "ko",
  now,
  alertReady,
  alertLeadSeconds,
  alertSound,
}: StatusPanelProps) {
  return (
    <section className="panel status-panel">
      <div className="next-debuff">
        <span>{language === "ko" ? "다음 처리" : "Next"}</span>
        {nextEntry ? (
          <>
            <strong className="next-action">
              {actionDisplayText(language, nextAction) ?? "—"}
            </strong>
            <span className="next-meta">
              {formatClock(
                ((nextEntry.expiresAt ?? now) -
                  alertLeadSeconds * 1000 -
                  now) /
                  1000,
              )}{" "}
              · {roundLabel(language, nextEntry.round)}{" "}
              {debuffDisplayName(language, nextEntry.debuff)}
            </span>
          </>
        ) : (
          <>
            <strong>--:--</strong>
            <span>{language === "ko" ? "등록된 알림 없음" : "No alerts"}</span>
          </>
        )}
      </div>
      <div className={alertReady ? "alert-ready ready" : "alert-ready"}>
        <BellRing size={16} aria-hidden="true" />
        {alertSound === "off"
          ? language === "ko"
            ? "소리 끔"
            : "Sound off"
          : alertReady
            ? language === "ko"
              ? `${alertLeadSeconds}초 전 알림`
              : `${alertLeadSeconds}s early`
            : language === "ko"
              ? "TTS 준비 중"
              : "TTS pending"}
      </div>
    </section>
  );
}

export const StatusPanel = memo(StatusPanelImpl);
