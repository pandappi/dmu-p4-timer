import { memo } from "react";

import { debuffLabel } from "../lib/actions";
import { debuffMeta, roundLabels, truthLabels } from "../lib/constants";
import type { DebuffEntry } from "../lib/types";
import { formatClock, formatDurationLabel } from "../lib/utils";

type EntryListProps = {
  entries: DebuffEntry[];
  now: number;
};

function EntryListImpl({ entries, now }: EntryListProps) {
  const inputEntries = entries.filter((entry) => entry.kind === "input");

  return (
    <section className="panel compact-list">
      <div className="panel-head">
        <h3>입력됨</h3>
        <span>{inputEntries.length}</span>
      </div>
      <div className="panel-body entry-list">
        {inputEntries.length === 0 ? (
          <p className="hint">아직 입력된 조건이 없습니다.</p>
        ) : (
          inputEntries.map((entry) => {
            const remaining = entry.expiresAt
              ? (entry.expiresAt - now) / 1000
              : null;
            return (
              <div className="entry" key={entry.id}>
                <img
                  alt=""
                  className="entry-icon"
                  src={debuffMeta[entry.debuff].icon}
                />
                <div>
                  <strong>
                    {entry.actionText ?? debuffLabel(entry.debuff, "ko")}
                  </strong>
                  <small>
                    {[
                      roundLabels[entry.round],
                      entry.round === 5 ? null : truthLabels[entry.truthState],
                      entry.source === "auto" ? "자동" : "수동",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </div>
                <div className={entry.notify ? "entry-time" : "entry-time off"}>
                  {remaining !== null
                    ? formatClock(remaining)
                    : entry.duration !== null
                      ? formatDurationLabel(entry.duration)
                      : "기록"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export const EntryList = memo(EntryListImpl);
