import { memo } from "react";

import { debuffLabel } from "../lib/actions";
import { debuffMeta, roundLabels, truthLabels } from "../lib/constants";
import type { DebuffEntry, TimerSettings } from "../lib/types";
import { formatClock } from "../lib/utils";

type EntryListProps = {
  entries: DebuffEntry[];
  now: number;
  nameLanguage: TimerSettings["nameLanguage"];
};

function EntryListImpl({ entries, now, nameLanguage }: EntryListProps) {
  return (
    <section className="panel compact-list">
      <div className="panel-head">
        <h3>등록됨</h3>
        <span>{entries.length}</span>
      </div>
      <div className="panel-body entry-list">
        {entries.length === 0 ? (
          <p className="hint">아직 등록된 디버프가 없습니다.</p>
        ) : (
          entries.map((entry) => {
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
                  <strong>{debuffLabel(entry.debuff, nameLanguage)}</strong>
                  <small>
                    {roundLabels[entry.round]} · {truthLabels[entry.truthState]}{" "}
                    · {entry.source === "auto" ? "자동" : "수동"}
                  </small>
                </div>
                <div className={entry.notify ? "entry-time" : "entry-time off"}>
                  {remaining !== null ? formatClock(remaining) : "기록"}
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
