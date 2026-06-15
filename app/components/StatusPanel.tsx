import { BellRing } from "lucide-react";
import { memo } from "react";

import { debuffLabel } from "../lib/actions";
import { roundLabels } from "../lib/constants";
import type { DebuffEntry, TimerSettings } from "../lib/types";
import { formatClock } from "../lib/utils";

type StatusPanelProps = {
  nextEntry: DebuffEntry | undefined;
  nextAction: string | null;
  now: number;
  alertReady: boolean;
  alertLeadSeconds: number;
  nameLanguage: TimerSettings["nameLanguage"];
};

function StatusPanelImpl({
  nextEntry,
  nextAction,
  now,
  alertReady,
  alertLeadSeconds,
  nameLanguage,
}: StatusPanelProps) {
  return (
    <section className="panel status-panel">
      <div className="next-debuff">
        <span>다음 처리</span>
        {nextEntry ? (
          <>
            <strong className="next-action">{nextAction ?? "—"}</strong>
            <span className="next-meta">
              {formatClock(
                ((nextEntry.expiresAt ?? now) -
                  alertLeadSeconds * 1000 -
                  now) /
                  1000,
              )}{" "}
              · {roundLabels[nextEntry.round]}{" "}
              {debuffLabel(nextEntry.debuff, nameLanguage)}
            </span>
          </>
        ) : (
          <>
            <strong>--:--</strong>
            <span>등록된 알림 없음</span>
          </>
        )}
      </div>
      <div className={alertReady ? "alert-ready ready" : "alert-ready"}>
        <BellRing size={16} aria-hidden="true" />
        {alertReady ? `${alertLeadSeconds}초 전 알림` : "설정에서 알림 테스트"}
      </div>
    </section>
  );
}

export const StatusPanel = memo(StatusPanelImpl);
