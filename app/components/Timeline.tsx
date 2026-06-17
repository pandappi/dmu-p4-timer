import { ListChecks } from "lucide-react";
import { memo, useEffect, useMemo, useRef } from "react";

import { getEntryActionText } from "../lib/actions";
import {
  actionDisplayText,
  debuffDisplayName,
  roundLabel,
  text,
  truthLabel,
} from "../lib/i18n";
import type { DebuffEntry, Language } from "../lib/types";
import { formatClock } from "../lib/utils";

type TimelineProps = {
  compact?: boolean;
  entries: DebuffEntry[];
  language: Language;
  now: number;
  showRound5FalseWarning: boolean;
};

function TimelineImpl({
  compact = false,
  entries,
  language,
  now,
  showRound5FalseWarning,
}: TimelineProps) {
  const activeItemRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!compact || !activeItemRef.current) return;
    activeItemRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeId, compact]);

  return (
    <section className="panel timeline-panel" id="timeline-panel">
      <div className="panel-head">
        <div className="timeline-heading">
          <h3>{text(language, "timeline")}</h3>
          {showRound5FalseWarning ? (
            <span>{text(language, "timelineFalseCheck")}</span>
          ) : null}
        </div>
        <ListChecks size={18} aria-hidden="true" />
      </div>
      <div className={`panel-body timeline-list ${compact ? "compact" : ""}`}>
        {ordered.map((entry) => {
          const remaining = (entry.expiresAt! - now) / 1000;
          const expired = remaining <= 0;
          const active = entry.id === activeId;
          const bombWarning =
            entry.debuff === "Acceleration Bomb" && remaining > 0 && remaining <= 10;
          const action = getEntryActionText(entry, entries);
          const displayAction = actionDisplayText(language, action);
          const className = [
            "timeline-item",
            active ? "active" : "",
            expired ? "expired" : "",
            bombWarning ? "bomb-warning" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              className={className}
              key={entry.id}
              ref={active ? activeItemRef : null}
            >
              <div className="timeline-time">{formatClock(remaining)}</div>
              <div className="timeline-copy">
                <strong className="timeline-action">{displayAction ?? "—"}</strong>
                <span className={`timeline-meta ${entry.truthState}`}>
                  {roundLabel(language, entry.round)} ·{" "}
                  {debuffDisplayName(language, entry.debuff)} ·{" "}
                  {truthLabel(language, entry.truthState)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const Timeline = memo(TimelineImpl);
