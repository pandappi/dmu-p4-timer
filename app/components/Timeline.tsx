import { ListChecks } from "lucide-react";
import { memo, useMemo } from "react";

import { debuffLabel, getEntryActionText } from "../lib/actions";
import { roundLabels } from "../lib/constants";
import type { DebuffEntry, TimerSettings } from "../lib/types";
import { formatClock } from "../lib/utils";

type TimelineProps = {
  entries: DebuffEntry[];
  now: number;
  nameLanguage: TimerSettings["nameLanguage"];
};

function TimelineImpl({ entries, now, nameLanguage }: TimelineProps) {
  // 시간이 있는(알림 대상) 엔트리만 만료 시각 순으로 나열한다.
  const ordered = useMemo(
    () =>
      entries
        .filter((entry) => entry.notify && entry.expiresAt)
        .sort((a, b) => (a.expiresAt ?? 0) - (b.expiresAt ?? 0)),
    [entries],
  );

  // 아직 만료되지 않은 첫 항목 = 지금 처리해야 할 다음 행동.
  const activeId = ordered.find(
    (entry) => entry.expiresAt && entry.expiresAt > now,
  )?.id;

  return (
    <section className="panel timeline-panel" id="timeline-panel">
      <div className="panel-head">
        <h3>처리 순서</h3>
        <ListChecks size={18} aria-hidden="true" />
      </div>
      <div className="panel-body timeline-list">
        {ordered.map((entry) => {
          const remaining = (entry.expiresAt! - now) / 1000;
          const expired = remaining <= 0;
          const active = entry.id === activeId;
          const action = getEntryActionText(entry, entries);
          const className = [
            "timeline-item",
            active ? "active" : "",
            expired ? "expired" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div className={className} key={entry.id}>
              <div className="timeline-time">{formatClock(remaining)}</div>
              <div className="timeline-copy">
                <strong className="timeline-action">{action ?? "—"}</strong>
                <small>
                  {roundLabels[entry.round]} ·{" "}
                  {debuffLabel(entry.debuff, nameLanguage)}
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const Timeline = memo(TimelineImpl);
